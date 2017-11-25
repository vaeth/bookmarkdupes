/* Copyright (C) 2017 Nartin Väth <martin@mvath.de>
 * This project is under the GNU public license 2.0
*/

let state;
let stop;
let bookmarkIds;

function setVirginState() {
  bookmarkIds = {};
  state = {
    mode: "virgin"
  };
}

function sendState() {
  let message = {
    command: "state",
    state: state
  };
  browser.runtime.sendMessage(message);
}

function removeFolder(id, callback, errorCallback) {
  return browser.bookmarks.remove(id).then(callback, errorCallback);
}

function stripBookmark(id, callback, errorCallback) {
  return browser.bookmarks.create(bookmarkIds[id]).then(function () {
    browser.bookmarks.remove(id).then(callback, errorCallback);
  }, errorCallback);
}

function processMarked(remove, removeList) {

  function processFinish() {
    removeList = {};
    let total = state.total;
    state = {
      mode: (remove ? "removeSuccess" : "stripSuccess"),
      total: total
    };
    sendState();
  }

  function processError(error) {
    removeList = {};
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

function calculate(command, async) {
  let exact, handleFunction, result, urlMap;

  function calculateFinish(mode) {
    state = {
      mode: mode,
      result: result
    };
    result = {};
    sendState();
  }

  function calculateError(error) {
    state = {
      mode: "calculateError",
      error: error
    };
    result = {};
    sendState();
  }

  function calculateCount() {
     if (counting) {
       ++(state.todo);
       return true;
     }
     ++(state.total);
     sendState();
     return false;
  }

  function handleDupe(node, parent) {
    if ((!node.url) || (node.type && node.type != "bookmark")) {
      return;
    }
    ++(result.all);
    let groupIndex = node.url;
    let extra;
    if (!exact) {
      let index = groupIndex.indexOf("?");
      if (index > 0) {
        groupIndex = groupIndex.substring(0, index);
        extra = node.url.substring(index);
      }
    }
    let id = node.id;
    let group = urlMap.get(groupIndex);
    if (typeof(group) == "undefined") {
      group = {
        data : new Array(),
        ids : new Set()
      };
      result.result.push(group);
      urlMap.set(groupIndex, group);
    } else if (group.ids.has(id)) {
      return;
    }
    group.ids.add(id);
    let bookmark = {
      id: id,
      text: parent + node.title
    };
    if (typeof(extra) != "undefined") {
      bookmark.extra = extra;
    }
    group.data.push(bookmark);
  }

  function handleEmpty(node, parent) {
    if (node.url || (node.type && (node.type != "folder"))) {
      return;
    }
    let bookmark = {
      id: node.id,
      text: parent + node.title
    };
    result.push(bookmark);
  }

  function handleAll(node, parent, index) {
    if ((!node.url) || (node.type && node.type != "bookmark")) {
      return;
    }
    let bookmark = {
      id: node.id,
      text: parent + node.title,
    };
    result.push(bookmark);
    bookmark = {
      parentId: node.parentId,
      title: node.title,
      url: node.url,
      index: index
    };
    if (typeof(node.type) != "undefined") {
      bookmark.type = node.type;
    }
    bookmarkIds.set(node.id, bookmark);
  }

  function recurse(node, callback) {

    function recurseCount(node) {
      if ((!node.children) || (!node.children.length)) {
        ++(state.todo);
        return;
      }
      for (let child of node.children) {
        recurseCount(child);
      }
    }

    function recurseMain(node, parent, index, callback) {
      if (stop) {
        callback();
        return;
      }
      if ((!node.children) || (!node.children.length)) {
        if (parent && !node.unmodifiable) {
          handleFunction(node, parent, index);
        }
        if (async) {
          ++(state.total);
          sendState();
        }
        callback();
        return;
      }
      if (node.title) {
        parent += node.title + " | ";
      }
      if (async) {
        recurseChilds(node, parent, 0, callback);
        return;
      }
      index = 0;
      for (let child of node.children) {
        recurseMain(child, parent, ++index, function () {});
      }
      callback();
    }

    function recurseChilds(node, parent, index, callback) {
      if (index == node.children.length) {
        callback();
        return;
      }
      setTimeout(function () {
        recurseMain(node.children[index], parent, index, function() {
          recurseChilds(node, parent, index + 1, callback);
        });
      }, 0);
    }

    if (async) {
       recurseCount(node);
    }
    recurseMain(node, "", 0, callback);
  }

  function calculateDupes(nodes) {
    handleFunction = handleDupe;
    urlMap = new Map();
    result = {
      result: new Array(),
      all: 0
    };
    recurse(nodes[0], function() {
      urlMap = {};
      calculateFinish(exact ?
        "calculatedDupesExact" : "calculatedDupesSimilar");
    });
  }

  function calculateEmpty(nodes) {
    handleFunction = handleEmpty;
    result = new Array();
    recurse(nodes[0], function () {
      calculateFinish("calculatedEmptyFolder");
    });
  }

  function calculateAll(nodes) {
    handleFunction = handleAll;
    bookmarkIds = new Map();
    result = new Array();
    recurse(nodes[0], function () {
      calculateFinish("calculatedAll");
    });
  }

  let mainFunction;
  exact = false;
  async = false;
  switch (command) {
    case "calculateExactDupes":
      exact = true;
      // fallthrough
    case "calculateSimilarDupes":
      mainFunction = calculateDupes;
      break;
    case "calculateEmptyFolder":
      mainFunction = calculateEmpty;
      break;
    case "calculateAll":
      mainFunction = calculateAll;
      break;
    default:  // should not happen
      return;
  }
  stop = false;
  state = {
    mode: "calculatingProgress",
    total: 0,
    todo: 0
  };
  sendState();
  browser.bookmarks.getTree().then(mainFunction, calculateError);
}

function messageListener(message) {
  if (!message.command) {
    return;
  }
  switch (message.command) {
    case "stop":
      stop = true;
      return;
    case "finish":
      setVirginState();
      // fallthrough
    case "sendState":
      sendState();
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
