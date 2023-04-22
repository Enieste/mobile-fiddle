import { observable, values } from 'mobx';

class UploadsStore {

  uploads = observable(new Map());

  set = (k, v) => this.uploads.set(k, v);

  get = k => this.uploads.get(k);

  compressComplete = (key) => {
    this.set(key, {
      ...this.get(key),
      compressing: false,
    })
  }

  progress = (key, progress) => {
    this.set(key, {
      ...this.get(key),
      progress: progress,
    });
  }

  clearCompleted = () => this.uploads.forEach((v, k, map) => {
    if (v.complete) {
      map.delete(k);
    }
  })

  setComplete = k => {
    this.set(k, {
      ...this.get(k),
      complete: true,
    });
  }

  list = () => values(this.uploads);

}

const uploadsStore = new UploadsStore();
export default uploadsStore;

