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

import ScormRuntime from "./ScormRuntime";
import IntellumRuntime from "./IntellumRuntime";

class LMSManager {
  constructor() {
    this._debug = false;
    this._lmsWindow = null;
    this._courseWindow = window.top;
    this._apiName = "";
    this._runtime = null;
    this._lms = "";
    this.started = false;
    if (this._findScorm()) {
      this._findLMS();
      this.start();
    }
  }

  get active() {
    return window.navigator.onLine && this.started && this._runtime && this._runtime.active;
  }

  get debug() {
    return this._debug;
  }

  set debug(debug) {
    this._debug = debug;
    if (this._runtime) {
      this._runtime.debug = debug;
    }
  }

  get closeOnTermination() {
    return this._runtime.closeOnUnload;
  }

  set closeOnTermination(tf) {
    if (this._runtime) {
      this._runtime.closeOnUnload = tf;
    }
  }

  get runtime() {
    return this._runtime;
  }

  commit() {
    return this.active && this._runtime.commit();
  }

  start() {
    if (this._lmsWindow) {
      switch (this._lms) {
        case "Intellum":
          this._runtime = new IntellumRuntime(this._apiName, this._lmsWindow);
          break;
        default:
          this._runtime = new ScormRuntime(this._apiName, this._lmsWindow);
      }
      if (this._debug) {
        window.console.log(`started ${this._lms} runtime`);
        this._runtime.debug = true;
      }
      this._runtime.status = "incomplete";
      this._runtime.score = 0;
      this.started = true;
    }
  }

  complete(terminate = false, score = 100) {
    if (this.active) {
      try {
        this.runtime.score = score;
        this.runtime.status = "passed";
        this.runtime.exit = "normal";
        if (terminate) {
          this.runtime.finish();
          this.runtime.removeListeners();
        } else this.runtime.commit();
        return true;
      } catch (message) {
        console.error(message);
      }
    }
    return false;
  }

  close() {
    if (this.runtime) this.runtime.close();
    else if (window.opener) window.close();
    else alert("Launch window not available. Please close this window.");
  }

  _findScorm() {
    const maxAttempts = 100;
    let win = window;
    let apiName = "";
    let attempts = 0;

    while (win && attempts < maxAttempts) {
      attempts += 1;
      apiName = LMSManager._windowAPI(win);
      if (this._debug) {
        window.console.log(`attempt ${attempts}`);
      }
      if (apiName) {
        if (this._debug) {
          window.console.log(`found ${apiName}`);
        }
        this._apiName = apiName;
        this._lmsWindow = win;
        return true;
      }
      win = win === win.parent ? win.opener : win.parent;
    }
    return false;
  }

  _findLMS() {
    if (this._apiName && this._lmsWindow) {
      if (this._lmsWindow.Intellum) {
        this._lms = "Intellum";
      } else if (this._lmsWindow.RunTimeApi) {
        this._lms = "Rustici";
      } else {
        this._lms = "unkown";
      }
      if (this._debug) {
        window.console.log(`found ${this._lms} LMS`);
      }
    }
  }

  static _windowAPI(win) {
    if (!win) {
      return "";
    }
    if (win.API) {
      return "API";
    }
    if (win.API_1484_11) {
      return "API_1484_11";
    }
    return "";
  }
}

export default LMSManager;
