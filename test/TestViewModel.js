// TestViewModel
"use strict";
const remote = require("remote");
const fs = remote.require("fs");
const path = remote.require("path");
const ko = require("knockout");
const postbox = require("knockout-postbox");

function TestViewModel(params) {
  const self = this;
  self.selectedFile = ko.observable("").syncWith("selected-path");
}

const template = fs.readFileSync(path.join(__dirname, "testview.html"), "utf-8");

module.exports = { viewModel: TestViewModel, template };
