/* Copyright (C) 2017 Nartin Väth <martin@mvath.de>
 * This project is under the GNU public license 2.0
*/

// For documentation on the bookmark API see e.g.
// https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/bookmarks/

"use strict";

let state;
let stop;
let bookmarkIds;
let options = {
  fullUrl: false,
  extra: true
};

function setVirginState() {
  bookmarkIds = null;
  state = {
    mode: "virgin",
  };
}

function sendState() {
  const message = {
    command: "state",
    state: state,
  };
  browser.runtime.sendMessage(message);
}

function removeFolder(id, callback, errorCallback) {
  return browser.bookmarks.remove(id).then(callback, errorCallback);
}

function stripBookmark(id, callback, errorCallback) {
  return browser.bookmarks.create(bookmarkIds.get(id)).then(function () {
    browser.bookmarks.remove(id).then(callback, errorCallback);
  }, errorCallback);
}

function processMarked(remove, removeList) {

  function processFinish() {
    removeList = null;
    const total = state.total;
    state = {
      mode: (remove ? "removeSuccess" : "stripSuccess"),
      total: total
    };
    sendState();
  }

  function processError(error) {
    removeList = null;
    const total = state.total;
    state = {
      mode: (remove ? "removeError" : "stripError"),
      total: total,
      error: error
    };
    sendState();
  }

  stop = false;
  state = {
    total: 0,
    todo: removeList.length
  };
  if (!removeList.length) {
    processFinish();
    return;
  }
  let process;
  if (remove) {
    state.mode = "removeProgress";
    process = removeFolder;
  } else {
    state.mode = "stripProgress";
    process = stripBookmark;
  }

  function processRecurse() {
    const current = state.total;
    if (current == state.todo) {
      processFinish();
      return;
    }
    sendState();
    if (stop) {
      processFinish();
      return;
    }
    state.total = current + 1;
    process(removeList[current], processRecurse, processError);
  }

  processRecurse();
}

function normalizeGroup(group) {
  const indices = new Array();
  {
    let i = 0;
    for (let bookmark of group) {
      const index = {
        index: (i++),
        order: bookmark.order
      };
      indices.push(index);
    }
  }
  indices.sort(function (a, b) {
    if (a.order > b.order) {
      return 1;
    }
    if (a.order < b.order) {
      return -1;
    }
    return ((a.index > b.index) ? 1 : -1);
  });
  let order = 0;
  for (let index of indices) {
    group[index.index].order = ++order;
  }
}

function normalizeFolders(folders) {
  for (let i = 0; i < folders.length; ++i) {
    const folder = folders[i];
    if ((!folder.used) || (!folder.used.size)) {
      delete folders[i];
      continue;
    }
    parent = folder.parent;
    if ((!parent) && (parent !== 0)) {
      continue;
    }
    const used = folder.used.size;
    const parentFolder = folders[parent];
    if (parentFolder.usedByChilds) {
       parentFolder.usedByChilds += used;
    } else {
      parentFolder.usedByChilds = used;
    }
    if (!parentFolder.childs) {
      parentFolder.childs = new Set();
    }
    parentFolder.childs.add(i);
  }
  let display = 0;
  for (let folder of folders) {
    if (!folder) {
      continue;
    }
    if ((folder.childs && (folder.childs.size > 1)) ||
        (folder.used && folder.used.size && ((!folder.usedByChilds)
        || (folder.used.size > folder.usedByChilds)))) {
      folder.ids = Array.from(folder.used);  // transfer arrays instead of sets
      ++display;
    }
    delete folder.childs;
    delete folder.used;
    delete folder.usedByChilds;
  }
  return display;
}

