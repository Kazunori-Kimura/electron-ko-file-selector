// index.js
"use strict";
const ko = require("knockout");
const postbox = require("knockout-postbox");
const FileSelector = require("./lib/file-selector");

window.addEventListener("load", () => {
  ko.components.register("FileSelector", FileSelector);
  ko.applyBindings();
});
