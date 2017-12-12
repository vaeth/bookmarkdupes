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
  fullUrl: false
};

function setVirginState() {
  bookmarkIds = null;
  state = {
    mode: "virgin",
  };
}

function sendState() {
  let message = {
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
    let total = state.total;
    state = {
      mode: (remove ? "removeSuccess" : "stripSuccess"),
      total: total
    };
    sendState();
  }

  function processError(error) {
    removeList = null;
    let total = state.total;
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
    let current = state.total;
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
  let indices = new Array();
  {
    let i = 0;
    for (let bookmark of group) {
      let index = {
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

function calculate(command) {
  let exact, folder, handleFunction, result, urlMap;

  function pushCategory() {
    if (result.categoryTitle && result.category.size) {
      result.categoryTitles.push(result.categoryTitle);
      result.categories.push(result.category);
    }
  }

  function calculateFinish(mode) {
    pushCategory();
    delete result.category;
    delete result.categoryTitle;
    if (result.categories.length <= 1) {
      delete result.categories;
      delete result.categoryTitles;
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

  function handleDupe(node, parent) {
    ++(result.all);
    let url = node.url;
    let groupIndex = url;
    let extra;
    if (!exact) {
      let index = groupIndex.indexOf("?");
      if (index > 0) {
        groupIndex = groupIndex.substring(0, index);
        extra = url.substring(index);
      }
    }
    let id = node.id;
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
    result.category.add(id);
    let bookmark = {
      id: id,
      order: ((node.dateAdded !== undefined) ? node.dateAdded : (-1)),
      text: parent + node.title,
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
    let id = node.id;
    result.category.add(id);
    let bookmark = {
      id: id,
      text: parent + node.title
    };
    result.list.push(bookmark);
  }

  function handleAll(node, parent, index) {
    let id = node.id;
    result.category.add(id);
    let bookmark = {
      id: id,
      text: parent + node.title,
      url: node.url
    };
    result.list.push(bookmark);
    bookmark = {
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

  function prepareCategory(title) {
    pushCategory();
    result.categoryTitle = title;
    result.category = new Set()
  }

  function recurse(node) {
    function recurseMain(node, parent, index) {
      if ((!node.children) || (!node.children.length)) {
        if (parent && !node.unmodifable) {
          if (folder) {
            handleFunction(node, parent);
            return;
          } else if (node.url && ((!node.type) || (node.type == "bookmark")) &&
              (node.url.substr(0, 6) !== "place:")) {
            handleFunction(node, parent, index);
          }
        }
        return;
      }
      if (node.title) {
        if (!parent) {
          prepareCategory(node.title);
        }
        parent += node.title + " | ";
      }
      index = 0;
      for (let child of node.children) {
        recurseMain(child, parent, ++index);
      }
    }

    recurseMain(node, "", 0);
  }

  function calculateDupes(nodes) {
    urlMap = new Map();
    result.all = 0;
    recurse(nodes[0]);
    urlMap = null;
    let normalizeResult = new Array();
    for (let group of result.list) {
      if (group.data.length < 2) {
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
  folder = false;
  switch (command) {
    case "calculateExactDupes":
      exact = true;
      // fallthrough
    case "calculateSimilarDupes":
      mainFunction = calculateDupes;
      handleFunction = handleDupe;
      break;
    case "calculateEmptyFolder":
      folder = true;
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
    categories: new Array(),
    categoryTitles: new Array()
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
  options.fullUrl = message.value;
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
