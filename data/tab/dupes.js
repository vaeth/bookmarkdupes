/* Copyright (C) 2017-2020 Martin Väth <martin@mvath.de>
 * This project is under the GNU public license 2.0
*/

"use strict";

const compatible = (typeof(browser) != "undefined"
    && Object.getPrototypeOf(browser) === Object.prototype) ? {
  browser: browser,
  getMessage: browser.i18n.getMessage,
  storageGet: function(storageArea, callback, errorCallback) {
    browser.storage[storageArea].get().then(callback, errorCallback);
  },
  bookmarksGetTree: function(callback, errorCallback) {
    browser.bookmarks.getTree().then(callback, errorCallback);
  },
  bookmarksRemove: function(id, callback, errorCallback) {
    browser.bookmarks.remove(id).then(callback, errorCallback);
  },
  bookmarksMove: function(id, destination, callback, errorCallback) {
    browser.bookmarks.move(id, destination).then(callback, errorCallback);
  },
  bookmarksCreate: function(bookmarkData, callback, errorCallback) {
    browser.bookmarks.create(bookmarkData).then(callback, errorCallback);
  }
} : {
  browser: chrome,
  getMessage: chrome.i18n.getMessage,
  callbackOrError: function(callback, error) {
    return function(arg) {
      if (chrome.runtime.lastError) {
        error(chrome.runtime.lastError);
      } else {
        callback(arg);
      }
    };
  },
  storageGet: function(storageArea, callback, errorCallback) {
    chrome.storage[storageArea].get(
      compatible.callbackOrError(callback, errorCallback));
  },
  bookmarksGetTree: function(callback, errorCallback) {
    chrome.bookmarks.getTree(
      compatible.callbackOrError(callback, errorCallback));
  },
  bookmarksRemove: function(id, callback, errorCallback) {
    chrome.bookmarks.remove(id,
      compatible.callbackOrError(callback, errorCallback));
  },
  bookmarksMove: function(id, destination, callback, errorCallback) {
    chrome.bookmarks.move(id, destination,
      compatible.callbackOrError(callback, errorCallback));
  },
  bookmarksCreate: function(bookmarkData, callback, errorCallback) {
    chrome.bookmarks.create(bookmarkData,
      compatible.callbackOrError(callback, errorCallback));
  }
};

function appendX(parent, type, appendItem) {
  const item = document.createElement(type);
  if (typeof(appendItem) != "function") {
    if (appendItem) {
      item.appendChild(appendItem);
    }
    parent.appendChild(item);
    return (appendItem || item);
  }
  const args = Array.apply(null, arguments);
  args.splice(0, 3, item);
  const element = appendItem.apply(null, args);
  parent.appendChild(item);
  return element;
}

function appendCol() {
  const args = Array.apply(null, arguments);
  args.splice(1, 0, "TD");
  return appendX.apply(null, args);
}

function appendRow() {
  const args = Array.apply(null, arguments);
  args.splice(1, 0, "TR", appendCol);
  return appendX.apply(null, args);
}

