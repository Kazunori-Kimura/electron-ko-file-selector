// test.js
"use strict";
const co = require("co");
const fsUtil = require("./lib/fs-util");

co(function* () {
  const stat = yield fsUtil.stat(__filename);
  console.log(stat);
});
