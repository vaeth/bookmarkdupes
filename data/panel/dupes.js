/* Copyright (C) 2017 Nartin Väth <martin@mvath.de>
 * This project is under the GNU public license 2.0
*/

"use strict";

var calculating;
var lock = false;

function displayMessage(msg) {
  document.getElementById("messagetext").innerHTML = msg;
}

function getButtons() {
  return document.getElementById("extrabuttons");
}

function getTop() {
  return document.getElementById("bookmarkdupes");
}

function addButton(parent, id, text) {
  let button = document.createElement("button");
  button.type = "button";
  button.id = id;
  let buttontext = document.createTextNode(text);
  button.appendChild(buttontext);
  parent.appendChild(button);
}

function addButtons() {
  let parent = getButtons();
  addButton(parent, "markButFirstButton", "Mark all but first");
  addButton(parent, "markButLastButton", "Mark all but last");
  addButton(parent, "unmarkAllButton", "Unmark all");
  addButton(parent, "removeMarkedButton", "Remove marked bookmarks");
}

function clearItem(top) {
  while (top.lastChild) {
    top.removeChild(top.lastChild);
  }
}

function clearButtons() {
  clearItem(getButtons());
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
  let bookmarktext = document.createTextNode(text);
  col.appendChild(bookmarktext);
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
  let url = node.url;
  if (!calculating.exact) {
    let index = url.indexOf("?");
    if (index > 0) {
      url = url.substring(0, index);
    }
  }
  let id = node.id;
  let text = parent + node.title;
  let ids = calculating.urls.get(url);
  if (typeof(ids) == "undefined") {
    ids = new Map();
    ids.set(id, text);
    calculating.urls.set(url, ids);
    return;
  }
  if (typeof(ids.get(id)) != "undefined") {
    return;
  }
  ids.set(id, text);
//calculating.urls.set(url, ids);
  if (ids.size < 2) {
    return;
  }
  if (ids.size > 2) {
    ++calculating.total;
    addBookmark(text, id, true);
    return;
  }
  if (calculating.groups++ == 0) {
    addButtons();
  } else {
    addRuler();
  }
  let checked = false;
  for (let [currid, currtext] of ids) {
    ++calculating.total;
    addBookmark(currtext, currid, checked);
    checked = true;
  }
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
  lock = false;
}

function calculateTree(nodes) {
  calculating.urls = new Map();
  calculating.groups = 0;
  calculating.total = 0;
  calculateNodes(nodes[0], "");
  displayMessage(calculating.message + " (" +
    String(calculating.total) + " matches in " +
    String(calculating.groups) + " groups)");
  calculateFinish();
}

function calculateError(error) {
  displayMessage("Error: " + error);
  calculateFinish();
}

function calculate(exact, before, after) {
  displayMessage(before);
  calculating = {};
  calculating.exact = exact;
  calculating.message = after;
  clearButtons();
  clearBookmarks();
//https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/bookmarks/BookmarkTreeNode
  browser.bookmarks.getTree().then(calculateTree, calculateError);
}

function removeFinish() {
  clearButtons();
  clearBookmarks();
  lock = false;
}

function removeSuccess(a) {
  displayMessage(String(a.length) + " bookmarks removed!");
  removeFinish();
}

function removeFailure(a) {
  displayMessage("Failure when removing " + String(a.length) + " bookmarks!");
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
  Promise.all(promises).then(removeSuccess, removeFailure);
}

function eventListener(event) {
  if (lock) {
    return;
  }
  lock = true;
  switch(event.target.id) {
    case "exactButton":
      calculate(true, "Calculating exact dupes", "Exact dupes");
      return;  // A promise might be running which must unlock
    case "similarButton":
      calculate(false, "Calculating similar dupes", "Similar dupes");
      return;  // A promise might be running which must unlock
    case "removeMarkedButton":
      removeMarked();
      return;  // A promise might be running which must unlock
    case "markButFirstButton":
      mark(1);
      break;
    case "markButLastButton":
      mark(-1);
      break;
    case "unmarkAllButton":
      mark(0);
      break;
  }
  lock = false;
}

document.addEventListener("click", eventListener);
