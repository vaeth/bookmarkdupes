/* Copyright (C) 2017 Nartin Väth <martin@mvath.de>
 * This project is under the GNU public license 2.0
*/

// For documentation on the bookmark API see e.g.
// https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/bookmarks/

"use strict";

function setTitle(title) {
  document.getElementById("pageTitle").textContent = title;
}

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

function getSelectFolder() {
  return document.getElementById("selectFolder");
}

function getButtonsFolders() {
  return document.getElementById("buttonsFolders");
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

function getMessageNode() {
  return document.getElementById("textMessage");
}

function getCheckboxFullUrl() {
  const checkboxFullUrl = document.getElementById("checkboxFullUrl");
  return (checkboxFullUrl && checkboxFullUrl.checked);
}

function getCheckboxExtra() {
  const checkboxExtra = document.getElementById("checkboxExtra");
  return (checkboxExtra && checkboxExtra.checked);
}

function getSelectedFolder() {
  const value = document.getElementById("selectedFolder").value;
  return ((!value || (value === "@")) ? null : value);
}

function getTableCount() {
  return document.getElementById("tableCount");
}

function getTextCount() {
  return document.getElementById("textCount");
}

function getCheckboxCount() {
  return document.getElementById("checkboxCount");
}

function displayCount(text) {
  document.getElementById("textCount").textContent = text;
}

function displayMessage(text, title) {
  const message = getMessageNode();
  message.textContent = text;
  if (title) {
    message.title = title;
    return;
  }
  message.removeAttribute("TITLE");
}

function getName(folders, parent, name) {
  while (parent || (parent === 0)) {
    const folder = folders[parent];
    name = folder.name + ' | ' + name;
    parent = folder.parent;
  }
  return name;
}

function appendTextNodeCol(row, text, title, id) {
  const col = document.createElement("TD");
  const textNode = document.createTextNode(text);
  if (id) {
    col.id = id;
  }
  col.appendChild(textNode);
  if (title) {
    col.title = title;
  }
  row.appendChild(col);
}

function appendCheckbox(parent, id, title, checked) {
  const checkbox = document.createElement("INPUT");
  checkbox.type = "checkbox";
  if (title) {
    checkbox.title = title;
  }
  if (checked) {
    checkbox.checked = checked;
  }
  checkbox.id = id;
  checkbox.disabled = true;
  parent.appendChild(checkbox);
}

function appendCheckboxCol(row, id, title, checked) {
  const col = document.createElement("TD");
  appendCheckbox(col, id, title, checked);
  row.appendChild(col);
}

function createCount(title) {
  const row = document.createElement("TR");
  if (title) {
    row.title = title;
  }
  appendCheckboxCol(row, "checkboxCount", null, true);
  appendTextNodeCol(row, " ", null, "textCount");
  const parent = getTableCount();
  parent.appendChild(row);
}

function appendButton(parent, id, titleId, text, titleText, enabled) {
  const button = document.createElement("BUTTON");
  button.type = "button";
  button.id = id;
  button.textContent = (text ? text : browser.i18n.getMessage(id));
  if (titleId) {
    button.title = browser.i18n.getMessage(titleId);
  } else if (titleText) {
    button.title = titleText;
  }
  if (!enabled) {
    button.disabled = true;
  }
  parent.appendChild(button);
}

function appendButtonCol(row, id, titleId, text, titleText, enabled) {
  const col = document.createElement("TD");
  appendButton(col, id, titleId, text, titleText, enabled);
  row.appendChild(col);
}

function appendButtonRow(parent, id, titleId, text, titleText, enabled) {
  const row = document.createElement("TR");
  appendButtonCol(row, id, titleId, text, titleText, enabled);
  parent.appendChild(row);
}

function addButtonsBase() {
  const parent = getButtonsBase();
  if (parent.hasChildNodes()) {  // Already done
    return;
  }
  const row = document.createElement("TR");
  appendButtonCol(row, "buttonListExactDupes", "titleButtonListExactDupes");
  appendButtonCol(row, "buttonListSimilarDupes",
    "titleButtonListSimilarDupes");
  appendButtonCol(row, "buttonListEmpty", "titleButtonListEmpty");
  appendButtonCol(row, "buttonListAll", "titleButtonListAll");
  parent.appendChild(row);
}

function addButtonRemove(buttonId, titleId) {
  const row = document.createElement("TR");
  const col = document.createElement("TD");
  col.width = "50pt";
  col.style.height = "50pt";
  row.append(col);
  appendButtonCol(row, buttonId, titleId);
  const parent = getButtonsRemove();
  parent.appendChild(row);
}

function addButtonsSame(enabled) {
  const parent = getButtonsFolders();
  if (parent.hasChildNodes()) {  // Already done
    return;
  }
  appendButtonRow(parent, "buttonMarkSame", "titleButtonMarkFolder",
    null, null, enabled);
  appendButtonRow(parent, "buttonUnmarkSame", "titleButtonUnmarkFolder",
    null, null, enabled);
  appendButtonRow(parent, "buttonMarkSameButFirst",
    "titleButtonMarkSameButFirst", null, null, enabled);
  appendButtonRow(parent, "buttonMarkSameButLast",
    "titleButtonMarkSameButLast", null, null, enabled);
  appendButtonRow(parent, "buttonMarkSameButOldest",
    "titleButtonMarkSameButOldest", null, null, enabled);
  appendButtonRow(parent, "buttonMarkSameButNewest",
    "titleButtonMarkSameButNewest", null, null, enabled);
}

function addButtonsFolders(mode, enabled) {
  const parent = getButtonsFolders();
  if (parent.hasChildNodes()) {  // Already done
    return;
  }
  appendButtonRow(parent, "buttonMarkFolder", "titleButtonMarkFolder",
    null, null, enabled);
  appendButtonRow(parent, "buttonUnmarkFolder", "titleButtonUnmarkFolder",
    null, null, enabled);
  if (mode) {
    return;
  }
  appendButtonRow(parent, "buttonMarkFolderOther",
    "titleButtonMarkFolderOther", null, null, enabled);
  appendButtonRow(parent, "buttonMarkFolderButFirst",
    "titleButtonMarkFolderButFirst", null, null, enabled);
  appendButtonRow(parent, "buttonMarkFolderButLast",
    "titleButtonMarkFolderButLast", null, null, enabled);
  appendButtonRow(parent, "buttonMarkFolderButOldest",
    "titleButtonMarkFolderButOldest", null, null, enabled);
  appendButtonRow(parent, "buttonMarkFolderButNewest",
    "titleButtonMarkFolderButNewest", null, null, enabled);
}

function addSelectOption(select, content, value) {
  const option = document.createElement("OPTION");
  if (content) {
    option.textContent = content;
  }
  if (value) {
    option.value = value;
  }
  select.appendChild(option);
}

function addSelectFolder(sameFolders, folderIds, folders) {
  const select = document.createElement("SELECT");
  select.title = browser.i18n.getMessage("titleSelectFolder");
  select.id = "selectedFolder";
  addSelectOption(select, browser.i18n.getMessage("optionNonFolder"), "@");
  if (sameFolders) {
    addSelectOption(select, browser.i18n.getMessage("optionSameFolder"), "=");
  }
  if (folderIds) {
    for (let folder of folders) {
      if (!folder) {
        continue;
      }
      if (!folder.used) {
        continue;
      }
      addSelectOption(select, getName(folders, folder.parent, folder.name),
        String(folderIds.length));
      folderIds.push(folder.used);
    }
  }
  const col = document.createElement("TD");
  col.appendChild(select);
  const row = document.createElement("TR");
  row.appendChild(col);
  const parent = getSelectFolder();
  parent.appendChild(row);
}

function addButtonsMark(mode) {
  const parent = getButtonsMark();
  if (!mode) {
    const row1 = document.createElement("TR");
    appendButtonCol(row1, "buttonMarkButFirst", "titleButtonMarkButFirst");
    appendButtonCol(row1, "buttonMarkButLast", "titleButtonMarkButLast");
    parent.appendChild(row1);
    const row2 = document.createElement("TR");
    appendButtonCol(row2, "buttonMarkButOldest", "titleButtonMarkButOldest");
    appendButtonCol(row2, "buttonMarkButNewest", "titleButtonMarkButNewest");
    parent.appendChild(row2);
  }
  let row = document.createElement("TR");
  appendButtonCol(row, "buttonMarkAll", "titleButtonMarkAll");
  appendButton(row, "buttonUnmarkAll", "titleButtonUnmarkAll");
  parent.appendChild(row);
}

function addButtonsMode(mode, folders) {
  if (mode == 2) {
    addButtonRemove("buttonStripMarked", "titleButtonStripMarked");
  } else {
    addButtonRemove("buttonRemoveMarked", "titleButtonRemoveMarked");
  }
  addButtonsMark(mode);
}

function addProgressButton(textId, percentage) {
  const bar = getProgressBar();
  if (bar.firstChild) {
    bar.firstChild.value = percentage;
    return;
  }
  const progress = document.createElement("PROGRESS");
  progress.max = 100;
  progress.value = percentage;
  bar.appendChild(progress);
  const stop = getButtonStop();
  appendButton(stop, "buttonStop", null,
    browser.i18n.getMessage(textId), null, true);
}

function addCheckboxExtra(title, extra) {
  const row = document.createElement("TR");
  appendCheckboxCol(row, "checkboxFullUrl", title);
  appendTextNodeCol(row, browser.i18n.getMessage("checkboxFullUrl"), title);
  const parent = getCheckboxOptions();
  parent.appendChild(row);
  if (extra) {
    const rowExtra = document.createElement("TR");
    appendCheckboxCol(rowExtra, "checkboxExtra", title, true);
    appendTextNodeCol(rowExtra, browser.i18n.getMessage("checkboxExtra"),
      title);
    parent.appendChild(rowExtra);
  }
}

function enableButtonsOf(top, enabled) {
  if (!top.hasChildNodes()) {
    return;
  }
  const disabled = ((enabled !== undefined) && !enabled);
  for (let child of top.childNodes) {
    if ((child.nodeName == "BUTTON") || (child.nodeName == "INPUT")
      || (child.nodeName == "SELECT")) {
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
  enableButtonsOf(getSelectFolder(), enabled);
  enableButtonsOf(getButtonsFolders(), enabled);
  enableButtonsOf(getCheckboxOptions(), enabled);
}

function enableBookmarks(enabled) {
  enableButtonsOf(getTableCount(), enabled);
  enableButtonsOf(getTop(), enabled);
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

function clearButtonsFolders() {
  clearItem(getButtonsFolders());
}

function clearButtonsMode() {
  clearItem(getButtonsRemove());
  clearItem(getButtonsMark());
  clearItem(getSelectFolder());
  clearButtonsFolders();
  clearItem(getCheckboxOptions());
}

function clearBookmarks() {
  clearItem(getTableCount());
  clearItem(getTop());
}

function clearWindow() {
  clearProgressButton();
  clearButtonsMode();
  clearBookmarks();
}

function rulerExtra(col, text) {
  if (!text) {
    if (col.children.length > 1) {
      col.removeChild(col.lastChild);
    }
    return;
  }
  if (col.children.length > 1) {
    col.lastChild.textContent = text;
    return;
  }
  const paragraph = document.createElement("P");
  paragraph.textContent = text;
  col.appendChild(paragraph);
}

function addRuler(id) {
  const ruler = document.createElement("HR");
  const col = document.createElement("TD");
  col.colSpan = 4;
  col.appendChild(ruler);
  if (id) {
    col.id = id;
  }
  const row =  document.createElement("TR");
  row.appendChild(col);
  const top = getTop();
  top.appendChild(row);
}

function entryExtra(col, text) {
  rulerExtra(col, text);  // by accident the same mechanism works
}

function addBookmark(bookmark, folders, id) {
  const row = document.createElement("TR");
  appendCheckboxCol(row, bookmark.id);
  if (bookmark.order !== undefined) {
    appendTextNodeCol(row, String(bookmark.order));
    const dummy = document.createElement("TD");  // A dummy column for space
    row.appendChild(dummy);
  }
  const name = getName(folders, bookmark.parent, bookmark.text);
  const col = document.createElement("TD");
  if (bookmark.url) {
    const url = bookmark.url;
    row.title = url;
    const link = document.createElement("A");
    link.href = url;
    link.target = "_blank";
    link.textContent = name;
    link.referrerpolicy = 'no-referrer';
    col.appendChild(link);
    if (id) {
      col.id = id;
      if (bookmark.extra) {
        entryExtra(col, bookmark.extra);
      }
    }
    row.appendChild(col);
  } else {
    appendTextNodeCol(row, name);
  }
  const top = getTop();
  top.appendChild(row);
}

function toggleExtra(entryList, rulerList) {
  if (!entryList && !rulerList) {
    return;
  }
  const fullUrl = getCheckboxFullUrl();
  if (rulerList) {
    for (let i = 0; i < rulerList.length; ++i) {
      const col = document.getElementById("rulerExtra" + String(i));
      rulerExtra(col, (fullUrl ? rulerList[i] : null));
    }
  }
  if (!entryList) {
    return;
  }
  let extra = getCheckboxExtra();
  for (let i = 0; i < entryList.length; ++i) {
    const col = document.getElementById("entryExtra" + String(i));
    const entry = entryList[i];
    let text;
    if (fullUrl && entry.url) {
      text = entry.url;
    } else if (extra && entry.extra) {
      text = entry.extra;
    }
    entryExtra(col, text);
  }
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
  const top = getTop();
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
  const top = getTop();
  if (!top.hasChildNodes()) {
    return;
  }
  let mark = false;
  for (let node of top.childNodes) {
    if (!isCheckbox(node)) {  // ruler
      mark = false;
      continue;
    }
    setCheck(node, mark);
    mark = true;
  }
}

function markButLast() {
  const top = getTop();
  if (!top.hasChildNodes()) {
    return;
  }
  let previousNode = null;
  for (let node of top.childNodes) {
    if (!isCheckbox(node)) {  // ruler
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
  const top = getTop();
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
  const top = getTop();
  if (!top.hasChildNodes()) {
    return;
  }
  let largestSeen = 1;
  let largestNode = null;
  for (let node of top.childNodes) {
    if (!isCheckbox(node)) {  // ruler
      if (largestNode !== null) {
        setCheck(largestNode, false);
        largestNode = null;
      }
      largestSeen = 1;
      continue;
    }
    const current = getOrder(node);
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

function getSelectedIds(folderIds) {
  const value = getSelectedFolder();
  if ((!value) || (value === "=")) {
    return null;
  }
  return folderIds[Number(value)];
}

function markFolder(folderIds, checked) {
  const ids = getSelectedIds(folderIds);
  if (!ids) {
    return;
  }
  const top = getTop();
  if (!top.hasChildNodes()) {
    return;
  }
  for (let node of top.childNodes) {
    if (!isCheckbox(node)) {
      continue;
    }
    const checkbox = getCheckbox(node);
    if (!ids.has(checkbox.id)) {
      continue;
    }
    checkbox.checked = checked;
  }
}

function markFolderGroup(folderIds, mode) {
  const ids = getSelectedIds(folderIds);
  if (!ids) {
    return;
  }
  const top = getTop();
  if (!top.hasChildNodes()) {
    return;
  }
  let checkTime = 0;
  let checkedOthers = false;
  if (mode == "oldest") {
    checkTime = -1;
  } else if (mode == "newest") {
    checkTime = 1;
  } else if (mode == "other") {
    checkedOthers = true;
  }
  const checkedMe = !checkedOthers;
  let checkboxesOthers = [];
  let checkboxesMe = [];
  let groupMatches = false;
  let dateMatch;
  let dateSeen = 0;
  function markGroup() {
    if (!groupMatches) {
      return;
    }
    for (let checkbox of checkboxesOthers) {
      checkbox.checked = checkedOthers;
    }
    let exclude = null;
    if (!checkboxesOthers.length) {
      if (mode == "first") {
        exclude = 1;
      } else if (mode == "last") {
        exclude = checkboxesMe.length;
      } else if (checkTime) {
        exclude = dateMatch;
      }
    }
    let i = 0;
    for (let checkbox of checkboxesMe) {
      ++i;
      checkbox.checked = ((i !== exclude) ? checkedMe : checkedOthers);
    }
  }
  for (let node of top.childNodes) {
    if (!isCheckbox(node)) {  // ruler
      markGroup();
      if (checkboxesOthers.length) {  // test for speed reasons
        checkboxesOthers = [];
      }
      if (checkboxesMe.length) {  // test for speed reasons
        checkboxesMe = [];
      }
      groupMatches = false;
      dateSeen = 0;
      continue;
    }
    const checkbox = getCheckbox(node);
    if (!ids.has(checkbox.id)) {
      checkboxesOthers.push(checkbox);
      continue;
    }
    groupMatches = true;
    checkboxesMe.push(checkbox);
    if (!checkTime) {
      continue;
    }
    const current = getOrder(node);
    if (dateSeen) {
      if (checkTime > 0) {
        if (current < dateSeen) {
          continue;
        }
      } else if (current >= dateSeen) {
        continue;
      }
    }
    dateSeen = current;
    dateMatch = checkboxesMe.length;
  }
  markGroup();
}

function markSame(folders, checked) {
  const top = getTop();
  if (!top.hasChildNodes()) {
    return;
  }
  for (let node of top.childNodes) {
    if (!isCheckbox(node)) {
      continue;
    }
    const checkbox = getCheckbox(node);
    const folder = folders.get(checkbox.id);
    if (folder === undefined) {
      continue;
    }
    checkbox.checked = checked;
  }
}

function markSameGroup(folders, mode) {
  const top = getTop();
  if (!top.hasChildNodes()) {
    return;
  }
  let items = null;
  function markGroup() {
    if (!items) {
      return;
    }
    let i = 0;
    for (let item of items) {
      ++i;
      item.checkbox.checked = (i != item.folderData.match);
    }
  }
  let folderMap = null;
  let checkTime = 0;
  let first = false;
  if (mode == "oldest") {
    checkTime = -1;
  } else if (mode == "newest") {
    checkTime = 1;
  } else if (mode == "first") {
    first = true;
  }
  for (let node of top.childNodes) {
    if (!isCheckbox(node)) {  // ruler
      markGroup();
      items = null;
      folderMap = null;
      continue;
    }
    const checkbox = getCheckbox(node);
    const id = checkbox.id;
    let folder = folders.get(id);
    if (folder === undefined) {
      continue;
    }
    let folderData;
    if (items) {
      folderData = folderMap.get(folder);
    } else {
      items = [];
      folderMap = new Map();
    }
    if (!folderData) {
      folderData = {};
      folderMap.set(folder, folderData);
    }
    const item = {
      checkbox: checkbox,
      folderData: folderData
    };
    items.push(item);
    if (!checkTime) {
      if (!first || !folderData.match) {
        folderData.match = items.length;
      }
      continue;
    }
    const current = getOrder(node);
    if (folderData.dateSeen) {
      if (checkTime > 0) {
        if (current < folderData.dateSeen) {
          continue;
        }
      } else if (current >= folderData.dateSeen) {
        continue;
      }
    }
    folderData.dateSeen = current;
    folderData.match = items.length;
  }
  markGroup();
}

function isMarked(id) {
  const checkbox = document.getElementById(id);
  return (checkbox && checkbox.checked);
}

function getMarked(returnSet) {
  let marked;
  let adding;
  if (returnSet) {
    marked = new Set();
    adding = function (id) {
      marked.add(id);
    }
  } else {
    marked = [];
    adding = function (id) {
      marked.push(id);
    }
  }
  const top = getTop();
  if (!top.hasChildNodes()) {
    return marked;
  }
  for (let node of top.childNodes) {
    if (!isCheckbox(node)) {
      continue;
    }
    const checkbox = getCheckbox(node);
    if (checkbox.checked) {
      adding(checkbox.id);
    }
  }
  return marked;
}

function displayProgress(textId, buttonTextId, total, todo) {
  const percentage = (100 * total) / todo;
  addProgressButton(buttonTextId, percentage);
  displayMessage(browser.i18n.getMessage(textId,
    [String(total), String(todo), String(Math.round(percentage))]))
}

function displayEndProgress(textId, total, error) {
  clearWindow();
  if (error) {
    displayMessage(browser.i18n.getMessage(textId,
      [error, String(total)]));
  } else {
    displayMessage(browser.i18n.getMessage(textId, String(total)));
  }
}

function normalizeGroup(group) {
  const indices = [];
  let i = 0;
  for (let bookmark of group) {
    const index = {
      index: (i++),
      order: bookmark.order
    };
    indices.push(index);
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
    if (!folder.used || !folder.used.size) {
      delete folders[i];
      continue;
    }
    parent = folder.parent;
    if (!parent && (parent !== 0)) {
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
        (folder.used && folder.used.size && (!folder.usedByChilds
        || (folder.used.size > folder.usedByChilds)))) {
      ++display;
    }
    delete folder.childs;
    delete folder.usedByChilds;
  }
  return display;
}

function coincidingUrl(bookmarkList, url) {
  for (let bookmark of bookmarkList) {
    if (url !== bookmark.url) {
      return false;
    }
  }
  return true;
}

function calculate(command, state, callback) {
  let similar;
  let folderMode;
  let handleFunction;
  let urlMap;
  let result;
  let folders;
  let allCount;
  let entryList;

  function calculateError(error) {
    displayMessage("messageCalculateError", error);
    callback();
  }

  function calculateFinish() {
    if (entryList && entryList.length) {
      state.entryList = entryList;
    }
    callback();
  }

  function parentUsed(parent, id) {
    while (parent || (parent === 0)) {
      const folder = folders[parent];
      if (!folder.used) {
        folder.used = new Set();
      }
      folder.used.add(id);
      parent = folder.parent;
    }
  }

  function parentUnused(parent, id) {
    while (parent || (parent === 0)) {
      const folder = folders[parent];
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
    ++allCount;
    const url = node.url;
    let groupIndex = url;
    let extra;
    if (similar) {
      let index = groupIndex.indexOf("?");
      if (index > 0) {
        groupIndex = groupIndex.substring(0, index);
        extra = url.substring(index);
      }
    }
    const id = node.id;
    let group = urlMap.get(groupIndex);
    if (!group) {
      group = [];
      result.push(group);
      urlMap.set(groupIndex, group);
    }
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
    group.push(bookmark);
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
    result.push(bookmark);
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
    result.push(bookmarkResult);
    const bookmark = {
      parentId: node.parentId,
      title: node.title,
      url: node.url,
      index: ((node.index !== undefined) ? node.index : index)
    };
    if (node.type !== undefined) {
      bookmark.type = node.type;
    }
    state.bookmarkMap.set(id, bookmark);
  }

  function recurse(node) {
    function recurseMain(node, parent, index) {
      if (!node.children || !node.children.length) {
        if ((parent !== null) && !node.unmodifable) {
          if (folderMode) {
            handleFunction(node, parent);
            return;
          } else if (node.url && (!node.type || (node.type == "bookmark")) &&
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
        parent = folders.length;
        folders.push(folder);
      }
      index = 0;
      for (let child of node.children) {
        recurseMain(child, parent, ++index);
      }
      if (node.title && !folder.used) {
        folders.pop();
      }
    }

    recurseMain(node, null, 0);
  }

  function addButtons(mode, sameFolders) {
    state.marked = new Set();
    addButtonsMode(mode);
    const display = normalizeFolders(folders);
    if (display > 1) {
      state.folderIds = [];
    }
    if (sameFolders || state.folderIds) {
      addSelectFolder(sameFolders, state.folderIds, folders);
      state.markFolders = mode;
    }
  }

  function haveSameParents(bookmarkList) {
    const parents = new Set();
    for (let bookmark of bookmarkList) {
      const parent = bookmark.parent;
      if (parent === null) {
        continue;
      }
      if (parents.has(parent)) {
        return true;
      }
      parents.add(parent);
    }
    return false;
  }

  function sameFoldersParents(bookmarkList) {
    const folders = new Map();
    for (let bookmark of bookmarkList) {
      if (!bookmark.parent && (bookmark.parent !== 0)) {
        continue;
      }
      const folder = bookmark.parent;
      const folderEntry = folders.get(folder);
      if (folderEntry === undefined) {
        folders.set(folder, bookmark.id);
        continue;
      }
      if (folderEntry) {
        state.folders.set(folderEntry, folder);
        folders.set(folder, null);
      }
      state.folders.set(bookmark.id, folder);
    }
  }

  function addBookmarks(bookmarkList, addUrl) {
    for (let bookmark of bookmarkList) {
      let id;
      let entry;
      if (addUrl) {
        entry = {
          url: bookmark.url
        };
      }
      if (bookmark.extra) {
        if (!entry) {
          entry = {};
        }
        entry.extra = bookmark.extra;
      }
      if (entry) {
        id = "entryExtra" + String(entryList.length);
        entryList.push(entry);
      }
      addBookmark(bookmark, folders, id);
    }
  }

  function calculateDupes(nodes) {
    urlMap = new Map();
    allCount = 0;
    recurse(nodes[0]);
    let groupNumber = 0;
    let total = 0;
    let sameFolders = false;
    for (let i = 0; i < result.length; ++i) {
      const group = result[i];
      if (group.length < 2) {
        if (group.length) {
          const bookmark = group[0];
          parentUnused(bookmark.parent, bookmark.id);
        }
        delete result[i];
        continue;
      }
      if (!sameFolders && haveSameParents(group)) {
        sameFolders = true;
      }
      normalizeGroup(group);
      ++groupNumber;
      total += group.length;
    }
    let message, title;
    if (similar) {
      message = "messageSimilarMatchesGroups";
      title = "titleMessageSimilarMatchesGroups"
    } else {
      message = "messageExactMatchesGroups";
      title = "titleMessageExactMatchesGroups"
    }
    title = browser.i18n.getMessage(title);
    if (groupNumber) {
      addButtons(0, sameFolders);
      addCheckboxExtra(title, similar);
    }
    displayMessage(browser.i18n.getMessage(message,
      [String(total), String(groupNumber), String(allCount)]), title);
    if (!groupNumber) {
      calculateFinish();
      return;
    }
    createCount(title);
    entryList = [];
    const rulerList = [];
    if (sameFolders) {
      state.folders = new Map();
    }
    for (let group of result) {
      if (!group) {
        continue;
      }
      const url = group[0].url;
      if (!similar || coincidingUrl(group, url)) {
        const id = "rulerExtra" + String(rulerList.length);
        rulerList.push(url);
        addRuler(id);
        addBookmarks(group);
      } else {
        addRuler();
        addBookmarks(group, true);
      }
      if (sameFolders) {
        sameFoldersParents(group);
      }
    }
    if (rulerList && rulerList.length) {
      state.rulerList = rulerList;
    }
    calculateFinish();
  }

  function calculateEmpty(nodes) {
    recurse(nodes[0]);
    const total = result.length;
    const title = browser.i18n.getMessage("titleMessageEmpty");
    if (total) {
      addButtons(1);
    }
    displayMessage(browser.i18n.getMessage("messageEmpty", String(total)),
      title);
    if (total) {
      createCount(title);
      addBookmarks(result);
    }
    calculateFinish();
  }

  function calculateAll(nodes) {
    state.bookmarkMap = new Map();
    recurse(nodes[0]);
    const total = result.length;
    const title = browser.i18n.getMessage("titleMessageAll");
    if (total) {
      addButtons(2);
      addCheckboxExtra(title);
    }
    displayMessage(browser.i18n.getMessage("messageAll", String(total)),
      title);
    if (total) {
      createCount(title);
      entryList = [];
      addBookmarks(result, true);
    }
    calculateFinish();
  }

  clearWindow();
  displayMessage(browser.i18n.getMessage("messageCalculating"));
  let mainFunction;
  folderMode = false;
  switch (command) {
    case "similar":
      similar = true;
      // fallthrough
    case "exact":
      mainFunction = calculateDupes;
      handleFunction = handleDupe;
      break;
    case "empty":
      folderMode = true;
      mainFunction = calculateEmpty;
      handleFunction = handleEmpty;
      break;
    case "all":
      mainFunction = calculateAll;
      handleFunction = handleAll;
      break;
    default:  // should not happen
      return;  // it is a bug if we get here
  }
  folders = [];
  result = [];
  browser.bookmarks.getTree().then(mainFunction, calculateError);
}

function removeFolder(id, callback, errorCallback) {
  return browser.bookmarks.remove(id).then(callback, errorCallback);
}

function stripBookmark(id, bookmarkData, callback, errorCallback) {
  return browser.bookmarks.create(bookmarkData).then(function () {
    browser.bookmarks.remove(id).then(callback, errorCallback);
  }, errorCallback);
}

function processMarked(stopPressed, callback, bookmarkMap) {
  const marked = getMarked();
  const todo = marked.length;
  let total = 0;

  let finishId;
  let progress;
  let process;

  if (bookmarkMap) {
    displayMessage(browser.i18n.getMessage("messageStripMarked"));
    finishId = "messageStripSuccess";
    progress = function () {
      displayProgress("messageStripProgress", "buttonStopStripping",
        total, todo);
      return stopPressed();
    };
    process = function (id, next) {
      stripBookmark(id, bookmarkMap.get(id), next, function (error) {
        displayEndProgress("messageStripError", total);
        callback();
      });
    };
  } else {
    displayMessage(browser.i18n.getMessage("messageRemoveMarked"));
    finishId = "messageRemoveSuccess";
    progress = function () {
      displayProgress("messageRemoveProgress", "buttonStopRemoving",
        total, todo);
      return stopPressed();
    };
    process = function (id, next) {
      removeFolder(id, next, function (error) {
        displayEndProgress("messageRemoveError", total);
        callback();
      });
    };
  }

  function finish() {
    displayEndProgress(finishId, total);
    callback();
  }

  function recurse() {
    if ((total == todo) || progress()) {
      finish();
      return;
    }
    const id = marked[total++];  // store first to avoid ambiguous ++
    process(id, recurse);
  }

  if (!marked.length) {
    finish();
    return;
  }
  recurse();
}

{
  // state variables
  let state = {};

  function startLock() {
    state.lock = true;
    enableButtons(false);
  }

  function endLock() {
    state.lock = false;
    enableButtons();
  }

  function stopPressed() {
    return (state.stop ? true : false);
  }

  function startLockReset() {
    state = {};
    startLock();
  }

  function endLockReset() {
    state = {};
    endLock();
  }

  function marked(id) {
    if (!state.marked) {
      return;
    }
    if (id) {
      if (!getCheckboxCount().checked) {
        return;
      }
      if (isMarked(id)) {
        state.marked.add(id);
      } else {
        state.marked.delete(id);
      }
    } else {
      if (!getCheckboxCount().checked) {
        if (state.hasOwnProperty("lastCount")) {
          delete state.lastCount;
          displayCount(browser.i18n.getMessage("messageNoCount"));
        }
        return;
      }
      state.marked = getMarked(true);
    }
    const count = state.marked.size;
    if (count === state.lastCount) {
      return;
    }
    state.lastCount = count;
    displayCount(browser.i18n.getMessage("messageCount", count));
  }

  function endLockAll() {
    marked();
    enableBookmarks();
    endLock();
  }

  function checkboxListener(event) {
    if (!event.target || !event.target.id) {
      return;
    }
    switch (event.target.id) {
      case "checkboxFullUrl":
      case "checkboxExtra":
        toggleExtra(state.entryList, state.rulerList);
        return;
      case "checkboxCount":
        marked();
        return;
      default:  // bookmark checkbox id
        marked(event.target.id);
        return;
    }
  }

  function toggleButtonsFolders() {
    let haveSelected = state.hasOwnProperty("markFolders");
    let sameFolders = false;
    if (haveSelected) {
      const name = getSelectedFolder();
      if (name) {
        if (name === "=") {
          sameFolders = true;
        }
      } else {
        haveSelected = false;
      }
    }
    if (!haveSelected) {
      delete state.folderButtons;
      clearButtonsFolders();
      return;
    }
    if (state.hasOwnProperty("folderButtons")) {
      if (state.folderButtons === sameFolders) {  // display is up-to-date
        return;
      }
      clearButtonsFolders();
    }
    state.folderButtons = sameFolders;
    if (sameFolders) {
      addButtonsSame(!state.lock);
    } else {
      addButtonsFolders(state.markFolders, !state.lock);
    }
  }

  function selectListener(event) {
    if (!event.target || !event.target.id) {
      return;
    }
    switch (event.target.id) {
      case "selectedFolder":
        toggleButtonsFolders();
    }
  }

  function calculateWrapper(command) {
    state = {};
    startLock();
    setTimeout(function () {
      calculate(command, state, endLockAll);
    });
  }

  function processWrapper(bookmarkMap) {
    startLock();
    setTimeout(function () {
      processMarked(stopPressed, endLockReset, bookmarkMap);
    })
  }

  function markWrapper(func, funcargs) {
    startLock();
    enableBookmarks(false);
    const thisArg = this;
    const args = Array.prototype.slice.call(arguments);
    args.splice(0, 1);
    setTimeout(function () {
      func.apply(thisArg, args);
      endLockAll();
    })
  }

  function clickListener(event) {
    if (!event.target || !event.target.id) {
      return;
    }
    if (event.target.id == "buttonStop") {
      state.stop = true;
      return;
    }
    if (state.lock || (event.button && (event.button != 1)) ||
      (event.buttons && (event.buttons != 1))) {
      return;
    }
    switch (event.target.id) {
      case "buttonListExactDupes":
        calculateWrapper("exact");
        return;
      case "buttonListSimilarDupes":
        calculateWrapper("similar");
        return;
      case "buttonListEmpty":
        calculateWrapper("empty");
        return;
      case "buttonListAll":
        calculateWrapper("all");
        return;
      case "buttonRemoveMarked":
        processWrapper();
        return;
      case "buttonStripMarked":
        processWrapper(state.bookmarkMap);
        return;
      case "buttonMarkAll":
        markWrapper(mark, true);
        return;
      case "buttonUnmarkAll":
        markWrapper(mark, false);
        return;
      case "buttonMarkButFirst":
        markWrapper(markButFirst);
        return;
      case "buttonMarkButLast":
        markWrapper(markButLast);
        return;
      case "buttonMarkButOldest":
        markWrapper(markButOldest);
        return;
      case "buttonMarkButNewest":
        markWrapper(markButNewest);
        return;
      case "buttonMarkFolder":
        markWrapper(markFolder, state.folderIds, true);
        return;
      case "buttonUnmarkFolder":
        markWrapper(markFolder, state.folderIds, false);
        return;
      case "buttonMarkFolderOther":
        markWrapper(markFolderGroup, state.folderIds, "other");
        return;
      case "buttonMarkFolderButFirst":
        markWrapper(markFolderGroup, state.folderIds, "first");
        return;
      case "buttonMarkFolderButLast":
        markWrapper(markFolderGroup, state.folderIds, "last");
        return;
      case "buttonMarkFolderButOldest":
        markWrapper(markFolderGroup, state.folderIds, "oldest");
        return;
      case "buttonMarkFolderButNewest":
        markWrapper(markFolderGroup, state.folderIds, "newest");
        return;
      case "buttonMarkSame":
        markWrapper(markSame, state.folders, true);
        return;
      case "buttonUnmarkSame":
        markWrapper(markSame, state.folders, false);
        return;
      case "buttonMarkSameButFirst":
        markWrapper(markSameGroup, state.folders, "first");
        return;
      case "buttonMarkSameButLast":
        markWrapper(markSameGroup, state.folders, "last");
        return;
      case "buttonMarkSameButOldest":
        markWrapper(markSameGroup, state.folders, "oldest");
        return;
      case "buttonMarkSameButNewest":
        markWrapper(markSameGroup, state.folders, "newest");
        return;
      // default:  // checkboxes: handled by checkboxListener()
      //   return;
    }
  }

  setTitle(browser.i18n.getMessage("extensionName"));
  addButtonsBase();
  document.addEventListener("CheckboxStateChange", checkboxListener);
  document.addEventListener("click", clickListener);
  document.addEventListener("change", selectListener);
  endLock();
}
