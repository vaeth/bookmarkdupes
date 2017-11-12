/* Copyright (C) 2017 Nartin Väth <martin@mvath.de>
 * This project is under the GNU public license 2.0
*/

// For documentation on the bookmark API see e.g.
// https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/bookmarks/

"use strict";

function getButtonStop() {
  return document.getElementById("buttonStop");
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

function displayMessage(msg) {
  document.getElementById("textMessage").textContent = msg;
}

function addButton(parent, id, text) {
  let button = document.createElement("button");
  button.type = "button";
  button.id = id;
  if (!text) {
    text = browser.i18n.getMessage(id);
  }
  button.textContent = text;
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

function addButtonStop(text) {
  let parent = getButtonStop();
  addButton(parent, "buttonStop", text);
}

function clearItem(top) {
  while (top.lastChild) {
    top.removeChild(top.lastChild);
  }
}

function clearButtonStop() {
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
  clearButtonStop();
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

function calculate(mode, callback) {
  let exact, dupes, empty, all, result, urlMap;

  function handleDupe(node, parent) {
    if ((!node.url) || (node.type && node.type != "bookmark")
      || node.unmodifiable || !parent) {
      return;
    }
    let groupIndex = node.url;
    let extra;
    if (!exact) {
      let index = groupIndex.indexOf("?");
      if (index > 0) {
        groupIndex = groupIndex.substring(0, index);
        extra = node.url.substring(index);
      }
    }
    let id = node.id;
    let group = urlMap.get(groupIndex);
    if (typeof(group) == "undefined") {
      group = {
        data : new Array(),
        ids : new Set()
      };
      result.push(group);
      urlMap.set(groupIndex, group);
    } else if (group.ids.has(id)) {
      return;
    }
    group.ids.add(id);
    let bookmark = {
      id: id,
      text: parent + node.title
    };
    if (typeof(extra) != "undefined") {
      bookmark.extra = extra;
    }
    group.data.push(bookmark);
  }

  function handleEmpty(node, parent) {
    if (((typeof(node.url) != undefined) && (node.url != null))
      || (node.type && (node.type != "folder"))
      || node.unmodifiable || !parent) {
      return;
    }
    let bookmark = {
      id: node.id,
      text: parent + node.title
    };
    result.push(bookmark);
  }

  function handleAll(node, parent, index) {
    if ((typeof(node.url) == undefined) || (node.url == null)
      || (node.type && node.type != "bookmark")
      || node.unmodifiable || !parent) {
      return;
    }
    let bookmark = {
      id: node.id,
      text: parent + node.title,
      index: index
    };
    result.push(bookmark);
  }

  function recurse(node, parent = "", index = 0) {
    if (all) {
      handleAll(node, parent, index);
    } else if (dupes) {
      handleDupe(node, parent);
    }
    if ((!node.children) || (!node.children.length)) {
      if (empty) {
        handleEmpty(node, parent);
      }
      return;
    }
    if (node.title) {
      parent += node.title + " | ";
    }
    index = 0;
    for (let child of node.children) {
      recurse(child, parent, ++index);
    }
  }

  function calculateDupes(nodes) {
    dupes = true;
    urlMap = new Map();
    result = new Array();
    recurse(nodes[0]);
    let total = 0;
    let groups = 0;
    for (let group of result) {
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
      [String(total), String(groups)]));
  }

  function calculateEmpty(nodes) {
    empty = true;
    result = new Array();
    recurse(nodes[0]);
    let total = result.length;
    if (total) {
      addButtons(1);
      for (let bookmark of result) {
        addBookmark(bookmark.text, bookmark.id);
      }
    }
    displayMessage(browser.i18n.getMessage("messageEmpty", String(total)));
  }

  function calculateAll(nodes) {
    all = true;
    result = new Array();
    recurse(nodes[0]);
    let total = result.length;
    if (total) {
      addButtons(2);
      for (let bookmark of result) {
        addBookmark(bookmark.text, String(bookmark.index) + "X" + bookmark.id);
      }
    }
    displayMessage(browser.i18n.getMessage("messageAll", String(total)));
  }

  displayMessage(browser.i18n.getMessage("messageCalculating"));
  clearButtonsExtra();
  clearBookmarks();
  let mainFunction = calculateDupes;
  switch (mode) {
    case 0:
      exact = true;
      // fallthrough
    case 1:
      mainFunction = calculateDupes;
      break;
    case 2:
      mainFunction = calculateEmpty;
      break;
    default:
      mainFunction = calculateAll;
  }
  browser.bookmarks.getTree().then(mainFunction, function (error) {
    displayMessage(browser.i18n.getMessage("messageCalculatingError", error));
  }).then(callback, callback);
}

function removeFolder(id, callback, errorCallback) {
  browser.bookmarks.remove(id).then(callback, errorCallback);
}

function stripBookmark(indexXId, callback, errorCallback) {
  let id, index;
  {
    let x = indexXId.indexOf("X");
    index =  Number(indexXId.substring(0, x));
    id = indexXId.substring(x + 1);
  }
  browser.bookmarks.get(id).then(function (nodeArray) {
    if (!nodeArray.length) {
      errorCallback(browser.i18n.getMessage("errorNodeNotFound"));
      return;
    }
    let node = nodeArray[0];
    let bookmark = {
      parentId: node.parentId,
      title: node.title,
      url: node.url,
      index: index,
    };
    if (typeof(node.type) != "undefined") {
      bookmark.type = node.type;
    }
    browser.bookmarks.create(bookmark).then(function (a) {
      browser.bookmarks.remove(id).then(callback, errorCallback);
    }, errorCallback);
  }, errorCallback);
}

function processMarked(remove, callback, getEmergencyStop) {
  displayMessage(browser.i18n.getMessage(
    (remove ? "messageRemovMarked" : "messageStripMarked")));

  let total = 0;

  function processFinish(error) {
    if (typeof(error) != "undefined") {
      displayMessage(browser.i18n.getMessage(
        (remove ? "messageRemoveError" : "messageStripError"),
        [error, String(total)]));
    } else {
      displayMessage(browser.i18n.getMessage(
        (remove ? "messageRemoveSuccess" : "messageStripSuccess"),
        String(total)));
    }
    clearWindow();
    callback();
  }

  let top = getTop();
  let todo = 0;
  if (top.hasChildNodes()) {
    for (let child of top.childNodes) {
      if (child.nodeName != "TR") {
        continue;
      }
      if (getCheckBox(child).checked) {
        ++todo;
      }
    }
  }
  if (todo == 0) {
    processFinish();
    return;
  }
  addButtonStop(browser.i18n.getMessage(
    remove ? "buttonStopRemoving" : "buttonStopStripping"));
  let current = 0;
  let process = (remove ? removeFolder : stripBookmark);

  function processRecurse(dummy) {
    ++total;
    displayMessage(browser.i18n.getMessage(
      (remove ? "messageRemoveProgress" : "messageStripProgress"),
      [String(total), String(todo),
        String(Math.round((100 * total) / todo))]));
    while (current < top.childNodes.length) {
      let child = top.childNodes[current++];
      if (child.nodeName != "TR") {
        continue;
      }
      let checkBox = getCheckBox(child);
      if (!checkBox.checked) {
        continue;
      }
      if (getEmergencyStop()) {
        break;
      }
      process(checkBox.id, processRecurse, processFinish);
      return;
    }
    processFinish();
  }

  --total;
  processRecurse();
}

{
  let lock = false;
  let emergencyStop;

  function unlock() {
    lock = false;
  }

  function getEmergencyStop() {
    return emergencyStop;
  }

  function clickListener(event) {
    if (!event.target || !event.target.id) {
      return;
    }
    if (event.target.id == "buttonStop") {
      emergencyStop = true;
      return;
    }
    if (lock || (event.button && (event.button != 1)) ||
      (event.buttons && (event.buttons != 1))) {
      return;
    }
    lock = true;
    switch (event.target.id) {
      case "buttonListExactDupes":
        calculate(0, unlock);
        return;
      case "buttonListSimilarDupes":
        calculate(1, unlock);
        return;
      case "buttonListEmpty":
        calculate(2, unlock);
        return;
      case "buttonListAll":
        calculate(3, unlock);
        return;
      case "buttonRemoveMarked":
        emergencyStop = false;
        processMarked(true, unlock, getEmergencyStop);
        return;
      case "buttonStripMarked":
        emergencyStop = false;
        processMarked(false, unlock, getEmergencyStop);
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

  let parent = document.getElementById("buttonsBase");
  addButton(parent, "buttonListExactDupes");
  addButton(parent, "buttonListSimilarDupes");
  addButton(parent, "buttonListEmpty");
  addButton(parent, "buttonListAll");
  document.addEventListener("click", clickListener);
}
