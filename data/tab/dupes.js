/* Copyright (C) 2017 Nartin Väth <martin@mvath.de>
 * This project is under the GNU public license 2.0
*/

// For documentation on the bookmark API see e.g.
// https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/bookmarks/

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
  return document.getElementById("checkboxFullUrl");
}

function getCheckboxExtra() {
  return document.getElementById("checkboxExtra");
}

function getSelectedFolder() {
  let value = document.getElementById("selectedFolder").value;
  return (((!value) || (value === "'")) ? null : value);
}

function getTextCount() {
  return document.getElementById("textCount");
}

function displayCount(text, title) {
  let count = getTextCount();
  count.textContent = text;
  if (title) {
    count.title = title;
    return;
  }
  if (title !== undefined) {
    count.removeAttribute("TITLE");
  }
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

function appendTextNodeCol(row, text, title) {
  const col = document.createElement("TD");
  const textNode = document.createTextNode(text);
  col.appendChild(textNode);
  if (title) {
    col.title = title;
  }
  row.appendChild(col);
}

function appendCheckbox(parent, id, title, checked, disabled) {
  const checkbox = document.createElement("INPUT");
  checkbox.type = "checkbox";
  if (title) {
    checkbox.title = title;
  }
  if (checked) {
    checkbox.checked = checked;
  }
  checkbox.id = id;
  if (disabled === true) {
    checkbox.disabled = true;
  }
  parent.appendChild(checkbox);
}

function appendCheckboxCol(row, id, title, checked, disabled) {
  const col = document.createElement("TD");
  appendCheckbox(col, id, title, checked, disabled);
  row.appendChild(col);
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

function addSelectFolder(folders) {
  const select = document.createElement("SELECT");
  select.title = browser.i18n.getMessage("titleSelectFolder");
  select.id = "selectedFolder";
  addSelectOption(select, browser.i18n.getMessage("OptionNonFolder"), "'");
  let folderIds = new Array();
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
  const col = document.createElement("TD");
  col.appendChild(select);
  const row = document.createElement("TR");
  row.appendChild(col);
  const parent = getSelectFolder();
  parent.appendChild(row);
  return folderIds;
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
  appendCheckboxCol(row, "checkboxFullUrl", title, false, true);
  appendTextNodeCol(row, browser.i18n.getMessage("checkboxFullUrl"), title);
  const parent = getCheckboxOptions();
  parent.appendChild(row);
  if (extra) {
    const rowExtra = document.createElement("TR");
    appendCheckboxCol(rowExtra, "checkboxExtra", title, true, true);
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
  displayCount("", null);
  clearItem(getTop());
}

function clearWindow() {
  clearProgressButton();
  clearButtonsMode();
  clearBookmarks();
}

function addRuler() {
  const ruler = document.createElement("HR");
  const col = document.createElement("TD");
  col.colSpan = 4;
  col.appendChild(ruler);
  const row =  document.createElement("TR");
  row.appendChild(col);
  const top = getTop();
  top.appendChild(row);
}

function bookmarkExtra(col, text) {
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

function addBookmark(bookmark, folders, urlList) {
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
    if (urlList) {
      col.id = "bookmarkUrl" + String(urlList.length);
      const urlListEntry = {
        url: url
      };
      if (bookmark.extra) {
        const extra = bookmark.extra;
        urlListEntry.extra = extra;
        bookmarkExtra(col, extra);
      }
      urlList.push(urlListEntry);
    }
    row.appendChild(col);
  } else {
    appendTextNodeCol(row, name);
  }
  const top = getTop();
  top.appendChild(row);
}

function addExtraText(urlList) {
  if (!urlList) {
    return;
  }
  const checkboxFullUrl = getCheckboxFullUrl();
  const fullUrl = (checkboxFullUrl && checkboxFullUrl.checked);
  let extra;
  if (!fullUrl) {
    const checkboxExtra = getCheckboxExtra();
    extra = (checkboxExtra && checkboxExtra.checked);
  }
  for (let i = 0; i < urlList.length; ++i) {
    const col = document.getElementById("bookmarkUrl" + String(i))
    let text;
    if (fullUrl || extra) {
      const urlListEntry = urlList[i];
      if (fullUrl) {
        text = (urlListEntry.url ? urlListEntry.url : null);
      } else {
        text = (urlListEntry.extra ? urlListEntry.extra : null);
      }
    }
    bookmarkExtra(col, text);
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
    if (!isCheckbox(node)) {  // separator
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
    if (!isCheckbox(node)) {  // separator
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
    if (!isCheckbox(node)) {  // separator
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
  if (!value) {
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
  let checkboxesOthers = new Array();
  let checkboxesMe = new Array();
  let groupMatches = false;
  let dateMatch;
  let dateSeen = 0;
  function MarkGroup() {
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
    if (!isCheckbox(node)) {  // separator
      MarkGroup();
      if (checkboxesOthers.length) {  // test for speed reasons
        checkboxesOthers = new Array();
      }
      if (checkboxesMe.length) {  // test for speed reasons
        checkboxesMe = new Array();
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
  MarkGroup();
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
    marked = new Array();
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
  const indices = new Array();
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
    if ((!folder.used) || (!folder.used.size)) {
      delete folders[i];
      continue;
    }
    parent = folder.parent;
    if ((!parent) && (parent !== 0)) {
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
        (folder.used && folder.used.size && ((!folder.usedByChilds)
        || (folder.used.size > folder.usedByChilds)))) {
      ++display;
    }
    delete folder.childs;
    delete folder.usedByChilds;
  }
  return display;
}

function calculate(command, state, callback) {
  let similar;
  let folderMode;
  let handleFunction;
  let urlMap;
  let result;
  let folders;
  let allCount;
  let urlList;

  function calculateError(error) {
    displayMessage("messageCalculateError", error);
    callback();
  }

  function calculateFinish() {
    if (urlList && urlList.length) {
      state.urlList = urlList;
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
      group = new Array();
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
      if ((!node.children) || (!node.children.length)) {
        if ((parent !== null) && !node.unmodifable) {
          if (folderMode) {
            handleFunction(node, parent);
            return;
          } else if (node.url && ((!node.type) || (node.type == "bookmark")) &&
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

  function addButtons(mode) {
    urlList = new Array();
    state.marked = new Set();
    addButtonsMode(mode);
    const display = normalizeFolders(folders);
    if (display > 1) {
      state.folderIds = addSelectFolder(folders);
      state.markFolders = mode;
    }
  }

  function addBookmarks(bookmarkList) {
    for (let bookmark of bookmarkList) {
      addBookmark(bookmark, folders, urlList);
    }
  }

  function calculateDupes(nodes) {
    urlMap = new Map();
    allCount = 0;
    recurse(nodes[0]);
    let groupNumber = 0;
    let total = 0;
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
      addButtons(0);
      addCheckboxExtra(title, similar);
    }
    displayMessage(browser.i18n.getMessage(message,
      [String(total), String(groupNumber), String(allCount)]), title);
    if (groupNumber) {
      displayCount(" ", title);
    }
    let ruler = false;
    for (let group of result) {
      if (!group) {
        continue;
      }
      if (ruler) {
        addRuler();
      } else {
        ruler = true;
      }
      addBookmarks(group);
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
      displayCount(" ", title);
      addBookmarks(result);
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
  folders = new Array();
  result = new Array();
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
      if (isMarked(id)) {
        state.marked.add(id);
      } else {
        state.marked.delete(id);
      }
    } else {
      state.marked = getMarked(true);
    }
    const count = state.marked.size;
    if (count === state.lastCount) {
      return;
    }
    state.lastCount = count;
    displayCount(browser.i18n.getMessage("messageCount", count));
  }

  function endLockMarked() {
    marked();
    endLock();
  }

  function checkboxListener(event) {
    if ((!event.target) || (!event.target.id)) {
      return;
    }
    switch (event.target.id) {
      case "checkboxFullUrl":
      case "checkboxExtra":
        addExtraText(state.urlList);
        return;
      default:  // bookmark checkbox id
        marked(event.target.id);
        return;
    }
  }

  function toggleButtonsFolders() {
    let haveSelected = state.hasOwnProperty("markFolders");
    if (haveSelected) {
      const name = getSelectedFolder();
      if (!name) {
        haveSelected = false;
      }
    }
    if (!haveSelected) {
      clearButtonsFolders();
      return;
    }
    addButtonsFolders(state.markFolders, !state.lock);
  }

  function selectListener(event) {
    if ((!event.target) || (!event.target.id)) {
      return;
    }
    switch (event.target.id) {
      case "selectedFolder":
        toggleButtonsFolders();
    }
  }

  function clickListener(event) {
    if ((!event.target) || (!event.target.id)) {
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
        startLockReset();
        calculate("exact", state, endLockMarked);
        return;
      case "buttonListSimilarDupes":
        startLockReset();
        calculate("similar", state, endLockMarked);
        return;
      case "buttonListEmpty":
        startLockReset();
        calculate("empty", state, endLockMarked);
        return;
      case "buttonListAll":
        startLockReset();
        calculate("all", state, endLockMarked);
        return;
      case "buttonRemoveMarked":
        startLock();
        processMarked(stopPressed, endLockReset);
        return;
      case "buttonStripMarked":
        startLock();
        processMarked(stopPressed, endLockReset, state.bookmarkMap);
        return;
      case "buttonMarkAll":
        startLock();
        mark(true);
        break;
      case "buttonMarkButFirst":
        startLock();
        markButFirst();
        break;
      case "buttonMarkButLast":
        startLock();
        markButLast();
        break;
      case "buttonMarkButOldest":
        startLock();
        markButOldest();
        break;
      case "buttonMarkButNewest":
        startLock();
        markButNewest();
        break;
      case "buttonUnmarkAll":
        startLock();
        mark(false);
        break;
      case "buttonMarkFolder":
        startLock();
        markFolder(state.folderIds, true);
        break;
      case "buttonUnmarkFolder":
        startLock();
        markFolder(state.folderIds, false);
        break;
      case "buttonMarkFolderOther":
        startLock();
        markFolderGroup(state.folderIds, "other");
        break;
      case "buttonMarkFolderButFirst":
        startLock();
        markFolderGroup(state.folderIds, "first");
        break;
      case "buttonMarkFolderButLast":
        startLock();
        markFolderGroup(state.folderIds, "last");
        break;
      case "buttonMarkFolderButOldest":
        startLock();
        markFolderGroup(state.folderIds, "oldest");
        break;
      case "buttonMarkFolderButNewest":
        startLock();
        markFolderGroup(state.folderIds, "newest");
        break;
      default:  // checkboxes: handled by checkboxListener()
        return;
    }
    endLockMarked();
  }

  addButtonsBase();
  document.addEventListener("CheckboxStateChange", checkboxListener);
  document.addEventListener("click", clickListener);
  document.addEventListener("change", selectListener);
  endLock();
}
