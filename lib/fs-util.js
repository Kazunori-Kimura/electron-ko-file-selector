// fs-util.js
"use strict";
const path = require("path");
const fs = require("fs");
const glob = require("glob");

/**
 * File Utility Class
 */
module.exports = {
  /**
   * fs.stat を Promise で包んだメソッド
   * ついでに path.parse の結果も返す
   */
  stat: statPromise,
  /**
   * glob を Promise で包んだメソッド
   */
  glob: globPromise
};

/**
 * fs.stat を Promise で包んだメソッド
 * ついでに path.parse の結果も返す
 */
function statPromise(filepath) {
  return new Promise(function(resolve) {
    const status = {
      exists: false,
      isFile: false,
      isDirectory: false,
      stats: null,
      err: null,
      path: path.resolve(filepath),
      info: path.parse(filepath)
    };

    fs.stat(filepath, (err, stats) => {
      if (err) {
        status.err = err;
      } else {
        status.exists = true;
        status.isFile = stats.isFile();
        status.isDirectory = stats.isDirectory();
        status.stats = stats;
      }
      resolve(status);
    });
  });
}

/**
 * glob を Promise で包んだメソッド
 * 条件に引っかかった filepath の配列を返す
 */
function globPromise(params) {
  return new Promise(function(resolve){
    glob(params.pattern, params.options, (err, files) => {
      resolve(files);
    });
  });
}
