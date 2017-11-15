/* Copyright (C) 2017 Nartin Väth <martin@mvath.de>
 * This project is under the GNU public license 2.0
*/

let state;
let stop;

function removeFolder(id, callback, errorCallback) {
  return browser.bookmarks.remove(id).then(callback, errorCallback);
}

function stripBookmark(strip, callback, errorCallback) {
  return browser.bookmarks.create(strip.bookmark).then(function () {
    browser.bookmarks.remove(strip.id).then(callback, errorCallback);
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

function setVirginState() {
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
  }
}

setVirginState();
browser.runtime.onMessage.addListener(messageListener);
