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
      return JSON.parse(window.localStorage.getItem(this.store));
    } catch (e) {
      console.error(e);
      return {};
    }
  }

  setData(object) {
    try {
      window.localStorage.setItem(this.store, JSON.stringify(object));
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
