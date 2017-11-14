/* Copyright (C) 2017 Nartin Väth <martin@mvath.de>
 * This project is under the GNU public license 2.0
*/

// For documentation on the bookmark API see e.g.
// https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/bookmarks/

"use strict";

function getButtonsBase() {
  return document.getElementById("buttonsBase");
}

function getButtonsExtra() {
  return document.getElementById("buttonsExtra");
}

function getButtonsRemove() {
  return document.getElementById("buttonsRemove");
}

function getButtonStop() {
  return document.getElementById("buttonStop");
}

function getTop() {
  return document.getElementById("tableBookmarks");
}

function displayMessage(msg) {
  document.getElementById("textMessage").textContent = msg;
}

function addButton(parent, id, text, enabled) {
  let button = document.createElement("BUTTON");
  button.type = "button";
  button.id = id;
  if (!text) {
    text = browser.i18n.getMessage(id);
  }
  button.textContent = text;
  if (!enabled) {
    button.disabled = true;
  }
  parent.appendChild(button);
}

function addButtons(mode) {
  let parent = getButtonsExtra();
  if (mode) {
    addButton(parent, "buttonMarkAll");
  } else {
    addButton(parent, "buttonMarkButFirst");
    addButton(parent, "buttonMarkButLast");
  }
  addButton(parent, "buttonUnmarkAll");
  parent = getButtonsRemove();
  addButton(parent, (mode == 2) ? "buttonStripMarked" : "buttonRemoveMarked");
}

function addButtonStop(text) {
  let parent = getButtonStop();
  if (parent.firstChild) {
    return;
  }
  addButton(parent, "buttonStop", text, true);
}

function enableButtonsOf(top, enabled) {
  if (!top.hasChildNodes()) {
    return;
  }
  let disabled = ((typeof(enabled) != "undefined") && !enabled);
  for (let child of top.childNodes) {
    if (child.nodeName == "BUTTON") {
      child.disabled = disabled;
    }
  }
}

function enableButtonsBase(enabled) {
  enableButtonsOf(getButtonsBase(), enabled);
}

function enableButtons(enabled) {
  enableButtonsBase(enabled);
  enableButtonsOf(getButtonsExtra(), enabled);
  enableButtonsOf(getButtonsRemove(), enabled);
}

function clearItem(top) {
  while (top.lastChild) {
    top.removeChild(top.lastChild);
  }
}

function clearButtonStop() {
  clearItem(getButtonStop());
}

function clearButtonsExtra() {
  clearItem(getButtonsExtra());
  clearItem(getButtonsRemove());
}

function clearBookmarks() {
  clearItem(getTop());
}

function clearWindow() {
  clearButtonStop();
  clearButtonsExtra();
  clearBookmarks();
}

function addRuler() {
  let ruler = document.createElement("HR");
  let top = getTop();
  top.appendChild(ruler);
}

function addBookmark(text, id) {
  let checkbox = document.createElement("INPUT");
  checkbox.type = "checkbox";
  checkbox.checked = false;
  checkbox.id = id;
  let col = document.createElement("TD");
  col.appendChild(checkbox);
  let textNode = document.createTextNode(text);
  col.appendChild(textNode);
  let row = document.createElement("TR");
  row.appendChild(col);
  let top = getTop();
  top.appendChild(row);
}

function getCheckbox(node) {
  return node.firstChild.firstChild;
}

function setCheck(node, checked) {
  getCheckbox(node).checked = checked;
}

function mark(mode) {
  let top = getTop();
  if (!top.hasChildNodes()) {
    return;
  }
  let first = true;
  let prev = null;
  for (let child of top.childNodes) {
    if (child.nodeName != "TR") {
      first = true;
      if ((mode < 0) && (prev != null)) {
        setCheck(prev, false);
      }
      prev = null;
      continue;
    }
    if (mode < 0) {
      if (prev != null) {
        setCheck(prev, true);
      }
      prev = child;
      continue;
    }
    setCheck(child, ((mode == 2) || (mode && !first)));
    first = false;
  }
  if ((mode < 0) && (prev != null)) {
    setCheck(prev, false);
  }
}

