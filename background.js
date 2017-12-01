/* Copyright (C) 2017 Nartin Väth <martin@mvath.de>
 * This project is under the GNU public license 2.0
*/

// For documentation on the bookmark API see e.g.
// https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/bookmarks/

"use strict";

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
  return browser.bookmarks.create(bookmarkIds.get(id)).then(function () {
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
  let exact, folder, handleFunction, result, urlMap;

  function dummy() {}

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

  function handleDupe(node, parent, callback) {
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
      callback();
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
    callback();
  }

  function handleEmpty(node, parent, callback) {
    if (node.url || (node.type && (node.type != "folder"))) {
      callback();
      return;
    }
    let bookmark = {
      id: node.id,
      text: parent + node.title
    };
    result.push(bookmark);
    callback();
  }

  function handleAll(node, parent, callback, index) {
    let bookmark = {
      id: node.id,
      text: parent + node.title
    };
    result.push(bookmark);
    bookmark = {
      parentId: node.parentId,
      title: node.title,
      url: node.url,
      index: ((typedef(node.index) != "undefined") ? node.index : index)
    };
    if (typeof(node.type) != "undefined") {
      bookmark.type = node.type;
    }
    bookmarkIds.set(node.id, bookmark);
    callback();
  }

  function recurse(node, callback) {

    function recurseCount(node) {
      if ((!node.children) || (!node.children.length)) {
        if (parent && !node.unmodifiable) {
          ++(state.todo);
        }
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
          if (async) {
            ++(state.total);
            sendState();
          }
          if (folder) {
            handleFunction(node, parent, callback);
            return;
          } else if (node.url && ((!node.type) || (node.type == "bookmark"))) {
            handleFunction(node, parent, callback, index);
            return;
          }
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
        recurseMain(child, parent, ++index, dummy);
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
    result = new Array();
    recurse(nodes[0], function () {
      calculateFinish("calculatedEmptyFolder");
    });
  }

  function calculateAll(nodes) {
    bookmarkIds = new Map();
    result = new Array();
    recurse(nodes[0], function () {
      calculateFinish("calculatedAll");
    });
  }

  let mainFunction;
  exact = false;
  async = false;
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
