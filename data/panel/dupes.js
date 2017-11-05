/* Copyright (C) 2017 Nartin Väth <martin@mvath.de>
 * This project is under the GNU public license 2.0
*/

"use strict";

var calculating;
var lock = false;

function displayMessage(msg) {
  document.getElementById("textMessage").innerHTML = msg;
}


function getButtonsExtra() {
  return document.getElementById("buttonsExtra");
}

function getButtonsRemove() {
  return document.getElementById("buttonsRemove");
}

function getTop() {
  return document.getElementById("tableBookmarks");
}

function addButton(parent, id, text) {
  let button = document.createElement("button");
  button.type = "button";
  button.id = id;
  if (!text) {
    text = browser.i18n.getMessage(id);
  }
  let buttontext = document.createTextNode(text);
  button.appendChild(buttontext);
  parent.appendChild(button);
}

function addButtons() {
  let parent = getButtonsExtra();
  addButton(parent, "buttonMarkButFirst");
  addButton(parent, "buttonMarkButLast");
  addButton(parent, "buttonUnmarkAll");
  parent = getButtonsRemove();
  addButton(parent, "buttonRemoveMarked");
}

function clearItem(top) {
  while (top.lastChild) {
    top.removeChild(top.lastChild);
  }
}

function clearButtonsExtra() {
  clearItem(getButtonsExtra());
  clearItem(getButtonsRemove());
}

function clearBookmarks() {
  clearItem(getTop());
}

function addRuler() {
  let ruler = document.createElement("HR");
  let top = getTop();
  top.appendChild(ruler);
}

function addBookmark(text, id, checked) {
  let checkbox = document.createElement("INPUT");
  checkbox.type = "checkbox";
  checkbox.checked = checked;
  checkbox.id = id;
  let col = document.createElement("TD");
  col.appendChild(checkbox);
  let textnode = document.createTextNode(text);
  col.appendChild(textnode);
  let row = document.createElement("TR");
  row.appendChild(col);
  let top = getTop();
  top.appendChild(row);
}

function getCheckBox(node) {
  return node.firstChild.firstChild;
}

function setCheck(node, checked) {
  getCheckBox(node).checked = checked;
}

function mark(mode) {
  let top = getTop();
  if (!top.hasChildNodes()) {
    return;
  }
  let first = true;
  let prev = null;
  let count = 0;
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
    ++count;
    setCheck(child, !first);
    if (mode != 0) {
      first = false;
    }
  }
  if ((mode < 0) && (prev != null)) {
    setCheck(prev, false);
  }
}

function calculateDupe(node, parent) {
  let groupIndex = node.url;
  let extra;
  if (!calculating.exact) {
    let index = groupIndex.indexOf("?");
    if (index > 0) {
      groupIndex = groupIndex.substring(0, index);
      extra = node.url.substring(index);
    }
  }
  let id = node.id;
  let group = calculating.map.get(groupIndex);
  if (typeof(group) == "undefined") {
    group = {
      data : new Array(),
      ids : new Set()
    };
    calculating.array.push(group);
    calculating.map.set(groupIndex, group);
  } else if (group.ids.has(id)) {
    return;
  }
  group.ids.add(id);
  let bookmark = {
    id: id,
    text: parent + node.title
  };
  if(typeof(extra) != "undefined") {
    bookmark.extra = extra;
  }
  group.data.push(bookmark);
}

function calculateNodes(node, parent) {
  if (node.url) {
    calculateDupe(node, parent);
  }
  if (!node.children) {
    return;
  }
  if (node.title) {
    parent += node.title + " | ";
  }
  for (let child of node.children) {
    calculateNodes(child, parent);
  }
}

function calculateFinish() {
  calculating = {};
}

function calculateTree(nodes) {
  calculating.map = new Map();
  calculating.array = new Array();
  calculateNodes(nodes[0], "");
  let total = 0;
  let groups = 0;
  for (let group of calculating.array) {
    if (group.data.length < 2) {
      continue;
    }
    if (groups++ == 0) {
      addButtons();
    } else {
      addRuler();
    }
    for (let bookmark of group.data) {
      ++total;
      let text = bookmark.text;
      if (typeof(bookmark.extra) != "undefined") {
        text += " (" + bookmark.extra + ")";
      }
      addBookmark(text, bookmark.id, false);
    }
  }
  displayMessage(browser.i18n.getMessage((calculating.exact ?
    "messageExactMatchesGroups" : "messageSimilarMatchesGroups"),
    [String(total), String(groups)]));
  calculateFinish();
}

function calculateError(error) {
  displayMessage(browser.i18n.getMessage("messageCalculatingError", error));
  calculateFinish();
}

function calculate(exact) {
  displayMessage(browser.i18n.getMessage("messageCalculating"));
  calculating = {};
  calculating.exact = exact;
  clearButtonsExtra();
  clearBookmarks();
//https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/bookmarks/BookmarkTreeNode
  return browser.bookmarks.getTree().then(calculateTree, calculateError);
}

function removeFinish() {
  clearButtonsExtra();
  clearBookmarks();
}

function removeSuccess(a) {
  displayMessage(browser.i18n.getMessage("messageRemoveSuccess",
    String(a.length)));
  removeFinish();
}

function removeFailure(error) {
  displayMessage(browser.i18n.getMessage("messageRemoveFailure", error));
  removeFinish();
}

function removeMarked() {
  let top = getTop();
  if (!top.hasChildNodes()) {
    return;
  }
  let promises = new Array();
  for (let child of top.childNodes) {
    if (child.nodeName != "TR") {
      continue;
    }
    let checkBox = getCheckBox(child);
    if (!checkBox.checked) {
      continue;
    }
    promises.push(browser.bookmarks.remove(checkBox.id));
  }
  return Promise.all(promises).then(removeSuccess, removeFailure);
}

function unlock() {
  lock = false;
}

function clickListener(event) {
  if (lock) {
    return;
  }
  lock = true;
  switch(event.target.id) {
    case "buttonListExactDupes":
      calculate(true).then(unlock, unlock);
      return;
    case "buttonListSimilarDupes":
      calculate(false).then(unlock, unlock);
      return;
    case "buttonRemoveMarked":
      removeMarked().then(unlock, unlock);
      return;
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

{
  let parent = document.getElementById("buttonsBase");
  addButton(parent, "buttonListExactDupes");
  addButton(parent, "buttonListSimilarDupes");
  document.addEventListener("click", clickListener);
}
