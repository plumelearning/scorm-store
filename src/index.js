export { default as LMSManager } from "./LMSManager";
export { default as LocalStorage } from "./LocalStorage";
import { LocalException, ScormException } from "./exceptions";

// ScormStore Singleton
export class ScormStore {
  // only one instance!
  constructor(scorm = false) {
    const config = window.courseConfig;
    const autoDetect = config && config.autoDetectSCORM;
    const disableLocal = config && config.noLocalStorage;
    if (!Storage.instance) {
      if (scorm) this.initLMS(autoDetect);
      if (!this.lms && !disableLocal) this.initLocal();
      Storage.instance = this;
    }
    return Storage.instance;
  }

  active() {
    return this.localActive() || this.lmsActive();
  }

  save(data) {
    if (this.local) this.saveToLocal(data);
    if (this.lms) this.saveToLMS(data);
  }

  saveBookmark(location) {
    if (this.lms) this.saveBookmarkToLMS(location);
  }

  recover() {
    if (this.local) return this.recoverFromLocal();
    if (this.lms) return this.recoverFromLMS();
    return {};
  }

  clear() {
    if (this.local) this.local.clear();
  }

  commit() {
    if (this.lms) this.commitToLMS();
  }

  /**
   * Local Storage
   ******************************************************************/
  initLocal() {
    try {
      this.local = new LocalStorage("store");
    } catch (e) {
      console.error(e);
      this.local = null;
    }
  }

  localActive() {
    return !!this.local;
  }

  saveToLocal(data) {
    if (typeof data !== "object") throw new LocalException(`Invalid data object ${data}`, "save");
    if (!this.local) throw new LocalException("localStorage has not been initalized", "save");
    try {
      this.local.setData(data);
    } catch (message) {
      throw new LocalException(message, "save");
    }
  }

  recoverFromLocal() {
    let data = {};
    if (!this.local) throw new LocalException("localStorage has not been initalized", "recover");
    try {
      data = this.local.getData() || {};
    } catch (message) {
      throw new LocalException(message, "recover");
    }
    return data;
  }

  /**
   * SCORM Storage
   ******************************************************************/
  initLMS(autoDetect) {
    this.lms = new LMSManager();
    window.lms = this.lms;
    if (process.env.VUE_APP_SCORM_DEBUG) this.lms.debug = true;
    // console.log(`lms active ${this.lms.active}`);
    // console.dir(lms);
    if (!this.lms.active) {
      if (autoDetect) this.lms = null;
      // else throw new ScormException("LMS failed to initalize.", "launch");
    }
  }

  lmsActive() {
    return !!this.lms && this.lms.active;
  }

  saveToLMS(data) {
    if (typeof data !== "object") throw new ScormException(`Invalid data object ${data}`, "save");
    if (this.lmsActive()) {
      try {
        const suspendData = JSON.stringify(data);
        this.lms.runtime.suspend_data = suspendData;
      } catch (msg) {
        throw new ScormException(msg, "save");
      }
    } else throw new ScormException("SCORM is not active", "save");
  }

  saveBookmarkToLMS(location) {
    if (typeof location !== "string")
      throw new ScormException(`Invalid string ${location}`, "saveBookmark");
    if (this.lmsActive()) {
      try {
        this.lms.runtime.location = location.trim();
      } catch (msg) {
        throw new ScormException(msg, "saveBookmark");
      }
    }
  }

  commitToLMS() {
    if (this.lmsActive()) this.lms.runtime.commit();
  }

  recoverFromLMS() {
    let data = {};
    if (!this.lms || !this.lms.runtime)
      throw new ScormException("SCORM has not been initalized", "recover");
    if (!this.lms.active) throw new ScormException("SCORM is not active", "recover");
    try {
      const suspendData = this.lms.runtime.suspend_data;
      if (suspendData) data = JSON.parse(suspendData);
    } catch (msg) {
      throw new ScormException(msg, "recover");
    }
    return data;
  }
}

const store = new ScormStore(!!process.env.SCORM_VERSION);
Object.freeze(store);

export default store;
