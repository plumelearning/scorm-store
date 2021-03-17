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

/* eslint-disable camelcase */

import { milliSecToSCORM12Time, milliSecToSCORM2004Time } from "./scormTime";

class ScormRuntime {
  constructor(apiName, win) {
    this.debug = false;
    this.apiName = "";
    this.commitAll = false;
    this.win = null;
    this.v12 = undefined;
    this.v2004 = undefined;
    this.errorCode = 0;
    this.min = 0;
    this.max = 100;
    this.limit = 4096;
    this.live = false;
    this.startTime = new Date();
    if (win && win[apiName]) {
      this.win = win;
      this.apiName = apiName;
      if (apiName === "API") {
        this.v12 = true;
      } else if (apiName === "API_1484_11") {
        this.v2004 = true;
        this.limit = 65536;
      }
      if (this.initialize()) {
        this.commit();
      }
    }
  }

  initialize() {
    let success = false;
    if (this.v12) {
      success = this._v12call("LMSInitialize");
    }
    if (this.v2004) {
      success = this._v2004call("Initialize");
    }
    if (success) {
      this.exit = "suspend";
      this.live = true;
      window.addEventListener("pagehide", this._unload.bind(this));
    }
    return success;
  }

  addBeforeUnload() {
    window.addEventListener("beforeunload", this._beforeunload, { capture: true });
  }

  removeBeforeUnload() {
    window.removeEventListener("beforeunload", this._beforeunload, { capture: true });
  }

  commit() {
    let success = false;
    if (this.v12) {
      success = this._v12call("LMSCommit");
    }
    if (this.v2004) {
      success = this._v2004call("Commit");
    }
    return success;
  }

  close() {
    return false;
  }

  finish() {
    let success = this.active;
    if (success) {
      this.recordSessionTime();
      this.commit();
      if (this.v12) {
        success = this._v12call("LMSFinish");
        this.live = false;
      }
      if (this.v2004) {
        success = this._v2004call("Terminate");
        this.live = false;
      }
    }
    this.removeBeforeUnload();
    window.removeEventListener("pagehide", this._unload);
    return success;
  }

  recordSessionTime() {
    let success = false;
    if (this.startTime) {
      const endTime = new Date();
      const milliSec = endTime.getTime() - this.startTime.getTime();
      if (this.v12) {
        this._v12set("cmi.core.session_time", milliSecToSCORM12Time(milliSec));
      }
      if (this.v2004) {
        const interval = milliSecToSCORM2004Time(milliSec);
        if (this.debug) window.console.log(`ms ${milliSec} timeinterval ${interval}`);
        this._v2004set("cmi.session_time", interval);
      }
      success = this.errorCode === 0;
    }
    return success;
  }

  destroy() {
    if (this.win && this.win[this.apiName]) this.win[this.apiName] = null;
  }

  // Read Only API
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  get api() {
    return this.win ? this.win[this.apiName] : null;
  }

  get errorString() {
    if (this.errorCode === 666) {
      return "Implementation error";
    }
    if (!this.api) {
      return "No SCORM API";
    }
    try {
      if (this.v12) {
        return this.api.LMSGetErrorString(this.errorCode);
      }
      if (this.v2004) {
        return this.api.GetErrorString(this.errorCode);
      }
    } catch (ex) {
      return ex.message;
    }
    return "No SCORM API";
  }

  get entry() {
    if (this.v12) {
      return this._v12get("cmi.core.entry");
    }
    if (this.v2004) {
      return this._v2004get("cmi.entry");
    }
    return "";
  }

  get mode() {
    if (this.v12) {
      return this._v12get("cmi.core.lesson_mode");
    }
    if (this.v2004) {
      return this._v2004get("cmi.mode");
    }
    return "";
  }

  get active() {
    return this.live && !!this.api;
  }

  // Write only API
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  set exit(value) {
    if (this.v12) {
      switch (value) {
        case "time-out":
        case "suspend":
          this._v12set("cmi.core.exit", value);
          break;
        default:
          this._v12set("cmi.core.exit", "");
      }
    }
    if (this.v2004) {
      switch (value) {
        case "time-out":
        case "suspend":
          this._v2004set("cmi.exit", value);
          break;
        default:
          this._v2004set("cmi.exit", "normal");
      }
    }
  }

