/**
@license
Copyright 2019, 2020 Strategic Technology Solutions DBA Plum eLearning


Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

const LZString = require("lz-string");

/**
 * Class for storing object data in local/session Storage
 */
const LocalStorage = class {
  constructor(storeName) {
    this.store = storeName.replace(/\W/g, "_");
    if (!window.localStorage.getItem(this.store)) {
      window.localStorage.setItem(this.store, JSON.stringify({}));
    }
  }

  getData() {
    try {
      const compressed = window.localStorage.getItem(this.store);
      const expanded = LZString.decompressFromEncodedURIComponent(compressed);
      if (expanded) {
        return JSON.parse(expanded);
      } else {
        return {};
      }
    } catch (e) {
      console.error(`Error recovering localStorage ${this.store}: ${e}`);
      return {};
    }
  }

  setData(object) {
    try {
      const stringified = JSON.stringify(object);
      const compressed = LZString.compressToEncodedURIComponent(stringified);
      if (stringified.length && compressed.length) {
        // console.log(`compression factor ${compressed.length / stringified.length}`);
        window.localStorage.setItem(this.store, compressed);
      }
    } catch (e) {
      console.error(e);
    }
  }

  clear() {
    try {
      window.localStorage.clear();
    } catch (e) {
      console.error(e);
    }
  }
};

export default LocalStorage;