function appendTextNodeX(row, type, text, title, id) {
  const col = document.createElement(type);
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

function appendTextNodeCol() {
  const args = Array.apply(null, arguments);
  args.splice(1, 0, "TD");
  return appendTextNodeX.apply(null, args);
}

function isChecked(id) {
  const checkbox = document.getElementById(id);
  return (checkbox && checkbox.checked);
}

function setDisabled(item, disabled) {
  if (item && (!item.disabled != !disabled)) {
    item.disabled = !!disabled;
  }
}

function setTitle(text) {
  document.getElementById("pageTitle").textContent = text;
}

function setHeadTitle(text, title) {
  const head = document.getElementById("headTitle");
  head.title = title;
  head.textContent = text;
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

function getTop(check, create) {
  const div = document.getElementById("tableBookmarks");
  if (div.hasChildNodes()) {
    const table = div.firstChild;
    if (!check) {
      return table;
    }
    return (table.hasChildNodes() ? table : null)
  }
  if (!create) {
    return null;
  }
  return appendX(div, "TABLE");
}

function getMessageNode() {
  return document.getElementById("textMessage");
}

function getButtonsRules() {
  return document.getElementById("buttonsRules");
}

function getTableRules() {
  return document.getElementById("tableRules");
}

function isCheckedRules() {
  return isChecked("checkboxRules");
}

function getTableCheckboxRules() {
  return document.getElementById("tableCheckboxRules");
}

function isCheckedFullUrl() {
  return isChecked("checkboxFullUrl");
}

function isCheckedExtra() {
  return isChecked("checkboxExtra");
}

function getValueSelectedFolder() {
  const value = document.getElementById("selectedFolder").value;
  return ((!value || (value === "@")) ? null : value);
}

function getTableCount() {
  return document.getElementById("tableCount");
}

function getTextCount() {
  return document.getElementById("textCount");
}

function isCheckedCount() {
  return isChecked("checkboxCount");
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

function getName(folders, parent, name, separator) {
  if (!separator) {
    separator = " | ";
  }
  while (parent || (parent === 0)) {
    const folder = folders[parent];
    name = folder.name + separator + name;
    parent = folder.parent;
  }
  return name;
}

function appendRadio(parent, id, name, title, checked) {
  const radiobox = document.createElement("INPUT");
  radiobox.type = "radio";
  radiobox.id = id;
  radiobox.name = name;
  if (title) {
    radiobox.title = compatible.getMessage(title);
  }
  if (checked) {
    radiobox.checked = checked;
  }
  parent.appendChild(radiobox);
}

function appendTextarea(parent, title, content, disabled, mutationObserver) {
  const textarea = document.createElement("TEXTAREA");
  if (title) {
    textarea.title = compatible.getMessage(title);
  }
  if (content) {
    textarea.value = content;
  }
  textarea.cols = 18;
  textarea.rows = 2;
  if (disabled) {
    textarea.disabled = true;
  }
  mutationObserver.observe(textarea, {
    attributeFilter: [ "style" ],
    attributes: true
  });
  parent.appendChild(textarea);
  return textarea;
}

function appendCheckbox(parent, id, title, checked, enabled) {
  const checkbox = document.createElement("INPUT");
  checkbox.type = "checkbox";
  if (title) {
    checkbox.title = title;
  }
  if (checked) {
    checkbox.checked = checked;
  }
  checkbox.id = id;
  if (!enabled) {
    checkbox.disabled = true;
  }
  parent.appendChild(checkbox);
}

function createCount(title) {
  const row = document.createElement("TR");
  if (title) {
    row.title = title;
  }
  appendCol(row, appendCheckbox, "checkboxCount", null, true);
  appendTextNodeCol(row, " ", null, "textCount");
  appendX(getTableCount(), "TABLE", row);
}

function appendButton(parent, id, titleId, text, titleText, enabled,
  fontWeightId) {
  const button = document.createElement("BUTTON");
  button.type = "button";
  button.id = id;
  button.textContent = (text || compatible.getMessage(id));
  if (titleId) {
    button.title = compatible.getMessage(titleId);
  } else if (titleText) {
    button.title = titleText;
  }
  if (!enabled) {
    button.disabled = true;
  }
  if (fontWeightId) {
    button.style.fontWeight = compatible.getMessage(fontWeightId);
  }
  parent.appendChild(button);
}

function getRule(row) {
  const radio = row.childNodes[1].firstChild;
  if (radio.nodeName != "INPUT") {
    return null;
  }
  const childNodes = row.childNodes;
  const rule = {};
  if (radio.checked) {
    rule.radio = "filter";
  } else if (childNodes[2].firstChild.checked) {
    rule.radio = "url";
  }
  if (childNodes[4].firstChild.value) {
    rule.name = childNodes[4].firstChild.value;
  }
  if (childNodes[5].firstChild.value) {
    rule.nameNegation = childNodes[5].firstChild.value;
  }
  if (childNodes[7].firstChild.value) {
    rule.url = childNodes[7].firstChild.value;
  }
  if (childNodes[8].firstChild.value) {
    rule.urlNegation = childNodes[8].firstChild.value;
  }
  if (childNodes[10].firstChild.value) {
    rule.search = childNodes[10].firstChild.value;
  }
  if (childNodes[11].firstChild.value) {
    rule.replace = childNodes[11].firstChild.value;
  }
  return rule;
}

function adjustHeight(targetRow, targetColumn, height) {
  let index = 0;
  let found;
  for (let column of targetRow.childNodes) {
    if (!found) {
      if (column === targetColumn) {
        found = true;
        continue;
      }
      ++index;
    }
    if (column.nodeName !== "TD") {
      continue;
    }
    const textarea = (column.firstChild || null);
    if (!textarea || (textarea.nodeName !== "TEXTAREA")) {
      continue;
    }
    const style = textarea.style;
    if (style.height != height) {
      style.height = height;
    }
  }
  return index;
}

function adjustWidth(targetRow, index, width) {
  for (let row of targetRow.parentNode.childNodes) {
    if ((row === targetRow) || (row.nodeName !== "TR")) {
      continue;
    }
    const column = row.childNodes[index];
    if (!column || (column.nodeName !== "TD")) {
      continue;
    }
    const textarea = (column.firstChild || null);
    if (!textarea || (textarea.nodeName !== "TEXTAREA")) {
      continue;
    }
    const style = textarea.style;
    if (style.width != width) {
      style.width = width;
    }
  }
}

function mutationListener(mutationRecords) {
  for (let mutationRecord of mutationRecords) {
    const target = mutationRecord.target;
    if (target.nodeName !== "TEXTAREA") {  // sanity check
      continue;  // should not happen
    }
    const style = target.style;
    const targetColumn = target.parentNode;
    const targetRow = targetColumn.parentNode;
    const index = adjustHeight(targetRow, targetColumn, style.height);
    adjustWidth(targetRow, index, style.width);
  }
}


function addRule(parent, count, total, rule, mutationObserver) {
  if (!rule) {
    rule = {};
  }
  const row = document.createElement("TR");
  const stringCount = String(count);
  appendTextNodeX(row, "TH", stringCount);
  const prefix = "regexpRule=" + stringCount;
  const filter = (rule.radio === "filter");
  const off = (!rule.radio || (rule.radio === "off"));
  const filterOrOff = (filter || off);
  appendCol(row, appendRadio, prefix + "Filter", prefix + "Radio",
    "titleRadioFilter", filter);
  appendCol(row, appendRadio, prefix + "Url", prefix + "Radio",
    "titleRadioUrl", rule.radio === "url");
  appendCol(row, appendRadio, prefix + "Off", prefix + "Radio",
    "titleRadioOff", off);
  appendCol(row, appendTextarea, "titleRuleName", rule.name, off,
    mutationObserver);
  appendCol(row, appendTextarea, "titleRuleNameNegation", rule.nameNegation,
    off, mutationObserver);
  appendCol(row);
  appendCol(row, appendTextarea, "titleRuleUrl", rule.url, off,
    mutationObserver);
  appendCol(row, appendTextarea, "titleRuleUrlNegation", rule.urlNegation,
    off, mutationObserver);
  appendCol(row);
  appendCol(row, appendTextarea, "titleRuleSearch", rule.search,
    filterOrOff, mutationObserver);
  appendCol(row, appendTextarea, "titleRuleReplace", rule.replace,
    filterOrOff, mutationObserver);
  const colUp = document.createElement("TD");
  if ((count > 1) && (total > 1)) {
    appendButton(colUp, "regexpButton=/" + stringCount, "titleButtonRuleUp",
      compatible.getMessage("buttonRuleUp"), null, true,
      "buttonRuleUpFontWeight");
  }
  row.appendChild(colUp);
  const colDown = document.createElement("TD");
  if (count < total) {
    appendButton(colDown, "regexpButton=*" + stringCount,
      "titleButtonRuleDown", compatible.getMessage("buttonRuleDown"),
      null, true, "buttonRuleDownFontWeight");
  }
  row.appendChild(colDown);
  appendCol(row, appendButton, "regexpButton=-" + stringCount,
    "titleButtonRuleSub", compatible.getMessage("buttonRuleSub"), null,
    true);
  appendCol(row, appendButton, "regexpButton=+" + stringCount,
    "titleButtonRuleAdd", compatible.getMessage("buttonRuleAdd"), null,
    true);
  parent.appendChild(row);
}

function changeRule(id) {
  const child = document.getElementById(id);
  if (!child) {
    return;
  }
  const row = child.parentNode.parentNode;
  const rule = getRule(row);
  if (!rule) {
    return;
  }
  const filter = (rule.radio === "filter");
  const off = (!rule.radio || (rule.radio === "off"));
  const filterOrOff = (filter || off);
  const childNodes = row.childNodes;
  setDisabled(childNodes[4].firstChild, off);
  setDisabled(childNodes[5].firstChild, off);
  setDisabled(childNodes[7].firstChild, off);
  setDisabled(childNodes[8].firstChild, off);
  setDisabled(childNodes[10].firstChild, filterOrOff);
  setDisabled(childNodes[11].firstChild, filterOrOff);
}

function addButtonsRules(storageArea, restore, clean) {
  const id = ((storageArea === "local") ? "buttonsRulesLocal" :
    "buttonsRulesSync");
  const existingRow = document.getElementById(id);
  if (existingRow) {  // Buttons are already displayed; only adjust state
    const childNodes = existingRow.childNodes;
    setDisabled(childNodes[2].firstChild, !restore);
    setDisabled(childNodes[3].firstChild, !clean);
    return;
  }
  const row = document.createElement("TR");
  row.id = id;
  if (storageArea === "local") {
    appendCol(row, appendButton, "buttonRulesDefault",
      "titleButtonRulesDefault", null, null, true);
    appendCol(row, appendButton, "buttonRulesStoreLocal",
      "titleButtonRulesStoreLocal", null, null, true);
    appendCol(row, appendButton, "buttonRulesRestoreLocal",
      "titleButtonRulesRestoreLocal", null, null, restore);
    appendCol(row, appendButton, "buttonRulesCleanLocal",
      "titleButtonRulesCleanLocal", null, null, clean);
  } else {
    appendCol(row);
    appendCol(row, appendButton, "buttonRulesStoreSync",
      "titleButtonRulesStoreSync", null, null, true);
    appendCol(row, appendButton, "buttonRulesRestoreSync",
      "titleButtonRulesRestoreSync", null, null, restore);
    appendCol(row, appendButton, "buttonRulesCleanSync",
      "titleButtonRulesCleanSync", null, null, clean);
  }
  const parent = getButtonsRules();
  if (!parent.hasChildNodes()) {
    appendX(parent, "TABLE", row);
    return;
  }
  const table = parent.firstChild;
  if (storageArea === "local") {
    table.insertBefore(row, table.firstChild);
  } else {
    table.appendChild(row);
  }
}

function addRules(rules, mutationObserver) {
  const parent = getTableRules();
  if (parent.hasChildNodes()) {  // Already done
    return;
  }
  const row = document.createElement("TR");
  appendX(row, "TH");
  appendTextNodeX(row, "TH", compatible.getMessage("radioFilter"),
    compatible.getMessage("titleRadioFilter"));
  appendTextNodeX(row, "TH", compatible.getMessage("radioUrl"),
    compatible.getMessage("titleRadioUrl"));
  appendTextNodeX(row, "TH", compatible.getMessage("radioOff"),
    compatible.getMessage("titleRadioOff"));
  appendTextNodeX(row, "TH", compatible.getMessage("ruleName"),
    compatible.getMessage("titleRuleName"));
  appendTextNodeX(row, "TH", compatible.getMessage("ruleNameNegation"),
    compatible.getMessage("titleRuleNameNegation"));
  appendTextNodeX(row, "TH", "\xa0\xa0");
  appendTextNodeX(row, "TH", compatible.getMessage("ruleUrl"),
    compatible.getMessage("titleRuleUrl"));
  appendTextNodeX(row, "TH", compatible.getMessage("ruleUrlNegation"),
    compatible.getMessage("titleRuleUrlNegation"));
  appendTextNodeX(row, "TH", "\xa0\xa0");
  appendTextNodeX(row, "TH", compatible.getMessage("ruleSearch"),
    compatible.getMessage("titleRuleSearch"));
  appendTextNodeX(row, "TH", compatible.getMessage("ruleReplace"),
    compatible.getMessage("titleRuleReplace"));
  for (let i = 0; i < 3; ++i) {
    appendCol(row);
  }
  appendCol(row, appendButton, "regexpButton=+0", "titleButtonRuleAdd",
    compatible.getMessage("buttonRuleAdd"), null, true);
  const table = document.createElement("TABLE");
  table.appendChild(row);
  const total = rules.length;
  let count = 0;
  for (let rule of rules) {
    addRule(table, ++count, total, rule, mutationObserver);
  }
  parent.appendChild(table);
}


function appendWarningExpert(row, title, warningId, textId) {
  const warning = document.createElement("STRONG");
  warning.textContent = compatible.getMessage(warningId);
  const text = document.createTextNode(compatible.getMessage(textId));
  const col = document.createElement("TD");
  col.title = title;
  col.appendChild(warning);
  col.appendChild(text);
  row.appendChild(col);
}

function addCheckboxRules() {
  const title = compatible.getMessage("titleCheckboxRules");
  const col = document.createElement("TD");
  col.rowSpan = 2;
  col.style.verticalAlign = "middle";
  appendCheckbox(col, "checkboxRules", title , false, true);
  const row1 = document.createElement("TR");
  row1.appendChild(col);
  appendWarningExpert(row1, title, "warningExpertStrong", "warningExpertText");
  const table = document.createElement("TABLE");
  table.appendChild(row1);
  const row2 = document.createElement("TR");
  appendTextNodeCol(row2, compatible.getMessage("CheckboxRules"), title);
  table.appendChild(row2);
  getTableCheckboxRules().appendChild(table);
}

function addButtonsBase() {
  const parent = getButtonsBase();
  if (parent.hasChildNodes()) {  // Already done
    return;
  }
  addCheckboxRules();
  const row = document.createElement("TR");
  appendCol(row, appendButton, "buttonListDupes", "titleButtonListDupes");
  appendCol(row, appendButton, "buttonListEmpty", "titleButtonListEmpty");
  appendCol(row, appendButton, "buttonListSingles", "titleButtonListSingles");
  appendX(parent, "TABLE", row);
}

function addButtonRemove() {
  const row = document.createElement("TR");
  const title = compatible.getMessage("titleButtonRemoveMarked");
  row.title = title;
  const col = document.createElement("TD");
  col.width = "50pt";
  col.style.height = "50pt";
  col.style.textAlign = "center";
  const text = document.createTextNode(
     compatible.getMessage("warningRemoveMarked"));
  const strong = document.createElement("STRONG");
  strong.appendChild(text);
  col.appendChild(strong);
  row.appendChild(col);
  appendCol(row, appendButton, "buttonRemoveMarked");
  appendCol(row, appendButton, "buttonMoveMarked", null,
      compatible.getMessage("buttonMoveMarked").replace(/\{0\}/g,
        compatible.getMessage("trashFolder")));
  appendX(getButtonsRemove(), "TABLE", row);
}

function addButtonsSame(enabled) {
  const parent = getButtonsFolders();
  if (parent.hasChildNodes()) {  // Already done
    return;
  }
  const table = document.createElement("TABLE");
  appendRow(table, appendButton, "buttonMarkSame", "titleButtonMarkFolder",
    null, null, enabled);
  appendRow(table, appendButton, "buttonUnmarkSame", "titleButtonUnmarkFolder",
    null, null, enabled);
  appendRow(table, appendButton, "buttonMarkSameButFirst",
    "titleButtonMarkSameButFirst", null, null, enabled);
  appendRow(table, appendButton, "buttonMarkSameButLast",
    "titleButtonMarkSameButLast", null, null, enabled);
  appendRow(table, appendButton, "buttonMarkSameButOldest",
    "titleButtonMarkSameButOldest", null, null, enabled);
  appendRow(table, appendButton, "buttonMarkSameButNewest",
    "titleButtonMarkSameButNewest", null, null, enabled);
  parent.appendChild(table);
}

function addButtonsFolders(mode, enabled) {
  const parent = getButtonsFolders();
  if (parent.hasChildNodes()) {  // Already done
    return;
  }
  const table = document.createElement("TABLE");
  appendRow(table, appendButton, "buttonMarkFolder", "titleButtonMarkFolder",
    null, null, enabled);
  appendRow(table, appendButton, "buttonUnmarkFolder",
    "titleButtonUnmarkFolder", null, null, enabled);
  if (!mode) {
    appendRow(table, appendButton, "buttonMarkFolderOther",
      "titleButtonMarkFolderOther", null, null, enabled);
    appendRow(table, appendButton, "buttonMarkFolderButFirst",
      "titleButtonMarkFolderButFirst", null, null, enabled);
    appendRow(table, appendButton, "buttonMarkFolderButLast",
      "titleButtonMarkFolderButLast", null, null,  enabled);
    appendRow(table, appendButton, "buttonMarkFolderButOldest",
      "titleButtonMarkFolderButOldest", null, null, enabled);
    appendRow(table, appendButton, "buttonMarkFolderButNewest",
      "titleButtonMarkFolderButNewest", null, null, enabled);
  }
  parent.appendChild(table);
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
  select.title = compatible.getMessage("titleSelectFolder");
  select.id = "selectedFolder";
  addSelectOption(select, compatible.getMessage("optionNonFolder"), "@");
  if (sameFolders) {
    addSelectOption(select, compatible.getMessage("optionSameFolder"), "=");
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
  appendX(getSelectFolder(), "TABLE", row);
}

function addButtonsMark(mode) {
  const table = document.createElement("TABLE");
  if (!mode) {
    const row1 = document.createElement("TR");
    appendCol(row1, appendButton, "buttonMarkButFirst",
      "titleButtonMarkButFirst");
    appendCol(row1, appendButton, "buttonMarkButLast",
      "titleButtonMarkButLast");
    table.appendChild(row1);
    const row2 = document.createElement("TR");
    appendCol(row2, appendButton, "buttonMarkButOldest",
      "titleButtonMarkButOldest");
    appendCol(row2, appendButton, "buttonMarkButNewest",
      "titleButtonMarkButNewest");
    table.appendChild(row2);
  }
  let row = document.createElement("TR");
  appendCol(row, appendButton, "buttonMarkAll", "titleButtonMarkAll");
  appendCol(row, appendButton, "buttonUnmarkAll", "titleButtonUnmarkAll");
  table.appendChild(row);
  getButtonsMark().appendChild(table);
}

function addButtonsMode(mode) {
  addButtonRemove();
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
    compatible.getMessage(textId), null, true);
}

function addCheckboxExtra(title, extra) {
  const row = document.createElement("TR");
  appendCol(row, appendCheckbox, "checkboxFullUrl", title);
  appendTextNodeCol(row, compatible.getMessage("checkboxFullUrl"), title);
  const table = document.createElement("TABLE");
  table.appendChild(row);
  if (extra) {
    const rowExtra = document.createElement("TR");
    appendCol(rowExtra, appendCheckbox, "checkboxExtra", title, true);
    appendTextNodeCol(rowExtra, compatible.getMessage("checkboxExtra"),
      title);
    table.appendChild(rowExtra);
  }
  const parent = getCheckboxOptions();
  parent.appendChild(table);
}

function enableButtonsOf(node, enabled) {
  if (!node || !node.hasChildNodes()) {
    return;
  }
  const disabled = ((enabled !== undefined) && !enabled);
  for (let child of node.childNodes) {
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

function clearItem(node) {
  if (!node) {
    return;
  }
  while (node.lastChild) {
    node.removeChild(node.lastChild);
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
    if (col.childNodes.length > 1) {
      col.removeChild(col.lastChild);
    }
    return;
  }
  if (col.childNodes.length > 1) {
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
  appendX(getTop(false, true), "TR", col);
}

function entryExtra(col, text) {
  rulerExtra(col, text);  // by accident the same mechanism works
}

function getBookmarkId(id) {
  return id.substr(9);  // 9 = "bookmark=".length
}

function addBookmark(bookmark, folders, id) {
  const row = document.createElement("TR");
  appendCol(row, appendCheckbox, "bookmark=" + bookmark.id);
  if (bookmark.order !== undefined) {
    appendTextNodeCol(row, String(bookmark.order));
    appendCol(row);
  }
  const name = getName(folders, bookmark.parent, bookmark.text);
  if (bookmark.url) {
    const col = document.createElement("TD");
    const url = bookmark.url;
    row.title = url;
    const link = document.createElement("A");
    link.href = url;
    link.target = "_blank";
    link.textContent = name;
    link.referrerpolicy = "no-referrer";
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
  getTop(false, true).appendChild(row);
}

function getRules() {
  const parent = getTableRules();
  const rules = [];
  if (!parent.hasChildNodes()) {
    return rules;
  }
  const table = parent.firstChild;
  if (!table.hasChildNodes()) {
    return rules;
  }
  for (let row of table.childNodes) {
    const rule = getRule(row);
    if (rule) {
      rules.push(rule);
    }
  }
  return rules;
}

function redisplayRules(rules, mutationObserver) {
  clearItem(getTableRules());
  mutationObserver.disconnect();
  if (isCheckedRules()) {
    addRules(rules, mutationObserver);
  }
}

function buttonRule(action, mutationObserver) {
  const rules = getRules();
  let number = Number(action.substr(1));
  const type = action.substr(0, 1);
  switch(type) {
    case "+": {
        const rule = {};
        rules.splice(number, 0, rule);
      }
      break;
    case "-":
      rules.splice(number - 1, 1);
      break;
    case "/":
      --number;
    case "*": {
        const rule = rules[number - 1];
        rules[number - 1] = rules[number];
        rules[number] = rule;
      }
      break;
    default:  // should not happen
      return;  // it is a bug if we get here
  }
  redisplayRules(rules, mutationObserver);
}

function haveStorageSync() {  // check if supported by browser
  return (compatible.browser.storage.sync
    && compatible.browser.storage.sync.get
    && (typeof(compatible.browser.storage.sync.get) == "function"));
}

function buttonsRulesQuick(storageArea, mutationObserver) {
  compatible.storageGet(storageArea, function (storage) {
    if (!isCheckedRules()) {  // async race: user might have changed
      return;
    }
    if (!storage || !Object.getOwnPropertyNames(storage).length) {
      addButtonsRules(storageArea, false, false);
      return;
    }
    if (!storage.rulesV1) {
      addButtonsRules(storageArea, false, true);
      return;
    }
    if (mutationObserver) {
      redisplayRules(storage.rulesV1, mutationObserver);
    }
    addButtonsRules(storageArea, true, true);
  }, function () {
    if (!isCheckedRules()) {  // async race: user might have changed
      return;
    }
    addButtonsRules(storageArea, false, true);
  });
}

function buttonsRules(storageArea, mutationObserver) {
  if (isCheckedRules()) {
    buttonsRulesQuick(storageArea, mutationObserver);
  }
}

function toggleRules(rules, mutationObserver) {
  mutationObserver.disconnect();
  if (isCheckedRules()) {
    addRules(rules, mutationObserver);
    buttonsRulesQuick("local");
    if (haveStorageSync()) {
      buttonsRulesQuick("sync");
    }
    return null;
  }
  if (rules) {  // checkboxRules was already unchecked
    return rules;
  }
  const newRules = getRules();
  clearItem(getTableRules());
  clearItem(getButtonsRules());
  return newRules;
}

function toggleExtra(entryList, rulerList) {
  if (!entryList && !rulerList) {
    return;
  }
  const fullUrl = isCheckedFullUrl();
  if (rulerList) {
    for (let i = 0; i < rulerList.length; ++i) {
      const col = document.getElementById("rulerExtra=" + String(i));
      rulerExtra(col, (fullUrl ? rulerList[i] : null));
    }
  }
  if (!entryList) {
    return;
  }
  let extra = isCheckedExtra();
  for (let i = 0; i < entryList.length; ++i) {
    const col = document.getElementById("entryExtra=" + String(i));
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
  const top = getTop(true);
  if (!top) {
    return;
  }
  for (let node of top.childNodes) {
    if (isCheckbox(node)) {
      setCheck(node, mode);
    }
  }
}

function markButFirst() {
  const top = getTop(true);
  if (!top) {
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
  const top = getTop(true);
  if (!top) {
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
  const top = getTop(true);
  if (!top) {
    return;
  }
  for (let node of top.childNodes) {
    if (isCheckbox(node)) {
      setCheck(node, (getOrder(node) != 1));
    }
  }
}

function markButNewest() {
  const top = getTop(true);
  if (!top) {
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

function getSelectedIds(folderIds) {
  const value = getValueSelectedFolder();
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
  const top = getTop(true);
  if (!top) {
    return;
  }
  for (let node of top.childNodes) {
    if (!isCheckbox(node)) {
      continue;
    }
    const checkbox = getCheckbox(node);
    if (!ids.has(getBookmarkId(checkbox.id))) {
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
  const top = getTop(true);
  if (!top) {
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
    if (!ids.has(getBookmarkId(checkbox.id))) {
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
  const top = getTop(true);
  if (!top) {
    return;
  }
  for (let node of top.childNodes) {
    if (!isCheckbox(node)) {
      continue;
    }
    const checkbox = getCheckbox(node);
    const folder = folders.get(getBookmarkId(checkbox.id));
    if (folder === undefined) {
      continue;
    }
    checkbox.checked = checked;
  }
}

function markSameGroup(folders, mode) {
  const top = getTop(true);
  if (!top) {
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
    const id = getBookmarkId(checkbox.id);
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
  const top = getTop(true);
  if (!top) {
    return marked;
  }
  for (let node of top.childNodes) {
    if (!isCheckbox(node)) {
      continue;
    }
    const checkbox = getCheckbox(node);
    if (checkbox.checked) {
      adding(getBookmarkId(checkbox.id));
    }
  }
  return marked;
}

function displayProgress(textId, buttonTextId, total, todo) {
  const percentage = (100 * total) / todo;
  addProgressButton(buttonTextId, percentage);
  displayMessage(compatible.getMessage(textId,
    [String(total), String(todo), String(Math.round(percentage))]));
}

function displayEndProgress(textId, total, error) {
  clearWindow();
  if (error) {
    displayMessage(compatible.getMessage(textId,
      [error, String(total)]));
  } else {
    displayMessage(compatible.getMessage(textId, String(total)));
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

function textToLowerCase(text) {
  return text.toLowerCase();
}

function textToUpperCase(text) {
  return text.toUpperCase();
}

function compileRules(mode) {
  const compiledRules = {};
  if (!isCheckedRules()) {
    return compiledRules;
  }
  const rules = getRules();
  const compiled = [];
  let count = 0;
  for (let rule of rules) {
    ++count;
    const replaceRule = ((mode > 0) && rule.search && (rule.radio === "url"));
    if (!replaceRule && (rule.radio !== "filter")) {
      continue;
    }
    let name, url;
    const compiledRule = {};
    try {
      if (rule.name) {
        name = true;
        compiledRule.name = new RegExp(rule.name);
      }
      if (rule.nameNegation) {
        name = true;
        compiledRule.nameNegation = new RegExp(rule.nameNegation);
      }
      if (mode) {
        if (rule.url) {
          url = true;
          compiledRule.url = new RegExp(rule.url);
        }
        if (rule.urlNegation) {
          url = true;
          compiledRule.urlNegation = new RegExp(rule.urlNegation);
        }
        if (replaceRule) {
          compiledRule.search = new RegExp(rule.search, "g");
        }
      }
    }
    catch(error) {
      compiledRules.error = error;
      return compiledRules;
    }
    if (replaceRule) {
      if (!rule.replace) {
        compiledRule.replace = "";
      } else {
        switch (rule.replace) {
          case "\\L\$\&":
            compiledRule.replace = textToLowerCase;
            break;
          case "\\U\$\&":
            compiledRule.replace = textToUpperCase;
            break;
          case "\$URL":
            compiledRule.replace = 0;
            compiledRules.needSpecials = true;
            break;
          case "\$\&\$URL":
            compiledRule.replace = 1;
            compiledRules.needSpecials = true;
            break;
          case "\$URL\$\&":
            compiledRule.replace = 2;
            compiledRules.needSpecials = true;
            break;
          case "\$NAME":
            compiledRule.replace = 3;
            compiledRules.needSpecials = compiledRules.needName = true;
            break;
          case "\$\&\$NAME":
            compiledRule.replace = 4;
            compiledRules.needSpecials = compiledRules.needName = true;
            break;
          case "\$NAME\$\&":
            compiledRule.replace = 5;
            compiledRules.needSpecials = compiledRules.needName = true;
            break;
          case "\$TITLE":
            compiledRule.replace = 6;
            compiledRules.needSpecials = true;
            break;
          case "\$\&\$TITLE":
            compiledRule.replace = 7;
            compiledRules.needSpecials = true;
            break;
          case "\$TITLE\$\&":
            compiledRule.replace = 8;
            compiledRules.needSpecials = true;
            break;
          default:
            compiledRule.replace = rule.replace;
        }
      }
    }
    if (name || url) {
      compiledRule.conditional = true;
      if (name) {
        compiledRules.needName = true;
      }
    } else if (!replaceRule) {
      continue;
    }
    compiledRule.prefix = String(count) + ": ";
    compiled.push(compiledRule);
  }
  if (compiled.length) {
    compiledRules.compiled = compiled;
  }
  return compiledRules;
}

function rulesFilter(compiledRules, folders, parent, title, url, processed) {
  const compiled = (compiledRules.compiled || false);
  if (!compiled) {  // shortcut most likely case
    if (processed) {
      processed.url = url;
    }
    return false;
  }
  // name and specials are calculated only if we really need them
  const name = (compiledRules.needName &&
    getName(folders, parent, title, "\0"));
  let specials;
  if (compiledRules.needSpecials) {
    const originalUrl = url;
    specials = [
      function () { return originalUrl; },
      function (found) { return found.concat(originalUrl); },
      function (found) { return originalUrl.concat(found); },
      function () { return name; },
      function (found) { return found.concat(name); },
      function (found) { return name.concat(found); },
      function () { return title; },
      function (found) { return found.concat(title); },
      function (found) { return title.concat(found); }
    ];
  }
  let extra;
  for (let compiledRule of compiled) {
    if (compiledRule.conditional) {
      if (compiledRule.name && !compiledRule.name.exec(name)) {
        continue;
      }
      if (compiledRule.nameNegation && compiledRule.nameNegation.exec(name)) {
        continue;
      }
      if (compiledRule.url && !compiledRule.url.exec(url)) {
        continue;
      }
      if (compiledRule.urlNegation && compiledRule.urlNegation.exec(url)) {
        continue;
      }
    }
    const search = (compiledRule.search || false);
    if (!search) {
      return true;
    }
    const matches = url.match(search);
    if (!matches) {
      continue;
    }
    let replacedUrl;
    let replace = compiledRule.replace;
    if (typeof(replace) == "number") {
      replace = specials[replace];
    }
    try {
      replacedUrl = url.replace(search, replace);
    }
    catch(error) {
      replacedUrl = false;
    }
    if (replacedUrl == url) {
      continue;
    }
    url = replacedUrl;
    if (extra) {
      extra += " ";
    } else {
      extra = "";
    }
    extra += compiledRule.prefix + matches.join(" ").replace(/\0/g, "\\0");
  }
  if (processed) {
    processed.url = url;
    if (extra) {
      processed.extra = extra;
    }
  }
  return false;
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
  let extra;
  let compiledRules;
  let folderMode;
  let handleFunction;
  let urlMap;
  let result;
  let folders;
  let allCount;
  let entryList;

  function calculateError(error) {
    displayMessage(compatible.getMessage("messageCalculateError", error));
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
    const title = node.title;
    const url = node.url;
    const processed = {};
    if (rulesFilter(compiledRules, folders, parent, title, url, processed)) {
      return;
    }
    const groupIndex = processed.url;
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
      text: title,
      url: url
    };
    if (processed.extra) {
      extra = true;
      bookmark.extra = processed.extra;
    }
    group.push(bookmark);
  }

  function handleEmpty(node, parent) {
    if (node.url || (node.type && (node.type != "folder"))) {
      return;
    }
    const title = node.title;
    if (rulesFilter(compiledRules, folders, parent, title)) {
      return;
    }
    const id = node.id;
    parentUsed(parent, id);
    const bookmark = {
      id: id,
      parent: parent,
      text: title
    };
    result.push(bookmark);
  }

  function handleSingles(node, parent) {
    ++allCount;
    const title = node.title;
    const url = node.url;
    const processed = {};
    if (rulesFilter(compiledRules, folders, parent, title, url, processed)) {
      return;
    }
    const processedUrl = processed.url;
    let bookmark = urlMap.get(processedUrl);
    if (bookmark !== undefined) {
      if (bookmark) {
        parentUnused(bookmark.parent, bookmark.id);
        urlMap.set(processedUrl, null);
      }
      return;
    }
    const id = node.id;
    parentUsed(parent, id);
    bookmark = {
      id: id,
      parent: parent,
      text: title,
      url: url
    };
    urlMap.set(processedUrl, bookmark);
    result.push(processedUrl);
  }

  function recurse(node) {
    function recurseMain(node, parent, index) {
      if (!node.children || !node.children.length) {
        if ((parent !== null) && !node.unmodifable) {
          if (folderMode) {
            handleFunction(node, parent);
            return;
          } else if (node.url && (!node.type || (node.type == "bookmark")) &&
              !node.url.startsWith("place:")) {
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
        id = "entryExtra=" + String(entryList.length);
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
    const title = compatible.getMessage("titleMessageMatches");
    if (groupNumber) {
      addButtons(0, sameFolders);
      addCheckboxExtra(title, extra);
    }
    displayMessage(compatible.getMessage("messageMatches",
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
      if (!extra || coincidingUrl(group, url)) {
        const id = "rulerExtra=" + String(rulerList.length);
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
    const title = compatible.getMessage("titleMessageEmpty");
    if (total) {
      addButtons(1);
    }
    displayMessage(compatible.getMessage("messageEmpty", String(total)),
      title);
    if (total) {
      createCount(title);
      addBookmarks(result);
    }
    calculateFinish();
  }

  function calculateSingles(nodes) {
    urlMap = new Map();
    allCount = 0;
    recurse(nodes[0]);
    const singles = [];
    for (let url of result) {
      const bookmark = urlMap.get(url);
      if (bookmark) {
        singles.push(bookmark);
      }
    }
    const total = singles.length;
    const title = compatible.getMessage("titleMessageSingles");
    if (total) {
      addButtons(1);
    }
    displayMessage(compatible.getMessage("messageSingles",
      [String(total), String(allCount)]), title);

    if (total) {
      createCount(title);
      addBookmarks(singles);
    }
    calculateFinish();
  }

  clearWindow();
  displayMessage(compatible.getMessage("messageCalculating"));
  let mainFunction;
  folderMode = false;
  switch (command) {
    case "dupes":
      compiledRules = compileRules(1);
      mainFunction = calculateDupes;
      handleFunction = handleDupe;
      break;
    case "empty":
      folderMode = true;
      compiledRules = compileRules(0);
      mainFunction = calculateEmpty;
      handleFunction = handleEmpty;
      break;
    case "singles":
      compiledRules = compileRules(1);
      mainFunction = calculateSingles;
      handleFunction = handleSingles;
      break;
    default:  // should not happen
      return;  // it is a bug if we get here
  }
  if (compiledRules.error) {
    calculateError(compiledRules.error);
    return;
  }
  folders = [];
  result = [];
  compatible.bookmarksGetTree(mainFunction, calculateError);
}

function removeFolder(id, callback, errorCallback) {
  compatible.bookmarksRemove(id, callback, errorCallback);
}

function moveFolder(id, destination, callback, errorCallback) {
  compatible.bookmarksMove(id, destination, callback, errorCallback);
}

function getFirstFolder(parent, title) {
  for (let node of parent.children) {
    if (!node.url && (node.type !== "bookmark")) {
      if (!title || (node.title === title)) {
        return node;
      }
    }
  }
  return null;
}

function processMarked(stopPressed, callback, moveToTrash) {
  const marked = getMarked();
  const todo = marked.length;
  let total = 0;

  function finish() {
    displayEndProgress("messageRemoveSuccess", total);
    callback();
  }

  let finishId;
  let progress;
  let process;
  let mainAction;
  let finishError;

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

  if (!moveToTrash) {
    displayMessage(compatible.getMessage("messageRemoveMarked"));
    finishId = "messageRemoveSuccess";
    progress = function () {
      displayProgress("messageRemoveProgress", "buttonStopRemoving",
        total, todo);
      return stopPressed();
    };
    finishError = function (error) {
      displayEndProgress("messageRemoveError", total, error);
      callback();
    };
    process = function (id, next) {
      removeFolder(id, next, finishError);
    };
    mainAction = recurse;
  } else {
    displayMessage(compatible.getMessage("messageMoveMarked"));
    finishId = "messageMoveSuccess";
    progress = function () {
      displayProgress("messageMoveProgress", "buttonStopMoving",
        total, todo);
      return stopPressed();
    };
    finishError = function (error) {
      displayEndProgress("messageMoveError", total, error);
      callback();
    };
    mainAction = function () {
      function setTrashNode(trashNode) {
        let destination = {
          parentId: trashNode.id
        };
        process = function (id, next) {
          moveFolder(id, destination, next, finishError);
        };
      }

      compatible.bookmarksGetTree(function (nodes) {
        let parent = getFirstFolder(nodes[0]);
        if (!parent) {
          finishError(compatible.getMessage("errorNoBookmarkFolderFound"));
          return;
        }
        let trash = compatible.getMessage("trashFolder");
        let trashNode = getFirstFolder(parent, trash);
        if (trashNode) {
          setTrashNode(trashNode);
          recurse();
        } else {
          compatible.bookmarksCreate({
            parentId: parent.id,
            type: "folder",
            title: trash
          }, function (trashNodeArg) {
            setTrashNode(trashNodeArg);
            recurse();
          }, finishError);
        }
      }, finishError);
    };
  }

  if (!marked.length) {
    finish();
    return;
  }
  displayMessage(compatible.getMessage("messageRemoveMarked"));
  mainAction();
}

function rulesStore(storageArea) {
  const storage = {
    rulesV1: getRules()
  };
  compatible.browser.storage[storageArea].set(storage);
}

function rulesClean(storageArea) {
  compatible.browser.storage[storageArea].clear();
}

function marked(state, id) {
  if (!state.marked) {
    return;
  }
  if (id) {
    if (!isCheckedCount()) {
      return;
    }
    if (isChecked(id)) {
      state.marked.add(getBookmarkId(id));
    } else {
      state.marked.delete(getBookmarkId(id));
    }
  } else {
    if (!isCheckedCount()) {
      if (state.hasOwnProperty("lastCount")) {
        delete state.lastCount;
        displayCount(compatible.getMessage("messageNoCount"));
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
  displayCount(compatible.getMessage("messageCount", String(count)));
}

function storageListener(changes, storageArea) {
  switch(storageArea) {
    case "sync":
      if (!haveStorageSync()) {  // only if supported by browser
        return;
      }
      break;
    case "local":
      break;
    default:  // unsupported storageArea (e.g. "managed")
      return;
  }
  buttonsRules(storageArea);
}

function checkCompatibility() {
  if (compatible.browser
      && compatible.browser.bookmarks
      && compatible.browser.bookmarks.getTree
      && typeof(compatible.browser.bookmarks.getTree) == "function") {
    return true;
  }
  displayMessage(compatible.getMessage("errorNoBookmarks"));
  return false;
}

function initMain() {
  // state variables
  let state = {};
  let rules;
  const rulesDefault = [
    { radio: "url", search: "^\\w\+://\[\^\/\]*/", replace: "\\L\$\&" },
    { radio: "filter", name:
      "^[^\\0]\+\\0" + compatible.getMessage("regExpTrashFolder") + "\\0" },
    { radio: "off", nameNegation: "\\0.*\\0" },
    { radio: "off", urlNegation: "\\b\(e?mail|bugs|youtube|translat\)\\b",
      search: "\\?.*" },
    { radio: "off", search: "/[^/]*\$" },
    { radio: "url", search: "/\+\(index\\.html\)?\$" },
    { radio: "url", search: "^http:", replace: "https:" },
    { radio: "url", search: "^([^:]*://)www?\\d*\\.", replace: "\$1" },
    { radio: "url", search: "\\.htm\$", replace: ".html" },
    { radio: "off", search: ".\+", replace: "\$\&\$TITLE" },
    { radio: "off", search: ".\+", replace: "DEBUG: \$\&" }
  ];
  let mutationObserver;

  function startLock() {
    state.lock = true;
    enableButtons(false);
  }

  function endLock() {
    state.lock = false;
    enableButtons();
  }

  function stopPressed() {
    return (state.stop || false);
  }

  function endLockReset() {
    state = {};
    endLock();
  }

  function endLockAll() {
    marked(state);
    enableBookmarks();
    endLock();
  }

  function rulesRestore(storageArea) {
    buttonsRules(storageArea, mutationObserver);
  }

  function initRulesDefault() {
    rules = toggleRules(rulesDefault, mutationObserver);
  }

  function initRulesStorage(storageArea, callback) {
    compatible.storageGet(storageArea, function (storage) {
      if (storage && storage.rulesV1) {
        rules = toggleRules(storage.rulesV1, mutationObserver);
        return;
      }
      callback();
    }, callback);
  }

  function initRulesSync() {
    const callback = initRulesDefault;
    if (!haveStorageSync()) {
      callback();
      return;
    }
    initRulesStorage("sync", callback);
  }

  function initRulesLocal() {
    initRulesStorage("local", initRulesSync);
  }

  function checkboxRules() {
    if (rules === undefined) {  // first call
      if (mutationObserver === undefined) {  // be aware of possible race
        mutationObserver = new MutationObserver(mutationListener);
      }
      initRulesLocal();
    } else {
      rules = toggleRules(rules, mutationObserver);
    }
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
        marked(state);
        return;
      case "checkboxRules":
        checkboxRules();
        return;
      default:
        const id = event.target.id;
        if (id.startsWith("bookmark=")) {  // bookmark checkbox id
          marked(state, id);
          return;
        }
    }
  }

  function toggleButtonsFolders() {
    let haveSelected = state.hasOwnProperty("markFolders");
    let sameFolders = false;
    if (haveSelected) {
      const name = getValueSelectedFolder();
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

  function changeListener(event) {
    if (!event.target || !event.target.id) {
      return;
    }
    const id = event.target.id;
    switch (id) {
      case "selectedFolder":
        toggleButtonsFolders();
        return;
      default:
        if (id.startsWith("regexpRule=")) {  // rule radio button
          changeRule(id);
          return;
        }
    }
  }

  function calculateWrapper(command) {
    state = {};
    startLock();
    setTimeout(function () {
      calculate(command, state, endLockAll);
    });
  }

  function processWrapper(moveToTrash) {
    startLock();
    setTimeout(function () {
      processMarked(stopPressed, endLockReset, moveToTrash);
    });
  }

  function markWrapper(mainFunction, arg1, arg2) {
    startLock();
    enableBookmarks(false);
    setTimeout(function () {
      mainFunction(arg1, arg2);
      endLockAll();
    });
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
    const id = event.target.id;
    switch (id) {
      case "buttonListDupes":
        calculateWrapper("dupes");
        return;
      case "buttonListEmpty":
        calculateWrapper("empty");
        return;
      case "buttonListSingles":
        calculateWrapper("singles");
        return;
      case "buttonRemoveMarked":
        processWrapper(false);
        return;
      case "buttonMoveMarked":
        processWrapper(true);
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
      case "buttonRulesDefault":
        redisplayRules(rulesDefault, mutationObserver);
        return;
      case "buttonRulesStoreLocal":
        rulesStore("local");
        return;
      case "buttonRulesRestoreLocal":
        rulesRestore("local");
        return;
      case "buttonRulesCleanLocal":
        rulesClean("local");
        return;
      case "buttonRulesStoreSync":
        rulesStore("sync");
        return;
      case "buttonRulesRestoreSync":
        rulesRestore("sync");
        return;
      case "buttonRulesCleanSync":
        rulesClean("sync");
        return;
      default:
        if (id.startsWith("regexpButton=")) {
          buttonRule(id.substring(13),  // 13 = "regexpButton=".length
            mutationObserver);
          return;
        }
      // checkboxes: handled by checkboxListener()
      // radioButtons, select: handled by changeListener()
    }
  }

  const title = compatible.getMessage("extensionName");
  setTitle(title);
  setHeadTitle(title, compatible.getMessage("extensionDescription"));
  if (!checkCompatibility()) {
    return;
  }
  addButtonsBase();
  document.addEventListener("change", checkboxListener);
  document.addEventListener("click", clickListener);
  document.addEventListener("change", changeListener);
  compatible.browser.storage.onChanged.addListener(storageListener);
  endLock();
}

initMain();
