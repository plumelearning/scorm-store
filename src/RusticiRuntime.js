import ScormRuntime from './ScormRuntime';

class RusticiRuntime extends ScormRuntime {
  get active() {
    return this.api && this.api.Initialized && !this.api.Terminated;
  }
}

export default RusticiRuntime;
