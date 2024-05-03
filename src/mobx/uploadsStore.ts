import { makeAutoObservable, values } from 'mobx';
import * as FileSystem from "expo-file-system";

/*
the process is:
1) user chooses an inner phone file system URL
2) the app copies this URL content into a cache (takes some MBs)
3) user chooses the metadata e.g. video title, student etc
4) the app pre-encodes the cached (2) content into cache
5) the encoded data is being uploaded

(we are allowed to clean cache here) (1)-------(2)------(3)--------(4)--------(5)-------(END) (we are expected clear cache here)
                                     (1)-------(2)------(3)--------(4)--------(5)-------(END)
                                     (1)-------(2)------(3)--------(4)--------(5)-------(END)
                                     (1)-------(2)------(3)--------(4)--------(5)-------(END)
 */
// Map(localVideoUrl -> {stage: 1} | {stage: 2} | {stage: 3} | {stage: 4} | {stage: 5})

type FileSystemUploadFileState = {
  step: 'selected'
} | {
  step: 'inCache' // partially or completely
} | {
  step: 'encoding',
  encodedUrl: string
} | {
  step: 'encoded',
  encodedUrl: string
} | {
  step: 'uploading',
  encodedUrl: string
}
class UploadsStore {

  // they have a bit different url format and metadata format; TODO unify
  cameraUploads: Map<string, unknown>;
  fileSystemUploads: Map<string, FileSystemUploadFileState>;
  fileSystemUploadDoneCallbacks: Array<(localUrl: string, current: FileSystemUploadFileState) => void>;
  currentLocalFileUrl: string | null;

  uploads = new Map();

  constructor() {
    this.cameraUploads = new Map();
    this.fileSystemUploads = new Map();
    this.fileSystemUploadDoneCallbacks = [];
    this.currentLocalFileUrl = null;
    makeAutoObservable(this)
  }

  // TODO there's a parallel state machine in uploads: older version; TODO unify
  videoFileSelected = (localFileUrl: string) => {
    const current = this.fileSystemUploads.get(localFileUrl);
    if (current) throw new Error(`file ${localFileUrl} already being handled by UploadsStore`);
    this.currentLocalFileUrl = localFileUrl;
    this.fileSystemUploads.set(localFileUrl, {
      step: 'selected',
    });
  };

  // started to be added or completely added - assume we don't care here, as long as ANY space is already taken
  videoFileAddedToCache = (localFileUrl: string) => {
    const current = this.fileSystemUploads.get(localFileUrl);
    if (!current || current.step !== 'selected') throw new Error(`file ${localFileUrl} in invalid state for adding to cache: ${current?.step}`);
    this.fileSystemUploads.set(localFileUrl, {
      step: 'inCache',
    });
  };

  videoFileStartedEncoding = (localFileUrl: string, localFileCompressedUrl: string) => {
    const current = this.fileSystemUploads.get(localFileUrl);
    if (!current || current.step !== 'inCache') throw new Error(`file ${localFileUrl} in invalid state for encoding: ${current?.step}`);
    this.fileSystemUploads.set(localFileUrl, {
      step: 'encoding',
      encodedUrl: localFileCompressedUrl,
    });
  };

  videoFileEncoded = (localFileUrl: string) => {
    const current = this.fileSystemUploads.get(localFileUrl);
    if (!current || current.step !== 'encoding') throw new Error(`file ${localFileUrl} in invalid state for encoded: ${current?.step}`);
    this.fileSystemUploads.set(localFileUrl, {
      step: 'encoded',
      encodedUrl: current.encodedUrl,
    });
  };

  videoFileStartedUpload = (localFileUrl: string) => {
    const current = this.fileSystemUploads.get(localFileUrl);
    if (!current || current.step !== 'encoded') throw new Error(`file ${localFileUrl} in invalid state for uploading: ${current?.step}`);
    this.fileSystemUploads.set(localFileUrl, {
      step: 'uploading',
      encodedUrl: current.encodedUrl
    });
  };

  videoFileUploaded = (localFileUrl: string) => {
    const current = this.fileSystemUploads.get(localFileUrl);
    if (!current || current.step !== 'uploading') throw new Error(`file ${localFileUrl} in invalid state for END: ${current?.step}`);
    // clear cache
    this.fileSystemUploads.delete(localFileUrl);
    this.currentLocalFileUrl = null;
    this.fileSystemUploadDoneCallbacks.forEach(cb => cb(localFileUrl, current));

  };

  cancelCurrentUpload = () => {
    if (this.currentLocalFileUrl) this.cancelUpload(this.currentLocalFileUrl);
  }

  cancelUpload = (localFileUrl: string) => {
    const current = this.fileSystemUploads.get(localFileUrl);
    if (!current) return;
    this.fileSystemUploads.delete(localFileUrl);
    this.fileSystemUploadDoneCallbacks.forEach(cb => cb(localFileUrl, current));
    if (this.currentLocalFileUrl === localFileUrl) {
      this.currentLocalFileUrl = null;
    }
  };
  // callbacks
  addVideoFileDoneCallback = (cb: (localFileUrl: string, current: FileSystemUploadFileState) => void) => {
    this.fileSystemUploadDoneCallbacks.push(cb);
    return () => {
      this.fileSystemUploadDoneCallbacks = this.fileSystemUploadDoneCallbacks.filter(cb_ => cb !== cb_);
    }
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

uploadsStore.addVideoFileDoneCallback((localVideoUri: string, currentValue: FileSystemUploadFileState) => {
  FileSystem.deleteAsync(localVideoUri).then(() => 'deleted!');
  if ((currentValue as any).encodedUrl) {
    FileSystem.deleteAsync((currentValue as any).encodedUrl).then(() => 'encoded deleted!');
  }
});

