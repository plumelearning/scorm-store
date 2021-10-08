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

import LMSManager from "./LMSManager";
import LocalStorage from "./LocalStorage";
import { LocalException, ScormException } from "./exceptions";

const LZString = require("lz-string");

// export these classes
export { LocalStorage, LMSManager };
export { LocalException, ScormException };

// ScormStore Singleton
export default class ScormStore {
  // only one instance!
  constructor(scorm = false, storeName = "plum_course") {
    this.storeName = storeName;
    const config = window.courseConfig;
    const autoDetect = config && config.autoDetectSCORM;
    const disableLocal = config && config.noLocalStorage;
    if (!ScormStore.instance) {
      if (scorm) this.initLMS(autoDetect);
      if (!this.lms && !disableLocal) this.initLocal();
      ScormStore.instance = this;
    }
    return ScormStore.instance;
  }

  active() {
    return this.localActive() || this.lmsActive();
  }

  // deprecated
  save(data) {
    this.saveData(data);
  }

  saveData(data) {
    if (this.local) this.saveToLocal(data);
    if (this.lms) this.saveToLMS(data);
  }

  saveBookmark(location) {
    if (this.lms) this.saveBookmarkToLMS(location);
    if (this.local) this.saveBookmarkToLocal(location);
  }

  // note: interaction responses are only available in the LMS
  saveInteraction(id, type, response) {
    if (this.lms) this.saveInteractionToLMS(id, type, response);
    if (this.local) this.saveInteractionToLocal(id, type, response);
  }

  // deprecated
  recover() {
    return this.recoverData();
  }

  recoverData() {
    if (this.lms) return this.recoverFromLMS();
    if (this.local) return this.recoverFromLocal();
    return {};
  }

  recoverBookmark() {
    if (this.lms) return this.recoverBookmarkFromLMS();
    if (this.local) return this.recoverBookmarkFromLocal();
    return "";
  }

  clear() {
    if (this.local) this.local.clear();
    if (this.lmsActive()) this.lms.runtime.suspend_data = "";
  }

  commit() {
    if (this.lms) this.commitToLMS();
  }

  /**
   * Local Storage
   ******************************************************************/
  initLocal() {
    try {
      this.local = new LocalStorage(this.storeName);
      this.localInteraction = {};
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

  saveBookmarkToLocal(location) {
    if (typeof location !== "string")
      throw new LocalException(`Invalid string ${location}`, "saveBookmark");
    try {
      if (!this.localBookmark) this.localBookmark = new LocalStorage(`${this.storeName}_bookmark`);
      this.localBookmark.setData({ location: location.trim() });
    } catch (msg) {
      throw new LocalException(msg, "save");
    }
  }

  saveInteractionToLocal(id, type, response) {
    const key = `${id}-${type}`.toLowerCase().replace(/-/g, "_");
    // console.log(`saveInteractionToLocal( ${id}, ${type}, ${response}) key: ${key}`);
    if (!this.localInteraction) this.localInteraction = {};
    if (!this.localInteraction[key])
      this.localInteraction[key] = new LocalStorage(`${this.storeName}_${key}`);
    this.localInteraction[key].setData(response);
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

  recoverBookmarkFromLocal() {
    let bookmark = "";
    if (this.localBookmark) {
      try {
        const data = this.localBookmark.getData();
        if (data.location) bookmark = data.location;
      } catch (message) {
        throw new LocalException(message, "recover");
      }
    }
    return bookmark;
  }

  recoverInteractionFromLocal(id, type) {
    const key = `${id.trim()}-${type.trim}`.toLowerCase().replace(/-/g, "_");
    if (this.localInteraction[key]) return this.localInteraction[key].getData();
    return null;
  }

  /**
   * SCORM Storage
   ******************************************************************/
  initLMS(autoDetect) {
    this.lms = new LMSManager();
    window.lms = this.lms;
    if (!this.lms.active) {
      if (autoDetect) this.lms = null;
    }
  }

  lmsActive() {
    return !!this.lms && this.lms.active;
  }

  saveToLMS(data) {
    if (typeof data !== "object") throw new ScormException(`Invalid data object ${data}`, "save");
    if (this.lmsActive()) {
      try {
        const suspendData = LZString.compressToEncodedURIComponent(JSON.stringify(data));
        this.lms.runtime.suspend_data = suspendData;
      } catch (msg) {
        throw new ScormException(msg, "save");
      }
    } else throw new ScormException("SCORM is not active", "save");
  }

  saveBookmarkToLMS(location) {
    if (typeof location !== "string")
      throw new Error(`Invalid string ${location}`, "saveBookmarkToLMS");
    if (this.lmsActive()) {
      try {
        this.lms.runtime.location = location.trim();
      } catch (msg) {
        throw new ScormException(msg, "saveBookmark");
      }
    }
  }

  saveInteractionToLMS(id, type, response) {
    if (this.lmsActive()) {
      try {
        this.lms.runtime.recordInteraction(id, type, response);
      } catch (msg) {
        throw new ScormException(msg, "record");
      }
    } else throw new ScormException("SCORM is not active", "record");
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
      if (suspendData) data = JSON.parse(LZString.decompressFromEncodedURIComponent(suspendData));
    } catch (msg) {
      throw new ScormException(msg, "recover");
    }
    return data;
  }

  recoverBookmarkFromLMS() {
    if (!this.lms || !this.lms.runtime)
      throw new ScormException("SCORM has not been initalized", "recover");
    if (!this.lms.active) throw new ScormException("SCORM is not active", "recover");
    try {
      return this.lms.runtime.location;
    } catch (msg) {
      throw new ScormException(msg, "recover");
    }
  }
}
