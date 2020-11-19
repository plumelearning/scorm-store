import { name, version } from "../../package.json";

const PREFIX = `sb-${name}-${version}-`;

/**
 * Class for storing object data in local/session Storage
 */
const LocalStorage = class {
  static names() {
    const keys = [];
    const pattern = new RegExp(`^${PREFIX}(\\w+)`);
    for (const key of Object.keys(window.localStorage)) {
      const matched = key.match(pattern);
      if (matched) {
        keys.push(matched[1]);
      }
    }
    return keys;
  }

  constructor(storeName) {
    this.store = PREFIX + storeName.replace(/\W/g, "_");
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
