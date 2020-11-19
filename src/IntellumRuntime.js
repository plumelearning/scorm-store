import ScormRuntime from './ScormRuntime';

class IntellumRuntime extends ScormRuntime {
  constructor(apiName, win) {
    super(apiName, win);
    this.limit = 1048576;
    this._fixReturnToActivity();
    this.win.addEventListener('unload', this._unload.bind(this));
  }

  close() {
    if (this.active) {
      this.commit();
      this.finish();
    }
    const a = !!this.win && this.win.document.querySelector('#scorm_window_warning a');
    if (a) a.click();
    else window.top.close();
  }

  _fixReturnToActivity() {
    const a = this.win.document.querySelector('#scorm_window_warning a');
    if (a) {
      a.innerText = 'Save & Close Activity';
      a.addEventListener('click', this._unload.bind(this));
    }
  }
}

export default IntellumRuntime;