  // Read/Write API
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  get location() {
    if (this.v12) {
      return this._v12get("cmi.core.lesson_location");
    }
    if (this.v2004) {
      return this._v2004get("cmi.location");
    }
    return "";
  }

  set location(value) {
    if (this.v12) {
      this._v12set("cmi.core.lesson_location", value);
    }
    if (this.v2004) {
      this._v2004set("cmi.location", value);
    }
  }

  get score() {
    if (this.v12) {
      return Number(this._v12get("cmi.score.score.raw"));
    }
    if (this.v2004) {
      return Number(this._v2004get("cmi.score.raw"));
    }
    return 0;
  }

  set score(raw) {
    if (this.v12) {
      this._v12set("cmi.core.score.min", String(this.min));
      this._v12set("cmi.core.score.max", String(this.max));
      this._v12set("cmi.core.score.raw", String(raw));
    }
    if (this.v2004) {
      this._v2004set("cmi.score.min", String(this.min));
      this._v2004set("cmi.score.max", String(this.max));
      this._v2004set("cmi.score.raw", String(raw));
    }
  }

  get status() {
    if (this.v12) {
      return this._v12get("cmi.core.lesson_status");
    }
    if (this.v2004) {
      let status = this._v2004get("cmi.completion_status");
      if (status === "completed") {
        status = this._v2004get("cmi.success_status");
      }
      return status;
    }
    return "";
  }

  set status(value) {
    let status = "";
    switch (value) {
      case "completed":
      case "incomplete":
      case "passed":
      case "failed":
      case "unknown":
        status = value;
        break;
      default:
        throw new Error(`Unexpected SCORM status ${value}`);
    }
    if (this.v12) {
      this._v12set("cmi.core.lesson_status", value);
    }
    if (this.v2004) {
      switch (status) {
        case "completed":
        case "passed":
        case "failed":
          this._v2004set("cmi.completion_status", "completed");
          break;
        default:
          this._v2004set("cmi.completion_status", "incomplete");
      }
      switch (status) {
        case "passed":
        case "failed":
          this._v2004set("cmi.success_status", status);
          break;
        case "unknown":
        case "incomplete":
          this._v2004set("cmi.success_status", "unknown");
          break;
        default:
          throw new Error(`Unexpected SCORM status ${value}`);
      }
    }
  }

  get suspend_data() {
    let data = "";
    if (this.v12) {
      data = this._v12get("cmi.suspend_data");
    }
    if (this.v2004) {
      data = this._v2004get("cmi.suspend_data");
    }
    return data;
  }

  set suspend_data(data) {
    if (typeof data !== "string")
      throw new Error(`suspend_data must be a string, got ${typeof data}`);
    const str = data;
    if (this.debug) window.console.log(`set suspend_data ${str.length} bytes`);
    if (str.length > this.limit) {
      // let's see how much we have available
      const newLimit = this._suspendSize();
      if (newLimit > str.length) this.limit = newLimit;
      else {
        this.errorCode = 405;
        throw new Error(
          `SCORM error ${this.errorCode}: suspend_data size ${str.length} exceeds available ${this.limit} bytes`
        );
      }
    }
    if (this.v12) {
      this._v12set("cmi.suspend_data", str);
    }
    if (this.v2004) {
      this._v2004set("cmi.suspend_data", str);
    }
  }

  // Private functions
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  _v12call(command, arg = "") {
    if (!this.api) {
      this.errorCode = 301;
      return false;
    }
    if (!this.api[command]) {
      this.errorCode = 666;
      return false;
    }
    let success = false;
    try {
      success = this.api[command] && this.api[command](arg) === "true";
      if (!success) {
        this.errorCode = Number(this.api.LMSGetLastError());
      } else {
        this.errorCode = 0;
      }
    } catch (ex) {
      window.console.error(ex.message);
      this.errorCode = 101;
      success = false;
    }
    if (this.debug) {
      window.console.log(`${command}("${arg}") errorCode ${this.errorCode}`);
    }
    return success;
  }

