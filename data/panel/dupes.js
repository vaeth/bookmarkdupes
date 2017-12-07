/* Copyright (C) 2017 Nartin Väth <martin@mvath.de>
 * This project is under the GNU public license 2.0
*/

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

function displayCount(msg) {
  document.getElementById("textCount").textContent = msg;
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
    addButton(parent, "buttonMarkButOldest");
    addButton(parent, "buttonMarkButNewest");
  }
  addButton(parent, "buttonUnmarkAll");
  let row = document.createElement("TR");
  let col = document.createElement("TD");
  let text = document.createTextNode(browser.i18n.getMessage((mode == 2) ?
    "messageStripInfo" : "messageRemoveInfo"));
  col.appendChild(text);
  row.appendChild(col);
  col = document.createElement("TD");
  addButton(col, (mode == 2) ? "buttonStripMarked" : "buttonRemoveMarked");
  row.appendChild(col);
  parent = getButtonsRemove();
  parent.appendChild(row);
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
  let disabled = ((enabled !== undefined) && !enabled);
  for (let child of top.childNodes) {
    if (child.nodeName == "BUTTON") {
      child.disabled = disabled;
    } else {
      enableButtonsOf(child, enabled);
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
  displayCount("");
  clearItem(getTop());
}

function clearWindow() {
  clearProgressButton();
  clearButtonsExtra();
  clearBookmarks();
}

function addRuler() {
  let ruler = document.createElement("HR");
  let col = document.createElement("TD");
  col.colSpan = 3;
  col.appendChild(ruler);
  let row =  document.createElement("TR");
  row.appendChild(col);
  let top = getTop();
  top.appendChild(row);
}

function addBookmark(text, id, nr) {
  let checkbox = document.createElement("INPUT");
  checkbox.type = "checkbox";
  checkbox.checked = false;
  checkbox.id = id;
  let col = document.createElement("TD");
  col.appendChild(checkbox);
  let row = document.createElement("TR");
  row.appendChild(col);
  if (nr !== undefined) {
    let nrNode = document.createTextNode(String(nr));
    col = document.createElement("TD");
    col.appendChild(nrNode);
    row.appendChild(col);
  }
  col = document.createElement("TD");
  row.appendChild(col);
  let textNode = document.createTextNode(text);
  col = document.createElement("TD");
  col.appendChild(textNode);
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

function isCheckbox(node) {
  return ((getCheckbox(node).nodeName) == "INPUT");
}

function getOrder(node) {
  return Number(node.childNodes[1].firstChild.nodeValue);
}

function mark(mode) {
  let top = getTop();
  if (!top.hasChildNodes()) {
    return;
  }
  for (let node of top.childNodes) {
    if (isCheckbox(node)) {
      setCheck(node, mode);
    }
  }
}

function markButFirst() {
  let top = getTop();
  if (!top.hasChildNodes()) {
    return;
  }
  let mark = false;
  for (let node of top.childNodes) {
    if (!isCheckbox(node)) {
      mark = false;
      continue;
    }
    setCheck(node, mark);
    mark = true;
  }
}

function markButLast() {
  let top = getTop();
  if (!top.hasChildNodes()) {
    return;
  }
  let previousNode = null;
  for (let node of top.childNodes) {
    if (!isCheckbox(node)) {
      if (previousNode !== null) {
        setCheck(previousNode, false);
        previousNode = null;
      }
      continue;
    }
    if (previousNode !== null) {
      setCheck(previousNode, true);
    }
    previousNode = node;
  }
  if (previousNode !== null) {
    setCheck(previousNode, false);
  }
}

function markButOldest() {
  let top = getTop();
  if (!top.hasChildNodes()) {
    return;
  }
  for (let node of top.childNodes) {
    if (isCheckbox(node)) {
      setCheck(node, (getOrder(node) != 1));
    }
  }
}

function markButNewest() {
  let top = getTop();
  if (!top.hasChildNodes()) {
    return;
  }
  let largestSeen = 1;
  let largestNode = null;
  for (let node of top.childNodes) {
    if (!isCheckbox(node)) {
      if (largestNode !== null) {
        setCheck(largestNode, false);
        largestNode = null;
      }
      largestSeen = 1;
      continue;
    }
    let current = getOrder(node);
    if (current <= largestSeen) {
      setCheck(node, true);
      continue;
    }
    if (largestNode !== null) {
      setCheck(largestNode, true);
    }
    largestSeen = current;
    largestNode = node;
  }
  if (largestNode !== null) {
    setCheck(largestNode, false);
  }
}

function displayDupes(exact, result) {
  clearProgressButton();
  let total = 0;
  let groups = result.result.length;
  let returnValue = null;
  let addButtonsOrRuler = function () {
    returnValue = -1;
    addButtons(0);
    addButtonsOrRuler = addRuler;
  };
  for (let group of result.result) {
    addButtonsOrRuler();
    for (let bookmark of group) {
      ++total;
      let text = bookmark.text;
      if (bookmark.extra !== undefined) {
        text += " (" + bookmark.extra + ")";
      }
      addBookmark(text, bookmark.id, bookmark.order);
    }
  }
  displayMessage(browser.i18n.getMessage((exact ?
    "messageExactMatchesGroups" : "messageSimilarMatchesGroups"),
    [String(total), String(groups), String(result.all)]));
  return returnValue;
}

function displayEmpty(result) {
  clearProgressButton();
  let total = result.length;
  displayMessage(browser.i18n.getMessage("messageEmpty", String(total)));
  if (!total) {
    return null;
  }
  addButtons(1);
  for (let bookmark of result) {
    addBookmark(bookmark.text, bookmark.id);
  }
  return -1;
}

function displayAll(result) {
  clearProgressButton();
  let total = result.length;
  displayMessage(browser.i18n.getMessage("messageAll", String(total)));
  if (!total) {
    return null;
  }
  addButtons(2);
  for (let bookmark of result) {
    addBookmark(bookmark.text, bookmark.id);
  }
  return -1;
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

function pushMarked(idList) {
  let top = getTop();
  if (!top.hasChildNodes()) {
    return 0;
  }
  let count = 0;
  for (let node of top.childNodes) {
    if (!isCheckbox(node)) {
      continue;
    }
    let checkbox = getCheckbox(node);
    if (!checkbox.checked) {
      continue;
    }
    if (idList !== undefined) {
      idList.push(checkbox.id);
    } else {
      ++count;
    }
  }
  return count;
}

function processMarked(remove) {
  displayMessage(browser.i18n.getMessage(remove ?
  "messageRemoveMarked" : "messageStripMarked"));
  let removeList = new Array;
  pushMarked(removeList);
  clearWindow();
  let message = {
    command: (remove ? "remove" : "strip"),
    removeList: removeList
  };
  browser.runtime.sendMessage(message);
}

function displayProgress(textId, buttonTextId, state) {
  let todo = state.todo;
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
  let count = null;

  function unlock() {
    lock = false;
    enableButtons();
  }

  function checkboxListener() {
    if (count === null) {
      return;
    }
    let currentCount = pushMarked();
    if (currentCount == count) {
      return;
    }
    count = currentCount;
    displayCount(browser.i18n.getMessage("messageCount", currentCount));
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
        mark(true);
        break;
      case "buttonMarkButFirst":
        markButFirst();
        break;
      case "buttonMarkButLast":
        markButLast();
        break;
      case "buttonMarkButOldest":
        markButOldest();
        break;
      case "buttonMarkButNewest":
        markButNewest();
        break;
      case "buttonUnmarkAll":
        mark(false);
        break;
    }
    checkboxListener();
    unlock();
  }

  let parent = getButtonsBase();
  addButton(parent, "buttonListExactDupes");
  addButton(parent, "buttonListSimilarDupes");
  addButton(parent, "buttonListEmpty");
  addButton(parent, "buttonListAll");
  document.addEventListener("click", clickListener);
  document.addEventListener("CheckboxStateChange", checkboxListener);

  function messageListener(message) {
    if (message.command !== "state") {
      return;
    }
    let state = message.state;
    count = null;
    switch (state.mode) {
      case "removeProgress":
        displayProgress("messageRemoveProgress", "buttonStopRemoving", state);
        return;
      case "stripProgress":
        displayProgress("messageStripProgress", "buttonStopStripping", state);
        return;
      case "calculatingProgress":
        displayMessage(browser.i18n.getMessage("messageCalculating"));
        return;
      case "calculatedDupesExact":
        count = displayDupes(true, state.result)
        break;
      case "calculatedDupesSimilar":
        count = displayDupes(false, state.result);
        break;
      case "calculatedEmptyFolder":
        count = displayEmpty(state.result);
        break;
      case "calculatedAll":
        count = displayAll(state.result);
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
    checkboxListener();
    unlock();
  }

  browser.runtime.onMessage.addListener(messageListener);
}
sendMessageCommand("sendState");
