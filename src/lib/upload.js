import Meteor from 'react-native-meteor';
import { Platform } from "react-native";
import { ProcessingManager } from 'react-native-video-processing';
import * as FileSystem from 'expo-file-system';
import last from 'lodash/last';
import first from 'lodash/first';
import { sendFile } from '../lib/aws';
import uploadStore from '../mobx/uploadsStore';

const RNGRP = require('react-native-get-real-path');

const isAndroid = Platform.OS === 'android';

const androidCompressOptions = {
  width: 960,
  height: 540,
  bitrateMultiplier: 30,
  minimumBitrate: 5000,
};

const iosCompressOptions = {
  width: 960,
  height: 540,
  bitrateMultiplier: 1,
  minimumBitrate: 5000,
};

const trimOptions = {
  startTime: 0.08, // to make better thumbnails (some iPhones make black screen on first ms and then AWS takes it for thumbnails), minimum 0.04
};

const getAndroidVideoUri = (localVideoUri) => {
  return RNGRP.getRealPathFromURI(localVideoUri); // Promise
};

const compressVideo = (videoUri, filename) => {
  return ProcessingManager.compress(videoUri, isAndroid ? androidCompressOptions : iosCompressOptions)
    .then((data) => {
      uploadStore.compressComplete(filename);
      return isAndroid ? data.source : data
    }, (err) => console.log(err));
};

const trimIosVideo = videoUri => {
  return ProcessingManager.trim(videoUri, trimOptions);
};

export default async ({
                        teacherId,
                        studentIds,
                        localVideoUri,
                        title, practiceItemId,
                        uploadedByNonTeacher,
                        isForPosting,
                        description,
                        notesForTeacher,
                      }) => {

  const filename = last(localVideoUri.split('/'));

  const videoUri = await (isAndroid ? getAndroidVideoUri(localVideoUri) : Promise.resolve(localVideoUri));
  uploadStore.set(filename, {
    teacherId,
    studentIds,
    filename,
    title,
    practiceItemId,
    progress: 0,
    compressing: true,
  });
  const maybeTrimmedVideoUri = isAndroid ? videoUri : await trimIosVideo(videoUri);
  const compressedVideoUri = await compressVideo(maybeTrimmedVideoUri, filename);
  const trimmedDescription = description ? description.trim() : null;
  const trimmedNotes = notesForTeacher ? notesForTeacher.trim() : null;
  
  Meteor.call('getStudentVideoS3UploadPermission',
    { teacherId, filename },
    (err, signResult) => {
      if (err) console.warn(err);
      const { signedUrl } = signResult;
      sendFile(
        signedUrl,
        { uri: compressedVideoUri, type: 'video/mp4' },
        (s3Result) => {
          console.log('success', s3Result);
          Meteor.call('putS3StudentVideo', {
            title,
            studentIds,
            teacherId,
            practiceItemId,
            uploadedByNonTeacher,
            isForPosting,
            description: trimmedDescription,
            notesForTeacher: trimmedNotes,
            url: first(signedUrl.split('?')),
          }, () => {
            uploadStore.setComplete(filename);
            FileSystem.deleteAsync(localVideoUri).then(() => 'deleted!');
          });
        },
        (err) => console.log('err', err), // TODO handle
        (loaded, total) => {
          uploadStore.progress(filename, loaded / total);
        }
      )
    }
  )
};
