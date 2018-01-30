/* Copyright (C) 2017-2018 Nartin Väth <martin@mvath.de>
 * This project is under the GNU public license 2.0
*/

function setTitle(title) {
  document.getElementById("pageTitle").textContent = title;
}

function getLinkToTab() {
  return document.getElementById("linkToTab");
}

function createLink(title) {
  const parent = getLinkToTab();
  if (parent.hasChildNodes()) {  // Already done
    return;
  }
  const link = document.createElement("A");
  const url = browser.extension.getURL("data/tab/index.html");
  link.href = url;
  link.target = "_blank";
  link.textContent = title;
  link.referrerpolicy = "no-referrer";
  parent.appendChild(link);
}

{
  const title = browser.i18n.getMessage("extensionName");
  setTitle(title);
  createLink(title);
}
