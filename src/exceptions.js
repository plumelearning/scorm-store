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
export function LocalException(message, type = "") {
  this.message = message;
  this.type = type;
}

// SCORM exception constructor
export function ScormException(message, type = "") {
  this.message = message;
  this.type = type;
}

// Network exception constructor
export function NetworkException(message, type = "") {
  this.message = message;
  this.type = type;
}
