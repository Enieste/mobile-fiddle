import Meteor from '@meteorrn/core';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import last from 'lodash/last';
import first from 'lodash/first';
import { sendFile } from './aws';
import uploadStore from '../mobx/uploadsStore';
import { v4 } from "uuid";

// const getVideoParams = async (inputPath) => {
//   console.log("inputfromparams", inputPath);
//   try {
//     const session = await FFprobeKit.getMediaInformation(inputPath);
//     const videoInfo = session.getMediaInformation();
//     const width = videoInfo.getStreams()[0].getWidth();
//     const height = videoInfo.getStreams()[0].getHeight();
//     return { width, height };
//   } catch (error) {
//     console.error("Failed to get video params", error);
//   }
// }

const isAndroid = Platform.OS === 'android';
// const androidURI = (uri) => FileSystem.getContentUriAsync(uri);
import { FFprobeKit, FFmpegKit } from 'ffmpeg-kit-react-native';

const compressVideo = async (inputPath) => {
  try {
    const session = await FFprobeKit.getMediaInformation(inputPath);
    const videoInfo = session.getMediaInformation();
    const width = videoInfo.getStreams()[0].getWidth();
    const height = videoInfo.getStreams()[0].getHeight();
    // Get the video's original width and height
    // const { width, height } = getVideoParams(inputPath);
    const filePath = inputPath.substring(0, inputPath.lastIndexOf("/")) + "/";
    console.log("filepath", filePath)

    // Calculate the desired width and height based on the aspect ratio
    const outputWidth = 960;
    const outputHeight = Math.floor((outputWidth / width) * height);

    // Set the minimum bitrate
    const minBitrate = 5000;
    const outputPath = `${filePath}${v4()}.mp4`;

    // Build the ffmpeg command based on the platform
    let ffmpegCommand;
    if (Platform.OS === 'android') {
      // For Android, use the provided ffmpeg binary in the react-native-ffmpeg library
      ffmpegCommand = `-i ${inputPath} -vf "scale=${outputWidth}:${outputHeight}" -b:v ${minBitrate}k ${outputPath}`;
    } else if (Platform.OS === 'ios') {
      // For iOS, use the system-installed ffmpeg (if available) or the provided ffmpeg binary
      ffmpegCommand = `-i ${inputPath} -vf "scale=${outputWidth}:${outputHeight}" -b:v ${minBitrate}k -c:v libx264 -c:a aac ${outputPath}`;
    }

    const testCMD = `-hwaccel auto -threads 6 -y -i ${inputPath} -c:v copy -b:v ${minBitrate}k -preset ultrafast -pix_fmt yuv420p -crf 28 ${outputPath}`
    const testCMD0 = `-hwaccel auto -threads 6 -y -i ${inputPath} -c:v copy -b:v ${minBitrate}k -pix_fmt yuv420p -crf 28 ${outputPath}`
    const testCMD2 = `-y -i ${inputPath} -c:v libx264 -minrate 5000 -r 30 -vf "scale=${outputWidth}:${outputHeight}" ${outputPath}`
    const easiestCMD = `-i ${inputPath} -c:v mpeg4 ${outputPath}`
    console.log('command', easiestCMD);

    // Run the ffmpeg command
    await FFmpegKit.execute(testCMD2);
    uploadStore.compressComplete(testCMD2);
    console.log('Video compression completed successfully!');
    return outputPath;
  } catch (error) {
    console.error('Error compressing video:', error);
  }
};

// const androidCompressOptions = {
//   width: 960,
//   height: 540,
//   bitrateMultiplier: 30, // divide video's bitrate to this value
//   minimumBitrate: 5000,
// };
//
// const iosCompressOptions = {
//   width: 960,
//   height: 540,
//   bitrateMultiplier: 1,
//   minimumBitrate: 5000,
// };
//

// const getAndroidVideoUri = (localVideoUri) => {
//   return RNGRP.getRealPathFromURI(localVideoUri); // Promise
// };

// const compressVideo = (videoUri, filename) => {
//   return ProcessingManager.compress(videoUri, isAndroid ? androidCompressOptions : iosCompressOptions)
//     .then((data) => {
//       uploadStore.compressComplete(filename);
//       return isAndroid ? data.source : data
//     }, (err) => console.log(err));
// };

// const trimIosVideo = videoUri => {
//   return ProcessingManager.trim(videoUri, trimOptions);
// };

const startTimeForIos = 0.08

const trimIosVideo = async(inputPath, filename) => {
  try {
    // Build the ffmpeg command to trim the video
    const ffmpegCommand = `-i ${inputPath} -ss ${startTimeForIos} -c:v copy -c:a copy ${filename}`;
    // Run the ffmpeg command
    await FFmpegKit.execute(ffmpegCommand);
    console.log('Video trimming completed successfully!');
  } catch (error) {
    console.error('Error trimming video:', error);
  }
}

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

  // const videoUri = await (isAndroid ? androidURI(localVideoUri) : Promise.resolve(localVideoUri));
  uploadStore.set(localVideoUri, {
    teacherId,
    studentIds,
    filename,
    title,
    practiceItemId,
    progress: 0,
    compressing: true,
  });
  const maybeTrimmedVideoUri = isAndroid ? localVideoUri : await trimIosVideo(localVideoUri, filename);
  console.log('maybeTrimmedVideoUri', maybeTrimmedVideoUri)
  const compressedVideoUri = await compressVideo(localVideoUri, filename);
  const trimmedDescription = description ? description.trim() : null;
  const trimmedNotes = notesForTeacher ? notesForTeacher.trim() : null;
  console.log("compressedVideoURL", compressedVideoUri)
  
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
