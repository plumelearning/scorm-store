// localStorage exception constructor
export function LocalException(message, type = '') {
  this.message = message;
  this.type = type;
}

// SCORM exception constructor
export function ScormException(message, type = '') {
  this.message = message;
  this.type = type;
}

// Network exception constructor
export function NetworkException(message, type = '') {
  this.message = message;
  this.type = type;
}