function calculate(command) {
  let exact, folderMode, handleFunction, result, urlMap;

  function calculateFinish(mode) {
    const display = normalizeFolders(result.folders);
    if (!display) {
      delete result.folders;
    } else if (display > 1) {
      result.foldersDisplay = true;
    }
    result.options = options;
    state = {
      mode: mode,
      result: result
    };
    result = null;
    sendState();
  }

  function calculateError(error) {
    state = {
      mode: "calculateError",
      error: error
    };
    result = null;
    sendState();
  }

  function parentUsed(parent, id) {
    while (parent || (parent === 0)) {
      const folder = result.folders[parent];
      if (!folder.used) {
        folder.used = new Set();
      }
      folder.used.add(id);
      parent = folder.parent;
    }
  }

  function parentUnused(parent, id) {
    while (parent || (parent === 0)) {
      const folder = result.folders[parent];
      if (folder.used) {
        folder.used.delete(id);
        if (!folder.used.size) {
          delete folder.used;
        }
      }
      parent = folder.parent;
    }
  }

  function handleDupe(node, parent) {
    ++(result.all);
    const url = node.url;
    let groupIndex = url;
    let extra;
    if (!exact) {
      let index = groupIndex.indexOf("?");
      if (index > 0) {
        groupIndex = groupIndex.substring(0, index);
        extra = url.substring(index);
      }
    }
    const id = node.id;
    let group = urlMap.get(groupIndex);
    if (!group) {
      group = {
        data : new Array(),
        ids : new Set()
      };
      result.list.push(group);
      urlMap.set(groupIndex, group);
    } else if (group.ids.has(id)) {  // should not happen
      return;  // it is a bug if we get here
    }
    group.ids.add(id);
    parentUsed(parent, id);
    const bookmark = {
      id: id,
      order: ((node.dateAdded !== undefined) ? node.dateAdded : (-1)),
      parent: parent,
      text: node.title,
      url: url
    };
    if (extra !== undefined) {
      bookmark.extra = extra;
    }
    group.data.push(bookmark);
  }

  function handleEmpty(node, parent) {
    if (node.url || (node.type && (node.type != "folder"))) {
      return;
    }
    const id = node.id;
    parentUsed(parent, id);
    const bookmark = {
      id: id,
      parent: parent,
      text: node.title
    };
    result.list.push(bookmark);
  }

  function handleAll(node, parent, index) {
    const id = node.id;
    parentUsed(parent, id);
    const bookmarkResult = {
      id: id,
      parent: parent,
      text: node.title,
      url: node.url
    };
    result.list.push(bookmarkResult);
    const bookmark = {
      parentId: node.parentId,
      title: node.title,
      url: node.url,
      index: ((node.index !== undefined) ? node.index : index)
    };
    if (node.type !== undefined) {
      bookmark.type = node.type;
    }
    bookmarkIds.set(id, bookmark);
  }

  function recurse(node) {
    function recurseMain(node, parent, index) {
      if ((!node.children) || (!node.children.length)) {
        if ((parent !== null) && !node.unmodifable) {
          if (folderMode) {
            handleFunction(node, parent);
            return;
          } else if (node.url && ((!node.type) || (node.type == "bookmark")) &&
              (node.url.substr(0, 6) !== "place:")) {
            handleFunction(node, parent, index);
          }
        }
        return;
      }
      const folder = {
        name: node.title
      };
      if (node.title) {
        if (parent !== null) {
          folder.parent = parent;
        }
        parent = result.folders.length;
        result.folders.push(folder);
      }
      index = 0;
      for (let child of node.children) {
        recurseMain(child, parent, ++index);
      }
      if (node.title && !folder.used) {
        result.folders.pop();
      }
    }

    recurseMain(node, null, 0);
  }

  function calculateDupes(nodes) {
    urlMap = new Map();
    result.all = 0;
    recurse(nodes[0]);
    urlMap = null;
    const normalizeResult = new Array();
    for (let group of result.list) {
      if (group.data.length < 2) {
        if (group.data.length) {
          const bookmark = group.data[0];
          parentUnused(bookmark.parent, bookmark.id);
        }
        continue;
      }
      normalizeGroup(group.data);
      normalizeResult.push(group.data);
    }
    result.list = normalizeResult;
    calculateFinish(exact ? "calculatedDupesExact" : "calculatedDupesSimilar");
  }

  function calculateEmpty(nodes) {
    recurse(nodes[0]);
    calculateFinish("calculatedEmptyFolder");
  }

  function calculateAll(nodes) {
    bookmarkIds = new Map();
    recurse(nodes[0]);
    calculateFinish("calculatedAll");
  }

  bookmarkIds = null;
  let mainFunction;
  exact = false;
  folderMode = false;
  switch (command) {
    case "calculateExactDupes":
      exact = true;
      // fallthrough
    case "calculateSimilarDupes":
      mainFunction = calculateDupes;
      handleFunction = handleDupe;
      break;
    case "calculateEmptyFolder":
      folderMode = true;
      mainFunction = calculateEmpty;
      handleFunction = handleEmpty;
      break;
    case "calculateAll":
      mainFunction = calculateAll;
      handleFunction = handleAll;
      break;
    default:  // should not happen
      return;  // it is a bug if we get here
  }
  result = {
    list: new Array(),
    folders: new Array()
  }
  state = {
    mode: "calculatingProgress"
  };
  sendState();
  browser.bookmarks.getTree().then(mainFunction, calculateError);
}

function setCheckboxes(checkboxes) {
  if (!state.hasOwnProperty("result")) {  // should not happen
    return;  // It is a bug if we get here
  }
  if (checkboxes && checkboxes.length) {
    state.result.checkboxes = checkboxes;
    return;
  }
  delete state.result.checkboxes;  // send only nonempty arrays
}

function setOptions(message) {
  options.fullUrl = message.fullUrl;
  if (message.hasOwnProperty("extra")) {
    options.extra = message.extra;
  }
  setCheckboxes(message.checkboxes);
  sendState();
}

function messageListener(message) {
  if (!message.command) {
    return;
  }
  switch (message.command) {
    case "stop":
      stop = true;
      return;
    case "setCheckboxes":
      setCheckboxes(message.checkboxes);
      return;
    case "finish":
      setVirginState();
      // fallthrough
    case "sendState":
      sendState();
      return;
    case "setOptions":
      setOptions(message);
      return;
    case "remove":
      processMarked(true, message.removeList);
      return;
    case "strip":
      processMarked(false, message.removeList);
      return;
    default:
      calculate(message.command);
  }
}

setVirginState();
browser.runtime.onMessage.addListener(messageListener);

function bookmarkdupesTab() {
  const url = browser.extension.getURL("data/tab/index.html")

  function selectOrCreate(tabs) {
    for (let tab of tabs) {
      const updateProperties = {
        active: true
      };
      browser.tabs.update(tab.id, updateProperties);
      return;
    }
    const createProperties = {
      url: url,
      active: true
    }
    browser.tabs.create(createProperties);
  }

  const queryInfo = {
    url: url
  };
  browser.tabs.query(queryInfo).then(selectOrCreate);
}

browser.browserAction.onClicked.addListener(bookmarkdupesTab);
