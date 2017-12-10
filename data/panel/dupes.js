/* Copyright (C) 2017 Nartin Väth <martin@mvath.de>
 * This project is under the GNU public license 2.0
*/

"use strict";

function getButtonsBase() {
  return document.getElementById("buttonsBase");
}

function getButtonsRemove() {
  return document.getElementById("buttonsRemove");
}

function getButtonsMark() {
  return document.getElementById("buttonsMark");
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

function addButtonCol(row, id, text, enabled) {
  let col = document.createElement("TD");
  addButton(col, id, text, enabled);
  row.appendChild(col);
}

function addRemoveButton(infoId, buttonId) {
  let col = document.createElement("TD");
  let text = document.createTextNode(browser.i18n.getMessage(infoId));
  col.appendChild(text);
  let row = document.createElement("TR");
  row.appendChild(col);
  addButtonCol(row, buttonId);
  let parent = getButtonsRemove();
  parent.appendChild(row);
}

function addButtonsCategories(categoryTitles) {
  if ((categoryTitles === undefined) || !(categoryTitles.length)) {
    return;
  }
  let parent = getButtonsMark();
  for (let i = 0; i < categoryTitles.length; ++i) {
    let title = categoryTitles[i];
    let row =  document.createElement("TR");
    addButtonCol(row, "markCategory?id=" + String(i),
      browser.i18n.getMessage("buttonMarkCategory", title));
    addButtonCol(row, "unmarkCategory?id=" + String(i),
      browser.i18n.getMessage("buttonUnmarkCategory", title));
    parent.appendChild(row);
  }
}

function addButtonsMark(mode) {
  let parent = getButtonsMark();
  if (mode == 0) {
    let row = document.createElement("TR");
    addButtonCol(row, "buttonMarkButFirst");
    addButtonCol(row, "buttonMarkButLast");
    parent.appendChild(row);
    row = document.createElement("TR");
    addButtonCol(row, "buttonMarkButOldest");
    addButtonCol(row, "buttonMarkButNewest");
    parent.appendChild(row);
  }
  let row = document.createElement("TR");
  addButtonCol(row, "buttonMarkAll");
  addButton(row, "buttonUnmarkAll");
  parent.appendChild(row);
}

function addButtonsMode(mode, categoryTitles) {
  if (mode == 2) {
    addRemoveButton("messageStripInfo", "buttonStripMarked");
  } else {
    addRemoveButton("messageRemoveInfo", "buttonRemoveMarked");
  }
  addButtonsMark(mode);
  addButtonsCategories(categoryTitles);
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
  enableButtonsOf(getButtonsRemove(), enabled);
  enableButtonsOf(getButtonsMark(), enabled);
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

function clearButtonsMode() {
  clearItem(getButtonsRemove());
  clearItem(getButtonsMark());
}

function clearBookmarks() {
  displayCount("");
  clearItem(getTop());
}

function clearWindow() {
  clearProgressButton();
  clearButtonsMode();
  clearBookmarks();
}

function addRuler() {
  let ruler = document.createElement("HR");
  let col = document.createElement("TD");
  col.colSpan = 4;
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

function SplitNumber(text, begin) {
  if (text.substring(0, begin.length) !== begin) {
    return -1;
  }
  return Number(text.substring(begin.length));
}

function markCategories(buttonId, categories) {
  let enable = false;
  let id = SplitNumber(buttonId, "unmarkCategory?id=");
  if (id < 0) {
    id = SplitNumber(buttonId, "markCategory?id=");
    if (id < 0) {
      return;
    }
    enable = true;
  }
  let category = categories[id];
  let top = getTop();
  if (!top.hasChildNodes()) {
    return;
  }
  for (let node of top.childNodes) {
    if (!isCheckbox(node)) {
      continue;
    }
    let checkbox = getCheckbox(node);
    if (!category.has(checkbox.id)) {
      continue;
    }
    checkbox.checked = enable;
  }
}

function displayDupes(exact, result) {
  clearProgressButton();
  let total = 0;
  let groups = result.list.length;
  let returnValue = false;
  let addButtonsOrRuler = function (categoryTitles) {
    returnValue = true;
    addButtonsOrRuler = addRuler;
    addButtonsMode(0, categoryTitles);
  };
  for (let group of result.list) {
    addButtonsOrRuler(result.categoryTitles);
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
  let total = result.list.length;
  displayMessage(browser.i18n.getMessage("messageEmpty", String(total)));
  if (!total) {
    return false;
  }
  addButtonsMode(1, result.categoryTitles);
  for (let bookmark of result.list) {
    addBookmark(bookmark.text, bookmark.id);
  }
  return true;
}

function displayAll(result) {
  clearProgressButton();
  let total = result.list.length;
  displayMessage(browser.i18n.getMessage("messageAll", String(total)));
  if (!total) {
    return false;
  }
  addButtonsMode(2, result.categoryTitles);
  for (let bookmark of result.list) {
    addBookmark(bookmark.text, bookmark.id);
  }
  return true;
}

function sendMessageCommand(command) {
  let message = {
    command: command
  };
  browser.runtime.sendMessage(message);
}

function calculating(command) {
  clearWindow();
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
  let categories;

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
      default:
        markCategories(event.target.id, categories);
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
    categories = count = null;
    let selectMode;
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
        selectMode = displayDupes(true, state.result);
        break;
      case "calculatedDupesSimilar":
        selectMode = displayDupes(false, state.result);
        break;
      case "calculatedEmptyFolder":
        selectMode = displayEmpty(state.result);
        break;
      case "calculatedAll":
        selectMode = displayAll(state.result);
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
    if (selectMode) {
      count = -1;
      checkboxListener();
      if ((state.result !== undefined) &&
        (state.result.categories !== undefined)) {
        categories = state.result.categories;
      }
    }
    unlock();
  }

  browser.runtime.onMessage.addListener(messageListener);
}
sendMessageCommand("sendState");
