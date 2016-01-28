// index.js
"use strict";
const ko = require("knockout");
const postbox = require("knockout-postbox");
const FileSelector = require("./lib/file-selector");
const TestViewModel = require("./test/TestViewModel");


window.addEventListener("load", () => {
  ko.components.register("FileSelector", FileSelector);
  ko.components.register("TestViewModel", TestViewModel);
  ko.applyBindings();
});
