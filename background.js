/* Copyright (C) 2017 Nartin Väth <martin@mvath.de>
 * This project is under the GNU public license 2.0
*/

"use strict";

// For documentation on the tab API see e.g.
// https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/tabs

function bookmarkdupesTab() {
  const url = browser.extension.getURL("data/tab/index.html")

  function selectOrCreate(tabs) {
    const properties = {
      active: true
    };
    if (tabs.length) {  // switch to tab
      const tab = tabs[0];
      browser.tabs.update(tab.id, properties);
      return;
    }
    properties.url = url;
    browser.tabs.create(properties);
  }

  const queryInfo = {
    url: url
  };
  browser.tabs.query(queryInfo).then(selectOrCreate);
}

browser.browserAction.onClicked.addListener(bookmarkdupesTab);
