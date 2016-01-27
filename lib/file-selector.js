// knockout file selector component for electron
"use strict";
const remote = require("remote");
const glob = remote.require("glob");
const fs = remote.require("fs");
const path = remote.require("path");
const ko = require("knockout");
const postbox = require("knockout-postbox");

/**
 * file-selector component view model
 * @param {object} glob parameter, default path
 */
function FileSelector(params) {
  const self = this;

  const options = Object.assign({
    pattern: "**/*",
    options: {
      cwd: process.cwd()
    }
  }, params);

  // テキストボックスにフォーカスがあるか？
  self.isSelected = ko.observable(false);
  // 結果にマッチしたファイル
  self.files = ko.observableArray([]);
  // 入力値
  self.currentPath = ko.observable(process.cwd());
  // 選択されたファイル
  self.selectedFilePath = ko.observable("").syncWith("selected-path");

  // 入力値が変更された場合
  self.currentPath.subscribe(function(newValue) {
    // 新しい入力値でglobを実行
  });

  /**
   * 候補から選択された
   * @param {string} 選択された項目
   */
  self.select = function(item) {
    self.selectedFilePath(item);
    self.currentPath(item);
    // フォーカスを外す
    self.isSelected(false);
  };

}

// read template file
const template = fs.readFileSync(path.join(__dirname, "file-selector.html"), "utf-8");

module.exports = { viewModel: FileSelector, template };