function calculate(mode, callback, bookmarkIds) {
  let exact, handleFunction, result, urlMap;

  function handleDupe(node, parent) {
    if ((!node.url) || (node.type && node.type != "bookmark")) {
      return;
    }
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
      result.push(group);
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

  function recurse(node, parent = "", index = 0) {
    if ((!node.children) || (!node.children.length)) {
      if (parent && !node.unmodifiable) {
        handleFunction(node, parent, index);
      }
      return;
    }
    if (node.title) {
      parent += node.title + " | ";
    }
    index = 0;
    for (let child of node.children) {
      recurse(child, parent, ++index);
    }
  }

  function calculateDupes(nodes) {
    handleFunction = handleDupe;
    urlMap = new Map();
    result = new Array();
    recurse(nodes[0]);
    let total = 0;
    let groups = 0;
    for (let group of result) {
      if (group.data.length < 2) {
        continue;
      }
      if (groups++ == 0) {
        addButtons(0);
      } else {
        addRuler();
      }
      for (let bookmark of group.data) {
        ++total;
        let text = bookmark.text;
        if (typeof(bookmark.extra) != "undefined") {
          text += " (" + bookmark.extra + ")";
        }
        addBookmark(text, bookmark.id);
      }
    }
    displayMessage(browser.i18n.getMessage((exact ?
      "messageExactMatchesGroups" : "messageSimilarMatchesGroups"),
      [String(total), String(groups)]));
  }

  function calculateEmpty(nodes) {
    handleFunction = handleEmpty;
    result = new Array();
    recurse(nodes[0]);
    let total = result.length;
    if (total) {
      addButtons(1);
      for (let bookmark of result) {
        addBookmark(bookmark.text, bookmark.id);
      }
    }
    displayMessage(browser.i18n.getMessage("messageEmpty", String(total)));
  }

  function calculateAll(nodes) {
    handleFunction = handleAll;
    result = new Array();
    recurse(nodes[0]);
    let total = result.length;
    if (total) {
      addButtons(2);
      for (let bookmark of result) {
        addBookmark(bookmark.text, bookmark.id);
      }
    }
    displayMessage(browser.i18n.getMessage("messageAll", String(total)));
  }

  displayMessage(browser.i18n.getMessage("messageCalculating"));
  clearButtonsExtra();
  clearBookmarks();
  let mainFunction;
  switch (mode) {
    case 0:
      exact = true;
      // fallthrough
    case 1:
      mainFunction = calculateDupes;
      break;
    case 2:
      mainFunction = calculateEmpty;
      break;
    default:
      mainFunction = calculateAll;
  }
  browser.bookmarks.getTree().then(mainFunction, function (error) {
    displayMessage(browser.i18n.getMessage("messageCalculatingError", error));
  }).then(callback, callback);
}

function processMarked(transferBookmarkIds) {
  let remove, bookmarkIds;
  if (transferBookmarkIds) {
    displayMessage(browser.i18n.getMessage("messageStripMarked"));
    remove = false;
    bookmarkIds = transferBookmarkIds();
  } else {
    displayMessage(browser.i18n.getMessage("messageRemoveMarked"));
    remove = true;
  }
  let top = getTop();
  let removeList = new Array;
  if (top.hasChildNodes()) {
    for (let child of top.childNodes) {
      if (child.nodeName != "TR") {
        continue;
      }
      let checkbox = getCheckbox(child);
      if (!checkbox.checked) {
        continue;
      }
      let id = checkbox.id;
      if (remove) {
        removeList.push(id);
        continue;
      }
      let strip = {
        id: id,
        bookmark: bookmarkIds.get(id)
      };
      removeList.push(strip);
    }
  }
  bookmarkIds = {};
  clearWindow();
  let message = {
    command: (remove ? "remove" : "strip"),
    removeList: removeList
  };
  browser.runtime.sendMessage(message);
}

function sendMessageCommand(command) {
  let message = {
    command: command
  };
  browser.runtime.sendMessage(message);
}

function displayProgress(textId, buttonId, state) {
  let total = state.total;
  let todo = state.todo;
  if (todo) {
    addButtonStop(browser.i18n.getMessage(buttonId));
  }
  displayMessage(browser.i18n.getMessage(textId,
    [String(total), String(todo), String(Math.round((100 * total) / todo))]));
}

function displayFinish(textId, state) {
  clearButtonStop();
  if (state.error) {
    displayMessage(browser.i18n.getMessage(textId,
      [state.error, String(state.total)]));
    return;
  }
  displayMessage(browser.i18n.getMessage(textId, String(state.total)));
}

{
  let lock = true;
  let bookmarkIds;

  function transferBookmarkIds() {
    let r = bookmarkIds;
    bookmarkIds = {};
    return r;
  }

  function unlock() {
    lock = false;
    enableButtons();
  }

  function clickListener(event) {
    if ((!event.target) || (!event.target.id)) {
      return;
    }
    if (event.target.id == "buttonStop") {
      sendMessageCommand("stop");
      return;
    }
    if (lock || (event.button && (event.button != 1)) ||
      (event.buttons && (event.buttons != 1))) {
      return;
    }
    lock = true;
    enableButtons(false);
    switch (event.target.id) {
      case "buttonListExactDupes":
        calculate(0, unlock);
        return;
      case "buttonListSimilarDupes":
        calculate(1, unlock);
        return;
      case "buttonListEmpty":
        calculate(2, unlock);
        return;
      case "buttonListAll":
        bookmarkIds = new Map;
        calculate(3, unlock, bookmarkIds);
        return;
      case "buttonRemoveMarked":
        processMarked(null);
        return;
      case "buttonStripMarked":
        processMarked(transferBookmarkIds);
        return;
      case "buttonMarkAll":
        mark(2);
        break;
      case "buttonMarkButFirst":
        mark(1);
        break;
      case "buttonMarkButLast":
        mark(-1);
        break;
      case "buttonUnmarkAll":
        mark(0);
        break;
    }
    unlock();
  }

  let parent = getButtonsBase();
  addButton(parent, "buttonListExactDupes");
  addButton(parent, "buttonListSimilarDupes");
  addButton(parent, "buttonListEmpty");
  addButton(parent, "buttonListAll");
  document.addEventListener("click", clickListener);

  function messageListener(message) {
    if (message.command !== "state") {
      return;
    }
    let state = message.state;
    switch (state.mode) {
      case "removeProgress":
        displayProgress("messageRemoveProgress", "buttonStopRemoving", state);
        return;
      case "stripProgress":
        displayProgress("messageStripProgress", "buttonStopStripping", state);
        return;
      case "virgin":
        break;
      case "removeSuccess":
        displayFinish("messageRemoveSuccess", state);
        break;
      case "stripSuccess":
        displayFinish("messageStripSuccess", state);
        break;
      case "removeError":
        displayFinish("messageRemoveError", state);
        break;
      case "stripError":
        displayFinish("messageStripError", state);
        break;
      case "debug":
        displayMessage(state.debug);
        break;
      default:  // should not happen
        return;
    }
    unlock();
  }

  browser.runtime.onMessage.addListener(messageListener);
}
sendMessageCommand("sendState");
