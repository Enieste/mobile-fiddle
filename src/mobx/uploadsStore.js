import { makeAutoObservable, values } from 'mobx';

class UploadsStore {

  uploads = new Map();

  constructor() {
    makeAutoObservable(this)
  }

  set = (k, v) => this.uploads.set(k, v);

  get = k => this.uploads.get(k);

  compressComplete = (key) => {
    console.log('compressionComplete key!', key, this.get(key))
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

