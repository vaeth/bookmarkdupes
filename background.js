/* Copyright (C) 2017 Nartin Väth <martin@mvath.de>
 * This project is under the GNU public license 2.0
*/

"use strict";

function bookmarkdupesTab() {
  const url = browser.extension.getURL("data/tab/index.html")

  function selectOrCreate(tabs) {
    for (let tab of tabs) {
      const updateProperties = {
        active: true
      };
      browser.tabs.update(tab.id, updateProperties);
      return;
    }
    const createProperties = {
      url: url,
      active: true
    }
    browser.tabs.create(createProperties);
  }

  const queryInfo = {
    url: url
  };
  browser.tabs.query(queryInfo).then(selectOrCreate);
}

browser.browserAction.onClicked.addListener(bookmarkdupesTab);
