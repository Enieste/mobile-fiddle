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
  encodedUrl: string,
  progress: number
} | {
  step: 'completed'
}

export const isCompressing = (s: FileSystemUploadFileState): s is typeof s & ({
  step: 'inCache'
} | {
  step: 'encoding',
}) =>
    ['inCache', 'encoding'].indexOf(s.step) !== -1;

export const isCompleted = (s: FileSystemUploadFileState): s is typeof s & {
  step: 'completed'
} => s.step === 'completed';

export const isUploading = (s: FileSystemUploadFileState): s is typeof s & {
  step: 'uploading'
} => s.step === 'uploading';

type VideoFileData = {
  teacherId: number,
  studentIds: Array<number>
  filename: string,
  title: string,
  practiceItemId: number,
  newFileName: string
}
class UploadsStore {

  // they have a bit different url format and metadata format; TODO unify
  videoFilesUploads: Map<string, FileSystemUploadFileState>;
  videoFilesUploadDoneCallbacks: Array<(localUrl: string, current: FileSystemUploadFileState) => void>;
  currentLocalFileUrl: string | null;
  uploadsData: Map<string, VideoFileData>

  constructor() {
    this.videoFilesUploads = new Map();
    this.videoFilesUploadDoneCallbacks = [];
    this.currentLocalFileUrl = null;
    this.uploadsData = new Map();
    makeAutoObservable(this)
  }
  videoFileSelected = (localFileUrl: string) => {
    const current = this.videoFilesUploads.get(localFileUrl);
    if (current) throw new Error(`file ${localFileUrl} already being handled by UploadsStore`);
    this.currentLocalFileUrl = localFileUrl;
    this.videoFilesUploads.set(localFileUrl, {
      step: 'selected',
    });
  };

  // started to be added or completely added - assume we don't care here, as long as ANY space is already taken
  videoFileAddedToCache = (localFileUrl: string) => {
    const current = this.videoFilesUploads.get(localFileUrl);
    if (!current || current.step !== 'selected') throw new Error(`file ${localFileUrl} in invalid state for adding to cache: ${current?.step}`);
    this.videoFilesUploads.set(localFileUrl, {
      step: 'inCache',
    });
  };

  videoFileStartedEncoding = (localFileUrl: string, localFileCompressedUrl: string) => {
    const current = this.videoFilesUploads.get(localFileUrl);
    if (!current || current.step !== 'inCache') throw new Error(`file ${localFileUrl} in invalid state for encoding: ${current?.step}`);
    this.videoFilesUploads.set(localFileUrl, {
      step: 'encoding',
      encodedUrl: localFileCompressedUrl,
    });
  };

  videoFileEncoded = (localFileUrl: string) => {
    const current = this.videoFilesUploads.get(localFileUrl);
    if (!current || current.step !== 'encoding') throw new Error(`file ${localFileUrl} in invalid state for encoded: ${current?.step}`);
    this.videoFilesUploads.set(localFileUrl, {
      step: 'encoded',
      encodedUrl: current.encodedUrl,
    });
  };

  videoFileStartedUpload = (localFileUrl: string) => {
    const current = this.videoFilesUploads.get(localFileUrl);
    if (!current || current.step !== 'encoded') throw new Error(`file ${localFileUrl} in invalid state for uploading: ${current?.step}`);
    this.videoFilesUploads.set(localFileUrl, {
      step: 'uploading',
      encodedUrl: current.encodedUrl,
      progress: 0
    });
  };

  videoFileUploaded = (localFileUrl: string) => {
    const current = this.videoFilesUploads.get(localFileUrl);
    if (!current || current.step !== 'uploading') throw new Error(`file ${localFileUrl} in invalid state for END: ${current?.step}`);
    // clear cache
    this.videoFilesUploads.set(localFileUrl, {
      step: 'completed'
    });
    this.currentLocalFileUrl = null;
    this.videoFilesUploadDoneCallbacks.forEach(cb => cb(localFileUrl, current));
  };

  clearCompleted = () => {
    [...this.videoFilesUploads.entries()].forEach(([k, v]) => {
      if (v.step === 'completed') {
        this.videoFilesUploads.delete(k);
      }
    });
  }

  cancelCurrentUpload = () => {
    if (this.currentLocalFileUrl) this.cancelUpload(this.currentLocalFileUrl);
  }

  cancelUpload = (localFileUrl: string) => {
    const current = this.videoFilesUploads.get(localFileUrl);
    if (!current) return;
    this.videoFilesUploads.delete(localFileUrl);
    this.videoFilesUploadDoneCallbacks.forEach(cb => cb(localFileUrl, current));
    if (this.currentLocalFileUrl === localFileUrl) {
      this.currentLocalFileUrl = null;
    }
  };
  // callbacks
  addVideoFileDoneCallback = (cb: (localFileUrl: string, current: FileSystemUploadFileState) => void) => {
    this.videoFilesUploadDoneCallbacks.push(cb);
    return () => {
      this.videoFilesUploadDoneCallbacks = this.videoFilesUploadDoneCallbacks.filter(cb_ => cb !== cb_);
    }
  }

  //_______________________

  setVideoFileData = (k: string, v: VideoFileData) => this.uploadsData.set(k, v);

  progress = (key: string, progress: number) => {
    const v = this.videoFilesUploads.get(key);
    if (v === undefined) throw new Error(`panic! progress called on inexistent state, k: ${key}`);
    if (v.step !== 'uploading') throw new Error(`panic! progress happened for a wrong step of k: ${key} : ${v.step}`);

    this.videoFilesUploads.set(key, {
      ...v,
      progress: progress,
    });
  }

  list = () => [...this.videoFilesUploads.entries()];

}

const uploadsStore = new UploadsStore();
export default uploadsStore;

uploadsStore.addVideoFileDoneCallback((localVideoUri: string, currentValue: FileSystemUploadFileState) => {
  FileSystem.deleteAsync(localVideoUri).then(() => 'deleted!');
  if ((currentValue as any).encodedUrl) {
    FileSystem.deleteAsync((currentValue as any).encodedUrl).then(() => 'encoded deleted!');
  }
});

