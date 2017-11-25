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

function getProgressBar() {
  return document.getElementById("progressBar");
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

function addProgressButton(textId, percentage) {
  let parent = getProgressBar();
  if (parent.firstChild) {
    parent.firstChild.value = percentage;
    return;
  }
  let progress = document.createElement("PROGRESS");
  progress.max = 100;
  progress.value = percentage;
  parent.appendChild(progress);
  parent = getButtonStop();
  addButton(parent, "buttonStop", browser.i18n.getMessage(textId), true);
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

function clearProgressButton() {
  clearItem(getProgressBar());
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
  clearProgressButton();
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

function displayDupes(exact, result) {
  clearProgressButton();
  let total = 0;
  let groups = 0;
  for (let group of result.result) {
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
    [String(total), String(groups), String(result.all)]));
}

function displayEmpty(result) {
  clearProgressButton();
  let total = result.length;
  if (total) {
    addButtons(1);
    for (let bookmark of result) {
      addBookmark(bookmark.text, bookmark.id);
    }
  }
  displayMessage(browser.i18n.getMessage("messageEmpty", String(total)));
}

function displayAll(result) {
  clearProgressButton();
  let total = result.length;
  if (total) {
    addButtons(2);
    for (let bookmark of result) {
      addBookmark(bookmark.text, bookmark.id);
    }
  }
  displayMessage(browser.i18n.getMessage("messageAll", String(total)));
}

function sendMessageCommand(command) {
  let message = {
    command: command
  };
  browser.runtime.sendMessage(message);
}

function calculating(command) {
  clearButtonsExtra();
  clearBookmarks();
  sendMessageCommand(command);
}

function processMarked(remove) {
  displayMessage(browser.i18n.getMessage(remove ?
  "messageRemoveMarked" : "messageStripMarked"));
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
      removeList.push(checkbox.id);
    }
  }
  clearWindow();
  let message = {
    command: (remove ? "remove" : "strip"),
    removeList: removeList
  };
  browser.runtime.sendMessage(message);
}

function displayProgress(textId, buttonTextId, state) {
  let todo = state.todo;
  if (!todo) {
    displayMessage(browser.i18n.getMessage("messageCalculating"));
    return;
  }
  let total = state.total;
  let percentage = (100 * total) / todo;
  addProgressButton(buttonTextId, percentage);
  displayMessage(browser.i18n.getMessage(textId,
    [String(total), String(todo), String(Math.round(percentage))]))
}

function displayFinish(textId, state) {
  clearProgressButton();
  if (state.error) {
    displayMessage(browser.i18n.getMessage(textId,
      [state.error, String(state.total)]));
  } else {
    displayMessage(browser.i18n.getMessage(textId, String(state.total)));
  }
  sendMessageCommand("finish");
}

{
  let lock = true;

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
        calculating("calculateExactDupes");
        return;
      case "buttonListSimilarDupes":
        calculating("calculateSimilarDupes");
        return;
      case "buttonListEmpty":
        calculating("calculateEmptyFolder");
        return;
      case "buttonListAll":
        calculating("calculateAll");
        return;
      case "buttonRemoveMarked":
        processMarked(true);
        return;
      case "buttonStripMarked":
        processMarked(false);
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
      case "calculatingProgress":
        displayProgress("messageCalculateProgress", "buttonStopCalculating",
          state);
        return;
      case "calculatedDupesExact":
        displayDupes(true, state.result)
        break;
      case "calculatedDupesSimilar":
        displayDupes(false, state.result);
        break;
      case "calculatedEmptyFolder":
        displayEmpty(state.result);
        break;
      case "calculatedAll":
        displayAll(state.result);
        break;
      case "virgin":
        break;
      case "removeSuccess":
        displayFinish("messageRemoveSuccess", state);
        return;
      case "stripSuccess":
        displayFinish("messageStripSuccess", state);
        return;
      case "removeError":
        displayFinish("messageRemoveError", state);
        return;
      case "stripError":
        displayFinish("messageStripError", state);
        return;
      case "calculateError":
        displayFinish("messageCalculateError", state);
        return;
      default:  // should not happen
        displayMessage(state.mode);
        return;
    }
    unlock();
  }

  browser.runtime.onMessage.addListener(messageListener);
}
sendMessageCommand("sendState");
