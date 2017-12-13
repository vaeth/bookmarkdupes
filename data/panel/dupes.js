/* Copyright (C) 2017 Nartin Väth <martin@mvath.de>
 * This project is under the GNU public license 2.0
*/

"use strict";

function getButtonsBase() {
  return document.getElementById("buttonsBase");
}

function getCheckboxOptions() {
  return document.getElementById("checkboxOptions");
}

function getButtonsRemove() {
  return document.getElementById("buttonsRemove");
}

function getButtonsMark() {
  return document.getElementById("buttonsMark");
}

function getButtonsCategories() {
  return document.getElementById("buttonsCategories");
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

function getCheckboxFullUrl() {
  return document.getElementById("checkboxFullUrl");
}

function getCheckboxExtra() {
  return document.getElementById("checkboxExtra");
}

function appendTextNodeCol(row, text) {
  let col = document.createElement("TD");
  let textNode = document.createTextNode(text);
  col.appendChild(textNode);
  row.appendChild(col);
}

function appendCheckbox(parent, id, checked, disabled) {
  let checkbox = document.createElement("INPUT");
  checkbox.type = "checkbox";
  checkbox.checked = checked;
  checkbox.id = id;
  if (disabled === true) {
    checkbox.disabled = true;
  }
  parent.appendChild(checkbox);
}

function appendCheckboxCol(row, id, checked, disabled) {
  let col = document.createElement("TD");
  appendCheckbox(col, id, checked, disabled);
  row.appendChild(col);
}

function appendButton(parent, id, text, enabled) {
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

function appendButtonCol(row, id, text, enabled) {
  let col = document.createElement("TD");
  appendButton(col, id, text, enabled);
  row.appendChild(col);
}

function addButtonsBase() {
  let parent = getButtonsBase();
  if (parent.hasChildNodes()) {  // Already done
    return;
  }
  let row = document.createElement("TR");
  appendButtonCol(row, "buttonListExactDupes");
  appendButtonCol(row, "buttonListSimilarDupes");
  appendButtonCol(row, "buttonListEmpty");
  appendButtonCol(row, "buttonListAll");
  parent.appendChild(row);
}

function addButtonRemove(infoId, buttonId) {
  let row = document.createElement("TR");
  appendTextNodeCol(row, browser.i18n.getMessage(infoId));
  appendButtonCol(row, buttonId);
  let parent = getButtonsRemove();
  parent.appendChild(row);
}

function addButtonsCategories(mode, categoryTitles) {
  if ((!categoryTitles) || !(categoryTitles.length)) {
    return;
  }
  let parent = (mode ? getButtonsMark() : getButtonsCategories());
  for (let i = 0; i < categoryTitles.length; ++i) {
    let title = categoryTitles[i];
    let row =  document.createElement("TR");
    appendButtonCol(row, "markCategory?id=" + String(i),
      browser.i18n.getMessage("buttonMarkCategory", title));
    appendButtonCol(row, "unmarkCategory?id=" + String(i),
      browser.i18n.getMessage("buttonUnmarkCategory", title));
    if (!mode) {
      appendButtonCol(row, "markOtherCategories?id=" + String(i),
        browser.i18n.getMessage("buttonMarkOtherCategories", title));
      appendButtonCol(row, "unmarkOtherCategories?id=" + String(i),
        browser.i18n.getMessage("buttonUnmarkOtherCategories", title));
    }
    parent.appendChild(row);
  }
}

function addButtonsMark(mode) {
  let parent = getButtonsMark();
  if (!mode) {
    let row = document.createElement("TR");
    appendButtonCol(row, "buttonMarkButFirst");
    appendButtonCol(row, "buttonMarkButLast");
    parent.appendChild(row);
    row = document.createElement("TR");
    appendButtonCol(row, "buttonMarkButOldest");
    appendButtonCol(row, "buttonMarkButNewest");
    parent.appendChild(row);
  }
  let row = document.createElement("TR");
  appendButtonCol(row, "buttonMarkAll");
  appendButton(row, "buttonUnmarkAll");
  parent.appendChild(row);
}

function addButtonsMode(mode, categoryTitles) {
  if (mode == 2) {
    addButtonRemove("messageStripInfo", "buttonStripMarked");
  } else {
    addButtonRemove("messageRemoveInfo", "buttonRemoveMarked");
  }
  addButtonsMark(mode);
  addButtonsCategories(mode, categoryTitles);
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
  appendButton(parent, "buttonStop", browser.i18n.getMessage(textId), true);
}

function addCheckboxOptions(options, extra) {
  let row = document.createElement("TR");
  appendCheckboxCol(row, "checkboxFullUrl", options.fullUrl);
  appendTextNodeCol(row, browser.i18n.getMessage("checkboxFullUrl"));
  let parent = getCheckboxOptions();
  parent.appendChild(row);
  if (extra) {
    row = document.createElement("TR");
    appendCheckboxCol(row, "checkboxExtra", options.extra);
    appendTextNodeCol(row, browser.i18n.getMessage("checkboxExtra"));
    parent.appendChild(row);
  }
}

function enableButtonsOf(top, enabled) {
  if (!top.hasChildNodes()) {
    return;
  }
  let disabled = ((enabled !== undefined) && !enabled);
  for (let child of top.childNodes) {
    if ((child.nodeName == "BUTTON") || (child.nodeName == "INPUT")) {
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
  enableButtonsOf(getButtonsCategories(), enabled);
  enableButtonsOf(getCheckboxOptions(), enabled);
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
  clearItem(getButtonsCategories());
  clearItem(getCheckboxOptions());
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

function addBookmark(bookmark, result) {
  let row = document.createElement("TR");
  appendCheckboxCol(row, bookmark.id,
    (result.checkboxes && (result.checkboxes.has(bookmark.id))));
  if (bookmark.order !== undefined) {
    appendTextNodeCol(row, String(bookmark.order));
    let col = document.createElement("TD");
    row.appendChild(col);
  }
  let text = bookmark.text;
  let url;
  if (bookmark.url) {
    url = row.title = bookmark.url;
  }
  if (result.options.fullUrl && url) {
    text += " (" + url + ")";
  } else if (result.options.extra && bookmark.extra) {
    text += " (" + bookmark.extra + ")";
  }
  appendTextNodeCol(row, text);
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

function markCategory(category, checked) {
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
    checkbox.checked = checked;
  }
}

function markOtherCategories(category, checked) {
  let top = getTop();
  if (!top.hasChildNodes()) {
    return;
  }
  let groupMatches = false;
  let previousCheckboxes = new Array();
  let unchecked = !checked;
  for (let node of top.childNodes) {
    if (!isCheckbox(node)) {
      groupMatches = false;
      if (previousCheckboxes.length > 0) {  // test for speed reasons
        previousCheckboxes = new Array();
      }
      continue;
    }
    let checkbox = getCheckbox(node);
    if (!category.has(checkbox.id)) {
      if (groupMatches) {
        checkbox.checked = checked;
        continue;
      }
      previousCheckboxes.push(checkbox);
      continue;
    }
    checkbox.checked = unchecked;
    groupMatches = true;
    if (!previousCheckboxes.length) {
      continue;
    }
    for (let previous of previousCheckboxes) {
      previous.checked = checked;
    }
    previousCheckboxes = new Array();
  }
}

function markCategories(buttonId, categories) {
  let id = SplitNumber(buttonId, "markCategory?id=");
  if (id >= 0) {
    markCategory(categories[id], true);
    return true;
  }
  id = SplitNumber(buttonId, "unmarkCategory?id=");
  if (id >= 0) {
    markCategory(categories[id], false);
    return true;
  }
  id = SplitNumber(buttonId, "markOtherCategories?id=");
  if (id >= 0) {
    markOtherCategories(categories[id], true);
    return true;
  }
  id = SplitNumber(buttonId, "unmarkOtherCategories?id=");
  if (id >= 0) {
    markOtherCategories(categories[id], false);
    return true;
  }
  return false;
}

function checkboxesToSet(result) {
  if (result.checkboxes) {
    result.checkboxes = new Set(result.checkboxes);
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
    addCheckboxOptions(result.options, !exact);
    checkboxesToSet(result);
  };
  for (let group of result.list) {
    addButtonsOrRuler(result.categoryTitles);
    total += group.length;
    for (let bookmark of group) {
      addBookmark(bookmark, result);
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
  checkboxesToSet(result);
  for (let bookmark of result.list) {
    addBookmark(bookmark, result);
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
  addCheckboxOptions(result.options);
  checkboxesToSet(result);
  for (let bookmark of result.list) {
    addBookmark(bookmark, result);
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
    if (idList) {
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
  let removeList = new Array();
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
}

{
  let firstcall = true;
  let lock = true;
  let count = null;
  let categories;

  function startLock() {
    lock = true;
    enableButtons(false);
  }

  function endLock() {
    lock = false;
    enableButtons();
  }

  function addCheckboxes(message) {
      // We send an array, because a set has to be built by the client anyway
      let checkboxes = new Array();
      pushMarked(checkboxes);
      let count = checkboxes.length;
      if (count) {  // Send only nonempty arrays
        message.checkboxes = checkboxes;
      }
      return count;
  }

  function countMarked(send) {
    if (count === null) {
      return;
    }
    let currentCount;
    if (send) {
      let message = {
        command: "setCheckboxes"
      };
      currentCount = addCheckboxes(message);
      browser.runtime.sendMessage(message);
    } else {
      currentCount = pushMarked();
    }
    if (currentCount == count) {
      return;
    }
    count = currentCount;
    displayCount(browser.i18n.getMessage("messageCount", currentCount));
  }

  function setCheckboxOptions() {
    if (lock) {
      return;
    }
    startLock();
    let message = {
      command: "setOptions",
      fullUrl: getCheckboxFullUrl().checked
    };
    let checkboxExtra = getCheckboxExtra();
    if (checkboxExtra) {
      message.extra = checkboxExtra.checked;
    }
    addCheckboxes(message);
    clearWindow();
    browser.runtime.sendMessage(message);
  }

  function checkboxListener(event) {
    if ((!event.target) || (!event.target.id)) {
      return;
    }
    switch (event.target.id) {
      case "checkboxFullUrl":
      case "checkboxExtra":
        setCheckboxOptions();
        return;
    }
    countMarked(true);
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
    startLock();
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
      case "checkboxFullUrl":
        endLock();
        return;
      default:
        if (!markCategories(event.target.id, categories)) {
          endLock();
          return;
        }
    }
    countMarked(true);
    endLock();
  }

  function messageListener(message) {
    if (message.command !== "state") {
      return;
    }
    if (firstcall) {
      addButtonsBase();
    }
    let state = message.state;
    categories = count = null;
    let selectMode;
    switch (state.mode) {
      case "virgin":
        endLock();
        return;
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
      case "calculateError":
        displayFinish("messageCalculateError", state);
        break;
      default:  // should not happen
        displayMessage(state.mode);  // it is a bug if we get here
        return;
    }
    if (!selectMode) {
      sendMessageCommand("finish");
      return;
    }
    count = -1;
    countMarked(false);
    if (state.result && state.result.categories) {
      categories = state.result.categories;
    }
    endLock();
  }

  document.addEventListener("CheckboxStateChange", checkboxListener);
  document.addEventListener("click", clickListener);
  browser.runtime.onMessage.addListener(messageListener);
}
sendMessageCommand("sendState");
