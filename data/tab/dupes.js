/* Copyright (C) 2017-2018 Nartin Väth <martin@mvath.de>
 * This project is under the GNU public license 2.0
*/

// For documentation on the bookmark API see e.g.
// https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/bookmarks/
// For documentation on the storage API see e.g.
// https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/storage/

"use strict";

function isChecked(id) {
  const checkbox = document.getElementById(id);
  return (checkbox && checkbox.checked);
}

function setTitle(title) {
  document.getElementById("pageTitle").textContent = title;
}

function setHeadTitle(text, title) {
  const head = document.getElementById("headTitle");
  head.title = title;
  head.appendChild(document.createTextNode("\xa0" + text));
}

function setWarningExpert(warningId, textId) {
  const warning = document.createElement("STRONG");
  warning.textContent = browser.i18n.getMessage(warningId);
  const parent = document.getElementById("warningExpert");
  const text = document.createTextNode(browser.i18n.getMessage(textId));
  parent.appendChild(warning);
  parent.appendChild(text);
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

function getButtonsRulesLocal() {
  return document.getElementById("buttonsRulesLocal");
}

function getButtonsRulesSync() {
  return document.getElementById("buttonsRulesSync");
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

function appendCol(row) {
  const col = document.createElement("TD");
  row.appendChild(col);
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

function appendRadio(parent, id, name, title, checked) {
  const radiobox = document.createElement("INPUT");
  radiobox.type = "radio";
  radiobox.id = id;
  radiobox.name = name;
  if (title) {
    radiobox.title = browser.i18n.getMessage(title);
  }
  if (checked) {
    radiobox.checked = checked;
  }
  parent.appendChild(radiobox);
}

function appendRadioCol(row, id, name, title, checked) {
  const col = document.createElement("TD");
  appendRadio(col, id, name, title, checked);
  row.appendChild(col);
}

function appendInput(parent, title, content, disabled) {
  const input = document.createElement("INPUT");
  input.type = "text";
  if (title) {
    input.title = browser.i18n.getMessage(title);
  }
  if (content) {
    input.value = content;
  }
  input.size = 15;
  if (disabled) {
    input.disabled = true;
  }
  parent.appendChild(input);
}

function appendInputCol(row, title, content, disabled) {
  const col = document.createElement("TD");
  appendInput(col, title, content, disabled);
  row.appendChild(col);
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

function appendCheckboxCol(row, id, title, checked, enabled) {
  const col = document.createElement("TD");
  appendCheckbox(col, id, title, checked, enabled);
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
  button.textContent = (text || browser.i18n.getMessage(id));
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

function getRule(row) {
  const radio = row.children[1].firstChild;
  if (radio.nodeName != "INPUT") {
    return null;
  }
  const children = row.children;
  const rule = {};
  if (radio.checked) {
    rule.radio = "filter";
  } else if (children[2].firstChild.checked) {
    rule.radio = "url";
  }
  if (children[4].firstChild.value) {
    rule.name = children[4].firstChild.value;
  }
  if (children[5].firstChild.value) {
    rule.nameNegation = children[5].firstChild.value;
  }
  if (children[7].firstChild.value) {
    rule.url = children[7].firstChild.value;
  }
  if (children[8].firstChild.value) {
    rule.urlNegation = children[8].firstChild.value;
  }
  if (children[10].firstChild.value) {
    rule.search = children[10].firstChild.value;
  }
  if (children[11].firstChild.value) {
    rule.replace = children[11].firstChild.value;
  }
  return rule;
}

function addRule(parent, count, total, rule) {
  if (!rule) {
    rule = {};
  }
  const row = document.createElement("TR");
  const stringCount = String(count);
  appendTextNodeCol(row, stringCount);
  const prefix = "regexpRule=" + stringCount;
  const filter = (rule.radio === "filter");
  const off = (!rule.radio || (rule.radio === "off"));
  const filterOrOff = (filter || off);
  appendRadioCol(row, prefix + "Filter", prefix + "Radio", "titleRadioFilter",
    filter);
  appendRadioCol(row, prefix + "Url", prefix + "Radio", "titleRadioUrl",
    rule.radio === "url");
  appendRadioCol(row, prefix + "Off", prefix + "Radio", "titleRadioOff", off);
  appendInputCol(row, "titleRuleName", rule.name, off);
  appendInputCol(row, "titleRuleNameNegation", rule.nameNegation, off);
  appendCol(row);
  appendInputCol(row, "titleRuleUrl", rule.url, off);
  appendInputCol(row, "titleRuleUrlNegation", rule.urlNegation, off);
  appendCol(row);
  appendInputCol(row, "titleRuleSearch", rule.search, filterOrOff);
  appendInputCol(row, "titleRuleReplace", rule.replace, filterOrOff);
  const colUp = document.createElement("TD");
  if ((count > 1) && (total > 1)) {
    appendButton(colUp, "regexpButton=/" + stringCount, "titleButtonRuleUp",
      browser.i18n.getMessage("buttonRuleUp"), null, true);
  }
  row.appendChild(colUp);
  const colDown = document.createElement("TD");
  if (count < total) {
    appendButton(colDown, "regexpButton=*" + stringCount,
      "titleButtonRuleDown", browser.i18n.getMessage("buttonRuleDown"),
      null, true);
  }
  row.appendChild(colDown);
  appendButtonCol(row, "regexpButton=-" + stringCount, "titleButtonRuleSub",
    browser.i18n.getMessage("buttonRuleSub"), null, true);
  appendButtonCol(row, "regexpButton=+" + stringCount, "titleButtonRuleAdd",
    browser.i18n.getMessage("buttonRuleAdd"), null, true);
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
  const children = row.children;
  children[4].firstChild.disabled = off;
  children[5].firstChild.disabled = off;
  children[7].firstChild.disabled = off;
  children[8].firstChild.disabled = off;
  children[10].firstChild.disabled = filterOrOff;
  children[11].firstChild.disabled = filterOrOff;
}

function addButtonsRulesLocal(restore, clean) {
  const row = getButtonsRulesLocal();
  if (row.hasChildNodes()) {  // Already done
    const children = row.children;
    children[2].firstChild.disabled = !restore;
    children[3].firstChild.disabled = !clean;
    return;
  }
  appendButtonCol(row, "buttonRulesDefault", "titleButtonRulesDefault",
    null, null, true);
  appendButtonCol(row, "buttonRulesStoreLocal", "titleButtonRulesStoreLocal",
    null, null, true);
  appendButtonCol(row, "buttonRulesRestoreLocal",
    "titleButtonRulesRestoreLocal", null, null, restore);
  appendButtonCol(row, "buttonRulesCleanLocal", "titleButtonRulesCleanLocal",
    null, null, clean);
}

function addButtonsRulesSync(restore, clean) {
  const row = getButtonsRulesSync();
  if (row.hasChildNodes()) {  // Already done
    const children = row.children;
    children[2].firstChild.disabled = !restore;
    children[3].firstChild.disabled = !clean;
    return;
  }
  appendCol(row);
  appendButtonCol(row, "buttonRulesStoreSync", "titleButtonRulesStoreSync",
    null, null, true);
  appendButtonCol(row, "buttonRulesRestoreSync",
    "titleButtonRulesRestoreSync", null, null, restore);
  appendButtonCol(row, "buttonRulesCleanSync", "titleButtonRulesCleanSync",
    null, null, clean);
}

function addRules(rules) {
  const parent = getTableRules();
  if (parent.hasChildNodes()) {  // Already done
    return;
  }
  const row = document.createElement("TR");
  row.appendChild(document.createElement("TD"));
  appendTextNodeCol(row, browser.i18n.getMessage("radioFilter"),
    browser.i18n.getMessage("titleRadioFilter"));
  appendTextNodeCol(row, browser.i18n.getMessage("radioUrl"),
    browser.i18n.getMessage("titleRadioUrl"));
  appendTextNodeCol(row, browser.i18n.getMessage("radioOff"),
    browser.i18n.getMessage("titleRadioOff"));
  appendTextNodeCol(row, browser.i18n.getMessage("ruleName"),
    browser.i18n.getMessage("titleRuleName"));
  appendTextNodeCol(row, browser.i18n.getMessage("ruleNameNegation"),
    browser.i18n.getMessage("titleRuleNameNegation"));
  appendTextNodeCol(row, "\xa0\xa0");
  appendTextNodeCol(row, browser.i18n.getMessage("ruleUrl"),
    browser.i18n.getMessage("titleRuleUrl"));
  appendTextNodeCol(row, browser.i18n.getMessage("ruleUrlNegation"),
    browser.i18n.getMessage("titleRuleUrlNegation"));
  appendTextNodeCol(row, "\xa0\xa0");
  appendTextNodeCol(row, browser.i18n.getMessage("ruleSearch"),
    browser.i18n.getMessage("titleRuleSearch"));
  appendTextNodeCol(row, browser.i18n.getMessage("ruleReplace"),
    browser.i18n.getMessage("titleRuleReplace"));
  for (let i = 0; i < 3; ++i) {
    appendCol(row);
  }
  appendButtonCol(row, "regexpButton=+0", "titleButtonRuleAdd",
    browser.i18n.getMessage("buttonRuleAdd"), null, true);
  parent.appendChild(row);
  const total = rules.length;
  let count = 0;
  for (let rule of rules) {
    addRule(parent, ++count, total, rule);
  }
}

function addCheckboxRules() {
  const row = document.createElement("TR");
  const title = browser.i18n.getMessage("titleCheckboxRules");
  appendCheckboxCol(row, "checkboxRules", title , false, true);
  appendTextNodeCol(row, browser.i18n.getMessage("CheckboxRules"), title);
  const parent = getTableCheckboxRules();
  parent.appendChild(row);
}

function addButtonsBase() {
  const parent = getButtonsBase();
  if (parent.hasChildNodes()) {  // Already done
    return;
  }
  addCheckboxRules();
  const row = document.createElement("TR");
  appendButtonCol(row, "buttonListDupes", "titleButtonListDupes");
  appendButtonCol(row, "buttonListEmpty", "titleButtonListEmpty");
  appendButtonCol(row, "buttonListAll", "titleButtonListAll");
  parent.appendChild(row);
}

function addButtonRemove(warningId, buttonId, titleId) {
  const row = document.createElement("TR");
  const title = browser.i18n.getMessage(titleId);
  row.title = title;
  const col = document.createElement("TD");
  col.width = "50pt";
  col.style.height = "50pt";
  col.style.textAlign = "center";
  const text = document.createTextNode(browser.i18n.getMessage(warningId));
  const strong = document.createElement("STRONG");
  strong.appendChild(text);
  col.appendChild(strong);
  row.appendChild(col);
  appendButtonCol(row, buttonId);
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
    addButtonRemove("warningStripMarked",
      "buttonStripMarked", "titleButtonStripMarked");
  } else {
    addButtonRemove("warningRemoveMarked",
      "buttonRemoveMarked", "titleButtonRemoveMarked");
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

function getBookmarkId(id) {
  return id.substr(9);  // 9 = "bookmark=".length
}

function addBookmark(bookmark, folders, id) {
  const row = document.createElement("TR");
  appendCheckboxCol(row, "bookmark=" + bookmark.id);
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
  const top = getTop();
  top.appendChild(row);
}

function getRules() {
  const parent = getTableRules();
  const rules = [];
  if (!parent.hasChildNodes()) {
    return rules;
  }
  for (let row of parent.children) {
    const rule = getRule(row);
    if (rule) {
      rules.push(rule);
    }
  }
  return rules;
}

function redisplayRules(rules) {
  clearItem(getTableRules());
  if (isCheckedRules()) {
    addRules(rules);
  }
}

function buttonRule(action) {
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
  redisplayRules(rules);
}

function haveStorageSync() {  // check if supported by browser
  return (browser.storage.sync && browser.storage.sync.get &&
    (typeof(browser.storage.sync.get) == "function"));
}

function haveProperties(object) {
  for (let attribute in object) {
    return true;
  }
  return false;
}

function buttonsRulesQuick(storageArea, restoreRules) {
  const addButtonsRules = ((storageArea === "sync") ?
    addButtonsRulesSync : addButtonsRulesLocal);
  browser.storage[storageArea].get().then(function (storage) {
    if (!isCheckedRules()) {  // async race: user might have changed
      return;
    }
    if (!storage || !Object.getOwnPropertyNames(storage).length) {
      addButtonsRules(false, false);
      return;
    }
    const clean = haveProperties(storage);
    if (!storage.rulesV1) {
      addButtonsRules(false, clean);
      return;
    }
    if (restoreRules) {
      redisplayRules(storage.rulesV1);
    }
    addButtonsRules(true, clean);
  }, function () {
    if (!isCheckedRules()) {  // async race: user might have changed
      return;
    }
    addButtonsRules(false, true);
  });
}

function buttonsRules(storageArea, restoreRules) {
  if (isCheckedRules()) {
    buttonsRulesQuick(storageArea, restoreRules);
  }
}

function toggleRules(rules) {
  if (isCheckedRules()) {
    addRules(rules);
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
  clearItem(getButtonsRulesLocal());
  clearItem(getButtonsRulesSync());
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
  const top = getTop();
  if (!top.hasChildNodes()) {
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
  const top = getTop();
  if (!top.hasChildNodes()) {
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
      adding(getBookmarkId(checkbox.id));
    }
  }
  return marked;
}

function displayProgress(textId, buttonTextId, total, todo) {
  const percentage = (100 * total) / todo;
  addProgressButton(buttonTextId, percentage);
  displayMessage(browser.i18n.getMessage(textId,
    [String(total), String(todo), String(Math.round(percentage))]));
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
          case "\$NAME":
            compiledRule.replace = 1;
            compiledRules.needSpecials = compiledRules.needName = true;
            break;
          case "\$TITLE":
            compiledRule.replace = 2;
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
      function () { return name; },
      function () { return title; }
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
    displayMessage(browser.i18n.getMessage("messageCalculateError", error));
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

  function handleAll(node, parent, index) {
    const title = node.title;
    const url = node.url
    if (rulesFilter(compiledRules, folders, parent, title, url)) {
      return;
    }
    const id = node.id;
    parentUsed(parent, id);
    const bookmarkResult = {
      id: id,
      parent: parent,
      text: title,
      url: url
    };
    result.push(bookmarkResult);
    const bookmark = {
      parentId: node.parentId,
      title: title,
      url: url,
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
    const title = browser.i18n.getMessage("titleMessageMatches");
    if (groupNumber) {
      addButtons(0, sameFolders);
      addCheckboxExtra(title, extra);
    }
    displayMessage(browser.i18n.getMessage("messageMatches",
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
    case "all":
      compiledRules = compileRules(-1);
      mainFunction = calculateAll;
      handleFunction = handleAll;
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
      stripBookmark(id, bookmarkMap.get(id), next, function () {
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
      removeFolder(id, next, function () {
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

function rulesStore(storageArea) {
  const storage = {
    rulesV1: getRules()
  };
  browser.storage[storageArea].set(storage);
}

function rulesClean(storageArea) {
  browser.storage[storageArea].clear();
}

function rulesRestore(storageArea) {
  buttonsRules(storageArea, true);
}

{
  // state variables
  let state = {};
  let rules;
  const rulesDefault = [
    { radio: "url", search: "^\\w+://[^\/]*/", replace: "\\L$&" },
    { radio: "filter",
      name: "\\0(" + browser.i18n.getMessage("regExpFrequent") + ")\\0" },
    { radio: "off", nameNegation: "\\0.*\\0" },
    { radio: "off", urlNegation: "\\b(e?mail|bugs|youtube|translat)\\b",
      search: "\\?.*" },
    { radio: "off", search: "/[^/]*$" },
    { radio: "url", search: "/+(index\\.html)?$" },
    { radio: "url", search: "^http:", replace: "https:" },
    { radio: "url", search: "^([^:]*://)www?\\d*\\.", replace: "$1" },
    { radio: "url", search: "\\.htm$", replace: ".html" }
  ];

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

  function initRulesDefault() {
    rules = toggleRules(rulesDefault);
  }

  function initRulesStorage(storageArea, callback) {
    browser.storage[storageArea].get().then(function (storage) {
      if (storage && storage.rulesV1) {
        rules = toggleRules(storage.rulesV1);
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
      initRulesLocal();
    } else {
      rules = toggleRules(rules);
    }
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
      case "checkboxRules":
        checkboxRules();
        return;
      default:
        const id = event.target.id;
        if (id.startsWith("bookmark=")) {  // bookmark checkbox id
          marked(id);
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

  function processWrapper(bookmarkMap) {
    startLock();
    setTimeout(function () {
      processMarked(stopPressed, endLockReset, bookmarkMap);
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
      case "buttonRulesDefault":
        redisplayRules(rulesDefault);
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
          buttonRule(id.substring(13));  // 13 = "regexpButton=".length
          return;
        }
      // checkboxes: handled by checkboxListener()
      // radioButtons, select: handled by changeListener()
    }
  }

  const title = browser.i18n.getMessage("extensionName");
  setTitle(title);
  setHeadTitle(title, browser.i18n.getMessage("extensionDescription"));
  setWarningExpert("warningExpertStrong", "warningExpertText");
  addButtonsBase();
  document.addEventListener("CheckboxStateChange", checkboxListener);
  document.addEventListener("click", clickListener);
  document.addEventListener("change", changeListener);
  browser.storage.onChanged.addListener(storageListener);
  endLock();
}
