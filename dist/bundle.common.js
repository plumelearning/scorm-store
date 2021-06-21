/*!
* @plumelearning/scorm-store v1.4.1
* Copyright 2018, 2019, 2020 Strategic Technology Solutions DBA Plum eLearning
* @license Apache-2.0
*/
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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

function zeroPad(intNum, intNumDigits) {
  var strTemp;
  var intLen;
  var i;

  strTemp = String(intNum);
  intLen = strTemp.length;

  if (intLen > intNumDigits) {
    strTemp = strTemp.substr(0, intNumDigits);
  } else {
    for (i = intLen; i < intNumDigits; i++) {
      strTemp = "0" + strTemp;
    }
  }

  return strTemp;
}

// SCORM 1.2 Version
function milliSecToSCORM12Time(intTotalMilliseconds, blnIncludeFraction = true) {
  var intHours;
  var intMinutes;
  var intSeconds;
  var intMilliseconds;
  var intHundredths;
  var strCMITimeSpan;

  //extract time parts
  intMilliseconds = intTotalMilliseconds % 1000;

  intSeconds = ((intTotalMilliseconds - intMilliseconds) / 1000) % 60;

  intMinutes = ((intTotalMilliseconds - intMilliseconds - intSeconds * 1000) / 60000) % 60;

  intHours =
    (intTotalMilliseconds - intMilliseconds - intSeconds * 1000 - intMinutes * 60000) / 3600000;

  /**
   * Deal with exceptional case when content used a huge amount of time and
   * interpreted CMITimstamp * to allow a number of intMinutes and seconds
   * greater than 60 i.e. * 9999:99:99.99 instead of 9999:60:60:99 note - this
   * case is permissable * under SCORM, but will be exceptionally rare
   */

  if (intHours === 10000) {
    intHours = 9999;
    intMinutes = (intTotalMilliseconds - intHours * 3600000) / 60000;
    if (intMinutes === 100) {
      intMinutes = 99;
    }
    intMinutes = Math.floor(intMinutes);

    intSeconds = (intTotalMilliseconds - intHours * 3600000 - intMinutes * 60000) / 1000;
    if (intSeconds === 100) {
      intSeconds = 99;
    }
    intSeconds = Math.floor(intSeconds);

    intMilliseconds =
      intTotalMilliseconds - intHours * 3600000 - intMinutes * 60000 - intSeconds * 1000;
  }
  //drop the extra precision from the milliseconds
  intHundredths = Math.floor(intMilliseconds / 10);

  //put in padding 0's and concatinate to get the proper format
  strCMITimeSpan =
    zeroPad(intHours, 4) + ":" + zeroPad(intMinutes, 2) + ":" + zeroPad(intSeconds, 2);

  if (blnIncludeFraction) {
    strCMITimeSpan += "." + intHundredths;
  }

  //check for case where total milliseconds is greater than max supported by
  // strCMITimeSpan
  if (intHours > 9999) {
    strCMITimeSpan = "9999:99:99";

    if (blnIncludeFraction) {
      strCMITimeSpan += ".99";
    }
  }

  return strCMITimeSpan;
}

