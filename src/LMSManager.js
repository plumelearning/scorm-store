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

  get runtime() {
    return this._runtime;
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

  complete() {
    if (this.active) {
      try {
        this.runtime.score = 100;
        this.runtime.status = "passed";
        this.runtime.exit = "normal";
        this.runtime.recordSessionTime();
        this.runtime.finish();
        return true;
      } catch (message) {
        console.error(message);
      }
    }
    return false;
  }

  close() {
    if (this.runtime) this.runtime.close();
    else window.top.close();
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
