/*!
* @plumelearning/scorm-store v1.6.0
* Copyright 2018, 2019, 2020 Strategic Technology Solutions DBA Plum eLearning
* @license Apache-2.0
*/
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
    this.win = null;
    this.v12 = undefined;
    this.v2004 = undefined;
    this.errorCode = 0;
    this.interactions = [];
    this.min = 0;
    this.max = 100;
    this.limit = 4096;
    this.live = false;
    this.closeOnUnload = false;
    this.startTime = new Date();
    this._boundUnload = () => {};
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
        this._boundUnload = this._unload.bind(this);
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
      this._addListeners();
    }
    const interactionCount = Number(
      this.v12
        ? this._v12get("cmi.interactions._count")
        : this._v2004call("cmi.interactions._count")
    );
    if (interactionCount) {
      for (let n = 0; n < interactionCount; n += 1) {
        const api = { id: `cmi.interactions.${n}.id`, type: `cmi.interactions.${n}.type` };
        this.interactions.push({
          id: this.v12 ? this._v12get(api.id) : this._v2004get(api.id),
          type: this.v12 ? this._v12get(api.type) : this._v2004get(api.type),
        });
      }
    }
    return success;
  }

  commit() {
    let success = false;
    if (this.v12) {
      success = this._v12call("LMSCommit");
    }
    if (this.v2004) {
      success = this._v2004call("Commit");
    }
    if (!success) this.live = false;
    return success;
  }

  close() {
    this.finish();
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
    this._removeListeners();
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

  getInteraction(id, type) {
    // supported?
    const count = Number(
      this.v12 ? this._v12get("cmi.interactions._count") : this._v2004get("cmi.interactions._count")
    );
    if (this.errorCode)
      throw new Error(`SCORM interactions are not supported. (ERROR code ${this.errorCode})`);
    // valid args?
    if (typeof id !== "string") throw new Error(`SCORM interaction id must be a string. Got ${id}`);
    if (
      ![
        "true-false",
        "choice",
        "fill-in",
        "matching",
        "performance",
        "sequencing",
        "likert",
        "numeric",
      ].includes(type)
    )
      throw new Error(`Unsupported SCORM interaction type: ${type}`);
    // already registered? then use it
    let index = this.interactions.findIndex((i) => id === i.id && type === i.type);
    // else register it
    if (index === -1) {
      index = count;
      if (this.v12) {
        this._v12set(`cmi.interactions.${index}.id`, id);
        this._v12set(`cmi.interactions.${index}.type`, type);
      } else {
        this._v2004set(`cmi.interactions.${index}.id`, id);
        this._v2004set(`cmi.interactions.${index}.type`, type);
      }
      this.commit();
      this.interactions.push({ id, type });
    }
    return index;
  }

  recordInteraction(id, type, response) {
    const index = this.getInteraction(id, type);
    if (this.v12) this._v12set(`cmi.interactions.${index}.student_response`, response);
    else this._v2004set(`cmi.interactions.${index}.student_response`, response);
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
    return !!this.api && this.live;
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

  // Page life cycle event handling
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  _addListeners() {
    window.addEventListener("freeze", this._boundUnload, { capture: true });
    window.addEventListener("pagehide", this._boundUnload, { capture: true });
  }

  _removeListeners() {
    window.removeEventListener("freeze", this._boundUnload, { capture: true });
    window.removeEventListener("pagehide", this._boundUnload, { capture: true });
  }

  _unload(event) {
    if ("returnValue" in event) delete event.returnValue;
    this.finish();
    if (this.closeOnUnload) {
      setTimeout(() => {
        if (window.opener) window.close();
        else alert("You may now close this window.");
      }, 0);
    }
  }

  // SCORM interface
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

// Copyright (c) 2013 Pieroxy <pieroxy@pieroxy.net>
// This work is free. You can redistribute it and/or modify it
// under the terms of the WTFPL, Version 2
// For more information see LICENSE.txt or http://www.wtfpl.net/
//
// For more information, the home page:
// http://pieroxy.net/blog/pages/lz-string/testing.html
//
// LZ-based compression algorithm, version 1.4.4
const LZString = (function () {
  // private property
  var f = String.fromCharCode;
  var keyStrBase64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  var keyStrUriSafe = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$";
  var baseReverseDic = {};

  function getBaseValue(alphabet, character) {
    if (!baseReverseDic[alphabet]) {
      baseReverseDic[alphabet] = {};
      for (var i = 0; i < alphabet.length; i++) {
        baseReverseDic[alphabet][alphabet.charAt(i)] = i;
      }
    }
    return baseReverseDic[alphabet][character];
  }

  var LZString = {
    compressToBase64: function (input) {
      if (input == null) return "";
      var res = LZString._compress(input, 6, function (a) {
        return keyStrBase64.charAt(a);
      });
      switch (
        res.length % 4 // To produce valid Base64
      ) {
        default: // When could this happen ?
        case 0:
          return res;
        case 1:
          return res + "===";
        case 2:
          return res + "==";
        case 3:
          return res + "=";
      }
    },

    decompressFromBase64: function (input) {
      if (input == null) return "";
      if (input == "") return null;
      return LZString._decompress(input.length, 32, function (index) {
        return getBaseValue(keyStrBase64, input.charAt(index));
      });
    },

    compressToUTF16: function (input) {
      if (input == null) return "";
      return (
        LZString._compress(input, 15, function (a) {
          return f(a + 32);
        }) + " "
      );
    },

    decompressFromUTF16: function (compressed) {
      if (compressed == null) return "";
      if (compressed == "") return null;
      return LZString._decompress(compressed.length, 16384, function (index) {
        return compressed.charCodeAt(index) - 32;
      });
    },

    //compress into uint8array (UCS-2 big endian format)
    compressToUint8Array: function (uncompressed) {
      var compressed = LZString.compress(uncompressed);
      var buf = new Uint8Array(compressed.length * 2); // 2 bytes per character

      for (var i = 0, TotalLen = compressed.length; i < TotalLen; i++) {
        var current_value = compressed.charCodeAt(i);
        buf[i * 2] = current_value >>> 8;
        buf[i * 2 + 1] = current_value % 256;
      }
      return buf;
    },

    //decompress from uint8array (UCS-2 big endian format)
    decompressFromUint8Array: function (compressed) {
      if (compressed === null || compressed === undefined) {
        return LZString.decompress(compressed);
      } else {
        var buf = new Array(compressed.length / 2); // 2 bytes per character
        for (var i = 0, TotalLen = buf.length; i < TotalLen; i++) {
          buf[i] = compressed[i * 2] * 256 + compressed[i * 2 + 1];
        }

        var result = [];
        buf.forEach(function (c) {
          result.push(f(c));
        });
        return LZString.decompress(result.join(""));
      }
    },

    //compress into a string that is already URI encoded
    compressToEncodedURIComponent: function (input) {
      if (input == null) return "";
      return LZString._compress(input, 6, function (a) {
        return keyStrUriSafe.charAt(a);
      });
    },

    //decompress from an output of compressToEncodedURIComponent
    decompressFromEncodedURIComponent: function (input) {
      if (input == null) return "";
      if (input == "") return null;
      input = input.replace(/ /g, "+");
      return LZString._decompress(input.length, 32, function (index) {
        return getBaseValue(keyStrUriSafe, input.charAt(index));
      });
    },

    compress: function (uncompressed) {
      return LZString._compress(uncompressed, 16, function (a) {
        return f(a);
      });
    },
    _compress: function (uncompressed, bitsPerChar, getCharFromInt) {
      if (uncompressed == null) return "";
      var i,
        value,
        context_dictionary = {},
        context_dictionaryToCreate = {},
        context_c = "",
        context_wc = "",
        context_w = "",
        context_enlargeIn = 2, // Compensate for the first entry which should not count
        context_dictSize = 3,
        context_numBits = 2,
        context_data = [],
        context_data_val = 0,
        context_data_position = 0,
        ii;

      for (ii = 0; ii < uncompressed.length; ii += 1) {
        context_c = uncompressed.charAt(ii);
        if (!Object.prototype.hasOwnProperty.call(context_dictionary, context_c)) {
          context_dictionary[context_c] = context_dictSize++;
          context_dictionaryToCreate[context_c] = true;
        }

        context_wc = context_w + context_c;
        if (Object.prototype.hasOwnProperty.call(context_dictionary, context_wc)) {
          context_w = context_wc;
        } else {
          if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
            if (context_w.charCodeAt(0) < 256) {
              for (i = 0; i < context_numBits; i++) {
                context_data_val = context_data_val << 1;
                if (context_data_position == bitsPerChar - 1) {
                  context_data_position = 0;
                  context_data.push(getCharFromInt(context_data_val));
                  context_data_val = 0;
                } else {
                  context_data_position++;
                }
              }
              value = context_w.charCodeAt(0);
              for (i = 0; i < 8; i++) {
                context_data_val = (context_data_val << 1) | (value & 1);
                if (context_data_position == bitsPerChar - 1) {
                  context_data_position = 0;
                  context_data.push(getCharFromInt(context_data_val));
                  context_data_val = 0;
                } else {
                  context_data_position++;
                }
                value = value >> 1;
              }
            } else {
              value = 1;
              for (i = 0; i < context_numBits; i++) {
                context_data_val = (context_data_val << 1) | value;
                if (context_data_position == bitsPerChar - 1) {
                  context_data_position = 0;
                  context_data.push(getCharFromInt(context_data_val));
                  context_data_val = 0;
                } else {
                  context_data_position++;
                }
                value = 0;
              }
              value = context_w.charCodeAt(0);
              for (i = 0; i < 16; i++) {
                context_data_val = (context_data_val << 1) | (value & 1);
                if (context_data_position == bitsPerChar - 1) {
                  context_data_position = 0;
                  context_data.push(getCharFromInt(context_data_val));
                  context_data_val = 0;
                } else {
                  context_data_position++;
                }
                value = value >> 1;
              }
            }
            context_enlargeIn--;
            if (context_enlargeIn == 0) {
              context_enlargeIn = Math.pow(2, context_numBits);
              context_numBits++;
            }
            delete context_dictionaryToCreate[context_w];
          } else {
            value = context_dictionary[context_w];
            for (i = 0; i < context_numBits; i++) {
              context_data_val = (context_data_val << 1) | (value & 1);
              if (context_data_position == bitsPerChar - 1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = value >> 1;
            }
          }
          context_enlargeIn--;
          if (context_enlargeIn == 0) {
            context_enlargeIn = Math.pow(2, context_numBits);
            context_numBits++;
          }
          // Add wc to the dictionary.
          context_dictionary[context_wc] = context_dictSize++;
          context_w = String(context_c);
        }
      }

      // Output the code for w.
      if (context_w !== "") {
        if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
          if (context_w.charCodeAt(0) < 256) {
            for (i = 0; i < context_numBits; i++) {
              context_data_val = context_data_val << 1;
              if (context_data_position == bitsPerChar - 1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
            }
            value = context_w.charCodeAt(0);
            for (i = 0; i < 8; i++) {
              context_data_val = (context_data_val << 1) | (value & 1);
              if (context_data_position == bitsPerChar - 1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = value >> 1;
            }
          } else {
            value = 1;
            for (i = 0; i < context_numBits; i++) {
              context_data_val = (context_data_val << 1) | value;
              if (context_data_position == bitsPerChar - 1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = 0;
            }
            value = context_w.charCodeAt(0);
            for (i = 0; i < 16; i++) {
              context_data_val = (context_data_val << 1) | (value & 1);
              if (context_data_position == bitsPerChar - 1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = value >> 1;
            }
          }
          context_enlargeIn--;
          if (context_enlargeIn == 0) {
            context_enlargeIn = Math.pow(2, context_numBits);
            context_numBits++;
          }
          delete context_dictionaryToCreate[context_w];
        } else {
          value = context_dictionary[context_w];
          for (i = 0; i < context_numBits; i++) {
            context_data_val = (context_data_val << 1) | (value & 1);
            if (context_data_position == bitsPerChar - 1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }
        }
        context_enlargeIn--;
        if (context_enlargeIn == 0) {
          context_enlargeIn = Math.pow(2, context_numBits);
          context_numBits++;
        }
      }

      // Mark the end of the stream
      value = 2;
      for (i = 0; i < context_numBits; i++) {
        context_data_val = (context_data_val << 1) | (value & 1);
        if (context_data_position == bitsPerChar - 1) {
          context_data_position = 0;
          context_data.push(getCharFromInt(context_data_val));
          context_data_val = 0;
        } else {
          context_data_position++;
        }
        value = value >> 1;
      }

      // Flush the last char
      // eslint-disable-next-line no-constant-condition
      while (true) {
        context_data_val = context_data_val << 1;
        if (context_data_position == bitsPerChar - 1) {
          context_data.push(getCharFromInt(context_data_val));
          break;
        } else context_data_position++;
      }
      return context_data.join("");
    },

    decompress: function (compressed) {
      if (compressed == null) return "";
      if (compressed == "") return null;
      return LZString._decompress(compressed.length, 32768, function (index) {
        return compressed.charCodeAt(index);
      });
    },

    _decompress: function (length, resetValue, getNextValue) {
      var dictionary = [],
        // eslint-disable-next-line no-unused-vars
        next,
        enlargeIn = 4,
        dictSize = 4,
        numBits = 3,
        entry = "",
        result = [],
        i,
        w,
        bits,
        resb,
        maxpower,
        power,
        c,
        data = { val: getNextValue(0), position: resetValue, index: 1 };

      for (i = 0; i < 3; i += 1) {
        dictionary[i] = i;
      }

      bits = 0;
      maxpower = Math.pow(2, 2);
      power = 1;
      while (power != maxpower) {
        resb = data.val & data.position;
        data.position >>= 1;
        if (data.position == 0) {
          data.position = resetValue;
          data.val = getNextValue(data.index++);
        }
        bits |= (resb > 0 ? 1 : 0) * power;
        power <<= 1;
      }

      switch ((next = bits)) {
        case 0:
          bits = 0;
          maxpower = Math.pow(2, 8);
          power = 1;
          while (power != maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb > 0 ? 1 : 0) * power;
            power <<= 1;
          }
          c = f(bits);
          break;
        case 1:
          bits = 0;
          maxpower = Math.pow(2, 16);
          power = 1;
          while (power != maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb > 0 ? 1 : 0) * power;
            power <<= 1;
          }
          c = f(bits);
          break;
        case 2:
          return "";
      }
      dictionary[3] = c;
      w = c;
      result.push(c);
      // eslint-disable-next-line no-constant-condition
      while (true) {
        if (data.index > length) {
          return "";
        }

        bits = 0;
        maxpower = Math.pow(2, numBits);
        power = 1;
        while (power != maxpower) {
          resb = data.val & data.position;
          data.position >>= 1;
          if (data.position == 0) {
            data.position = resetValue;
            data.val = getNextValue(data.index++);
          }
          bits |= (resb > 0 ? 1 : 0) * power;
          power <<= 1;
        }

        switch ((c = bits)) {
          case 0:
            bits = 0;
            maxpower = Math.pow(2, 8);
            power = 1;
            while (power != maxpower) {
              resb = data.val & data.position;
              data.position >>= 1;
              if (data.position == 0) {
                data.position = resetValue;
                data.val = getNextValue(data.index++);
              }
              bits |= (resb > 0 ? 1 : 0) * power;
              power <<= 1;
            }

            dictionary[dictSize++] = f(bits);
            c = dictSize - 1;
            enlargeIn--;
            break;
          case 1:
            bits = 0;
            maxpower = Math.pow(2, 16);
            power = 1;
            while (power != maxpower) {
              resb = data.val & data.position;
              data.position >>= 1;
              if (data.position == 0) {
                data.position = resetValue;
                data.val = getNextValue(data.index++);
              }
              bits |= (resb > 0 ? 1 : 0) * power;
              power <<= 1;
            }
            dictionary[dictSize++] = f(bits);
            c = dictSize - 1;
            enlargeIn--;
            break;
          case 2:
            return result.join("");
        }

        if (enlargeIn == 0) {
          enlargeIn = Math.pow(2, numBits);
          numBits++;
        }

        if (dictionary[c]) {
          entry = dictionary[c];
        } else {
          if (c === dictSize) {
            entry = w + w.charAt(0);
          } else {
            return null;
          }
        }
        result.push(entry);

        // Add w+entry[0] to the dictionary.
        dictionary[dictSize++] = w + entry.charAt(0);
        enlargeIn--;

        w = entry;

        if (enlargeIn == 0) {
          enlargeIn = Math.pow(2, numBits);
          numBits++;
        }
      }
    },
  };
  return LZString;
})();

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

// ScormStore Singleton
class ScormStore {
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
    return !!this.lms && this.commitToLMS();
  }

  /**
   * Local Storage
   ******************************************************************/
  initLocal() {
    try {
      this.local = new LocalStorage(this.storeName);
      this.localBookmark = new LocalStorage(`${this.storeName}_bookmark`);
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
      this.localBookmark.setData({ location: location.trim() });
    } catch (msg) {
      throw new LocalException(msg, "save");
    }
  }

  saveInteractionToLocal(id, type, response) {
    const key = `${id}-${type}`.toLowerCase().replace(/-/g, "_");
    // console.log(`saveInteractionToLocal( ${id}, ${type}, ${response}) key: ${key}`);
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
    return this.lmsActive() && this.lms.commit();
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

export default ScormStore;
export { LMSManager, LocalException, LocalStorage, ScormException };