// SCORM 2004 Version
function milliSecToSCORM2004Time(intTotalMilliseconds) {
  var ScormTime = "";

  var Hundredths; //decrementing counter - work at the hundreths of a second level because that is all the precision that is required

  var Seconds; // 100 hundreths of a seconds
  var Minutes; // 60 seconds
  var Hours; // 60 minutes
  var Days; // 24 hours
  var Months; // assumed to be an "average" month (figures a leap year every 4 years)
  // = ((365*4) + 1) / 48 days - 30.4375 days per month
  var Years; // assumed to be 12 "average" months

  var HUNDREDTHS_PER_SECOND = 100;
  var HUNDREDTHS_PER_MINUTE = HUNDREDTHS_PER_SECOND * 60;
  var HUNDREDTHS_PER_HOUR = HUNDREDTHS_PER_MINUTE * 60;
  var HUNDREDTHS_PER_DAY = HUNDREDTHS_PER_HOUR * 24;
  var HUNDREDTHS_PER_MONTH = HUNDREDTHS_PER_DAY * ((365 * 4 + 1) / 48);
  var HUNDREDTHS_PER_YEAR = HUNDREDTHS_PER_MONTH * 12;

  var totalHundredths = Math.floor(intTotalMilliseconds / 10);
  Hundredths = totalHundredths;

  Years = Math.floor(Hundredths / HUNDREDTHS_PER_YEAR);
  Hundredths -= Years * HUNDREDTHS_PER_YEAR;

  Months = Math.floor(Hundredths / HUNDREDTHS_PER_MONTH);
  Hundredths -= Months * HUNDREDTHS_PER_MONTH;

  Days = Math.floor(Hundredths / HUNDREDTHS_PER_DAY);
  Hundredths -= Days * HUNDREDTHS_PER_DAY;

  Hours = Math.floor(Hundredths / HUNDREDTHS_PER_HOUR);
  Hundredths -= Hours * HUNDREDTHS_PER_HOUR;

  Minutes = Math.floor(Hundredths / HUNDREDTHS_PER_MINUTE);
  Hundredths -= Minutes * HUNDREDTHS_PER_MINUTE;

  Seconds = Math.floor(Hundredths / HUNDREDTHS_PER_SECOND);
  Hundredths -= Seconds * HUNDREDTHS_PER_SECOND;

  if (Years > 0) {
    ScormTime += Years + "Y";
  }
  if (Months > 0) {
    ScormTime += Months + "M";
  }
  if (Days > 0) {
    ScormTime += Days + "D";
  }

  //check to see if we have any time before adding the "T"
  if (Hundredths + Seconds + Minutes + Hours > 0) {
    ScormTime += "T";

    if (Hours > 0) {
      ScormTime += Hours + "H";
    }

    if (Minutes > 0) {
      ScormTime += Minutes + "M";
    }

    if (Hundredths + Seconds > 0) {
      ScormTime += Seconds;

      if (Hundredths > 0) {
        ScormTime += "." + Hundredths;
      }

      ScormTime += "S";
    }
  }

  if (ScormTime === "") {
    ScormTime = "T0S";
  }

  ScormTime = "P" + ScormTime;

  return ScormTime;
}

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
    if (this.active) {
      this.commit();
      this.finish();
    }
    setTimeout(() => {
      if (window.opener) window.close();
      else alert("You may now close this window.");
    }, 0);
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
    return !!this.api && this.live && this.commit();
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

class IntellumRuntime extends ScormRuntime {
  constructor(apiName, win) {
    super(apiName, win);
    this.limit = 1048576;
    this._fixReturnToActivity();
    this.win.addEventListener("pagehide", this._unload.bind(this));
  }

  close() {
    if (this.active) {
      this.commit();
      this.finish();
    }
    this.win.location.reload();
    setTimeout(() => {
      if (window.opener) window.close();
      else alert("You may now close this window.");
    }, 0);
  }

  _fixReturnToActivity() {
    const a = this.win.document.querySelector("#scorm_window_warning a");
    if (a) {
      a.innerText = "Save & Close Activity";
      a.addEventListener("click", this._unload.bind(this));
    }
  }
}

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

  complete(terminate = false) {
    if (this.active) {
      try {
        this.runtime.score = 100;
        this.runtime.status = "passed";
        this.runtime.exit = "normal";
        this.runtime.recordSessionTime();
        this.runtime.removeBeforeUnload();
        if (terminate) this.runtime.finish();
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

// localStorage exception constructor
function LocalException(message, type = "") {
  this.message = message;
  this.type = type;
}

// SCORM exception constructor
function ScormException(message, type = "") {
  this.message = message;
  this.type = type;
}

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

const LZString$1 = require("lz-string");

// ScormStore Singleton
class ScormStore {
  // only one instance!
  constructor(scorm = false, storeName = "plum_course") {
    const config = window.courseConfig;
    const autoDetect = config && config.autoDetectSCORM;
    const disableLocal = config && config.noLocalStorage;
    if (!ScormStore.instance) {
      if (scorm) this.initLMS(autoDetect);
      if (!this.lms && !disableLocal) this.initLocal(storeName);
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
  initLocal(storeName) {
    try {
      this.local = new LocalStorage(storeName);
      this.localBookmark = new LocalStorage(`${storeName}_bookmark`);
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
      this.localBookmark.setData({ location: location.trim() });
    } catch (msg) {
      throw new LocalException(msg, "save");
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

  recoverBookmarkFromLocal() {
    let bookmark = "";
    if (!this.localBookmark)
      throw new LocalException("localStorage has not been initalized", "recover");
    try {
      const data = this.localBookmark.getData();
      if (data.bookmark) bookmark = data.bookmark;
    } catch (message) {
      throw new LocalException(message, "recover");
    }
    return bookmark;
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
        const suspendData = LZString$1.compressToEncodedURIComponent(JSON.stringify(data));
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
      if (suspendData) data = JSON.parse(LZString$1.decompressFromEncodedURIComponent(suspendData));
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

exports.LMSManager = LMSManager;
exports.LocalException = LocalException;
exports.LocalStorage = LocalStorage;
exports.ScormException = ScormException;
exports.default = ScormStore;
