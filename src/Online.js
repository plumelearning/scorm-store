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
