/* Copyright (C) 2017-2018 Nartin Väth <martin@mvath.de>
 * This project is under the GNU public license 2.0
*/

"use strict";

// For documentation on the tab API see e.g.
// https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/tabs

function onClickedListener() {
  const properties = {
    url: browser.extension.getURL("data/tab/index.html"),
    active: true
  };
  browser.tabs.create(properties);
}

browser.browserAction.onClicked.addListener(onClickedListener);