  _v2004call(command, arg = "") {
    if (!this.api) {
      this.errorCode = 301;
      return false;
    }
    if (!this.api[command]) {
      this.errorCode = 666;
      return false;
    }
    let success = false;
    try {
      success = this.api[command] && this.api[command](arg) === "true";
      if (!success) {
        this.errorCode = Number(this.api.GetLastError());
      } else {
        this.errorCode = 0;
      }
    } catch (ex) {
      window.console.error(ex.message);
      this.errorCode = 101;
    }
    if (this.debug) {
      window.console.log(`${command}("${arg}") errorCode ${this.errorCode}`);
    }
    return success;
  }

  _v12get(parameter) {
    let value;
    if (!this.api) {
      this.errorCode = 301;
      return value;
    }
    try {
      value = this.api.LMSGetValue(parameter);
      if (value === "") {
        this.errorCode = Number(this.api.LMSGetLastError());
      } else {
        this.errorCode = 0;
      }
    } catch (ex) {
      this.errorCode = 101;
      window.console.error(ex.message);
    }
    if (this.debug) {
      window.console.log(`LMSGetValue("${parameter}") errorCode ${this.errorCode}`);
    }
    return value;
  }

  _v2004get(parameter) {
    let value;
    if (!this.api) {
      this.errorCode = 301;
      return value;
    }
    try {
      value = this.api.GetValue(parameter);
      if (value === "") {
        this.errorCode = Number(this.api.GetLastError());
      } else {
        this.errorCode = 0;
      }
    } catch (ex) {
      this.errorCode = 101;
      window.console.error(ex.message);
    }
    if (this.debug) {
      window.console.log(`GetValue("${parameter}") errorCode ${this.errorCode}`);
    }
    return value;
  }

  _v12set(parameter, value) {
    if (!this.api) {
      this.errorCode = 301;
    } else {
      try {
        const success = this.api.LMSSetValue(parameter, value) === "true";
        if (!success) {
          this.errorCode = Number(this.api.LMSGetLastError());
        } else {
          this.errorCode = 0;
          if (this.commitAll) {
            this.commit();
          }
        }
      } catch (ex) {
        window.console.error(ex.message);
        this.errorCode = 101;
      }
    }
    if (this.debug) {
      window.console.log(`LMSSetValue("${parameter}", "${value}") errorCode ${this.errorCode}`);
    }
  }

  _v2004set(parameter, value) {
    if (!this.api) {
      this.errorCode = 301;
    } else {
      try {
        const success = this.api.SetValue(parameter, value) === "true";
        if (!success) {
          this.errorCode = Number(this.api.GetLastError());
        } else {
          this.errorCode = 0;
          if (this.commitAll) {
            this.commit();
          }
        }
      } catch (ex) {
        window.console.error(ex.message);
        this.errorCode = 101;
      }
    }
    if (this.debug) {
      window.console.log(`SetValue("${parameter}", "${value}") errorCode ${this.errorCode}`);
    }
  }

  _suspendSize() {
    const ceiling = 64; // max number of Ks we look for
    const K = "K".repeat(1024); // one K
    let n = 0;
    let step = 4;
    let error = 0;
    //turn  off debug noise
    const _debug = this.debug;
    this.debug = false;
    if (this.v12) {
      n = step;
      // save existing
      const buffer = this._v12get("cmi.suspend_data");
      // try until it hurts
      while (n <= ceiling) {
        this._v12set("cmi.suspend_data", K.repeat(n));
        error = this.errorCode;
        if (error) {
          break;
        }
        n += step;
      }
      // restore previous
      this._v12set("cmi.suspend_data", buffer);
    }
    if (this.v2004 && ceiling > 64) {
      step = 64;
      n = step;
      // save existing
      const buffer = this._v2004get("cmi.suspend_data");
      // try until it hurts
      while (n <= ceiling) {
        this._v2004set("cmi.suspend_data", K.repeat(n));
        error = this.errorCode;
        if (error) {
          break;
        }
        n += step;
      }
      // restore previous
      this._v2004set("cmi.suspend_data", buffer);
    }
    const size = 1024 * (error ? n - step : n);
    this.debug = _debug;
    if (this.debug) {
      window.console.log(`suspend_data size: ${size}`);
    }
    return size;
  }

  // pop alert confirming exit
  _beforeunload(event) {
    event.preventDefault();
    return (event.returnValue = "Are you sure you want to exit?");
  }

  _unload() {
    this.finish();
  }
}

export default ScormRuntime;
