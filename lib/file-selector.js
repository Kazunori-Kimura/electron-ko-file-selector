// knockout file selector component for electron
"use strict";
const remote = require("remote");
const path = remote.require("path");
const fsUtil = remote.require("./lib/fs-util");
const co = require("co");
const ko = require("knockout");
const postbox = require("knockout-postbox");

function FileInfo(filepath) {
  const self = this;

  self.path = filepath;
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
    pattern: "*", //指定フォルダの全フォルダ・ファイル
    options: {
      cwd: process.cwd()
    }
  }, params);

  // テキストボックスにフォーカスがあるか？
  self.isSelected = ko.observable(false);
  // 結果にマッチしたファイル
  self.files = ko.observableArray([]);
  // 入力値
  self.currentPath = ko.observable(settings.options.cwd);
  // 選択されたファイル
  self.selectedFilePath = ko.observable("").syncWith("selected-path");

  // リストがちらちら見える現象の対応
  self.displayList = ko.observable(false);

  // 入力値が変更された場合
  self.currentPath.subscribe(function(newValue) {
    // 新しい入力値でglobを実行
    globing(newValue);
  });

  // フォーカスが変わった場合
  self.isSelected.subscribe(function(newValue) {
    if (newValue) {
      // フォーカスがセットされた
      // -> glob実施
      globing(self.currentPath());
    } else {
      // フォーカスが外れた
      // -> 一定時間経過後にリストをクリア
      setTimeout(() => {
        if (!self.isSelected()) {
          self.displayList(false);
          self.files.removeAll();
        }
      }, 500);
    }
  });

  /**
   * 候補から選択された
   * @param {string} 選択された項目
   */
  self.select = function(item) {
    self.selectedFilePath(item.path);
    self.currentPath(item.path);
    // リストクリア
    self.displayList(false);
    self.files.removeAll();
    // フォーカスを戻す
    self.isSelected(true);
  };

  function push(newItem) {
    let exists = false;
    ko.utils.arrayForEach(self.files(), function(item) {
      exists = exists || item.path === newItem.path;
    });
    if (!exists) {
      self.files.push(newItem);
    }
  }

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

      if (self.files().length === 0 || settings.options.cwd !== cwd) {
        settings.options.cwd = cwd;
        // globしなおす
        self.files.removeAll();
        const items = yield fsUtil.glob(settings);
        items.forEach((item) => {
          const itemPath = path.join(settings.options.cwd, item);
          const f = new FileInfo(itemPath);
          push(f);
        });
      }

      // observableArrayをフィルタする
      let count = self.files().length;
      if (filter) {
        count = 0;
        ko.utils.arrayForEach(self.files(), function(item) {
          item.isDisplay(item.path.indexOf(filter) > 0);
          if (item.isDisplay()) {
            count++;
          }
        });
      }

      if (count > 0) {
        self.displayList(true);
      }
    });
  }
}

// read template file
const template = fsUtil.loadTemplate(__dirname, "file-selector.html");

module.exports = { viewModel: FileSelector, template };
