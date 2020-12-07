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

class IntellumRuntime extends ScormRuntime {
  constructor(apiName, win) {
    super(apiName, win);
    this.limit = 1048576;
    this._fixReturnToActivity();
    this.win.addEventListener("unload", this._unload.bind(this));
  }
  close() {
    if (this.active) {
      this.commit();
      this.finish();
    }
    const a = !!this.win && this.win.document.querySelector("#scorm_window_warning a");
    if (a) a.click();
    else window.close();
  }

  _fixReturnToActivity() {
    const a = this.win.document.querySelector("#scorm_window_warning a");
    if (a) {
      a.innerText = "Save & Close Activity";
      a.addEventListener("click", this._unload.bind(this));
    }
  }
}

export default IntellumRuntime;
