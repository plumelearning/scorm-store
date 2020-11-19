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
