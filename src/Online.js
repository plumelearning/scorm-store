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

export default class {
  constructor(url) {
    this.url = url;
    this.online = false;
    this.check();
  }

  // returns a Promise which resolves if online, catches if not
  check() {
    let xhr = new XMLHttpRequest();
    const randomNum = Math.round(Math.random() * 10000);
    return new Promise((resolve, reject) => {
      xhr.onload = () => {
        // Set online status
        this.online = true;
        resolve(true);
      };
      xhr.onerror = () => {
        // Set online status
        this.online = false;
        reject(false);
      };
      xhr.open("HEAD", `${this.url}?rand=${randomNum}`, true);
      xhr.send();
    });
  }
}
