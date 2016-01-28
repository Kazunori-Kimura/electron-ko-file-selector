// knockout file selector component for electron
"use strict";
const remote = require("remote");
const glob = remote.require("glob");
const fs = remote.require("fs");
const path = remote.require("path");
const co = require("co");
const fsUtil = require("./fs-util");
const ko = require("knockout");
const postbox = require("knockout-postbox");

function FileInfo(filepath) {
  const self = this;

  self.path = path.resolve(filepath);
  self.info = path.parse(filepath);
  self.isSelectedItem = ko.observable(false);
  self.isDisplay = ko.observable(true);
}

/**
 * file-selector component view model
 * @param {object} glob parameter, default path
 */
function FileSelector(params) {
  const self = this;

  // 設定
  const settings = Object.assign({
    pattern: "**/*",
    options: {
      cwd: ""
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
    globing(newValue);
  });

  self.showList = ko.pureComputed(function() {
    let isShowed = self.isSelected();
    if (!isShowed) {
      ko.utils.arrayForEach(self.files(), function(item) {
        isShowed = isShowed || item.isSelectedItem();
      });
    }
    return isShowed;
  });

  /**
   * 候補から選択された
   * @param {string} 選択された項目
   */
  self.select = function(item) {
    self.selectedFilePath(item.path);
    self.currentPath(item.path);
    // フォーカスを外す
    self.isSelected(false);
  };

  /**
   * globして結果をfilesに登録
   */
  function globing(filepath) {
    co(function* () {
      const stat = yield fsUtil.stat(filepath);

      let cwd = process.cwd();
      let filter = "";
      if (stat.exists && stat.isDirectory) {
        cwd = stat.path;
      } else {
        cwd = stat.info.dir;
        filter = stat.info.base;
      }

      if (settings.options.cwd !== cwd) {
        settings.options.cwd = cwd;
        // globしなおす
        self.files.removeAll();
        glob(settings.pattern, settings.options, (err, files) => {
          files.forEach((item) => {
            const f = new FileInfo(item);
            self.files.push(f);
          });
        });
      }

      // observableArrayをフィルタする
      if (filter) {
        ko.utils.arrayForEach(self.files(), function(item) {
          item.isDisplay(item.path.indexOf(filter) > 0);
        });
      }
    });
  }

  // 初期化処理
  globing(self.currentPath());
}

// read template file
const template = fs.readFileSync(path.join(__dirname, "file-selector.html"), "utf-8");

module.exports = { viewModel: FileSelector, template };
