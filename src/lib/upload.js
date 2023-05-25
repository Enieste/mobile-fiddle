import Meteor from '@meteorrn/core';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import last from 'lodash/last';
import first from 'lodash/first';
import { sendFile } from './aws';
import uploadStore from '../mobx/uploadsStore';
import 'react-native-get-random-values';
import { v4 } from "uuid";

const isAndroid = Platform.OS === 'android';
import { FFprobeKit, FFmpegKit } from 'ffmpeg-kit-react-native';

const compressVideo = async (inputPath, newFileName) => {
  const session = await FFprobeKit.getMediaInformation(inputPath);
  const videoInfo = session.getMediaInformation();
  const width = videoInfo.getStreams()[0].getWidth();
  const height = videoInfo.getStreams()[0].getHeight();
  const filePath = inputPath.substring(0, inputPath.lastIndexOf("/")) + "/";

  // Calculate the desired width and height based on the aspect ratio
  const outputWidth = 960;
  const outputHeight = Math.floor((outputWidth / width) * height);

  // Set the minimum bitrate
  const minBitrate = 5000;
  const outputPath = `${filePath}${newFileName}.mp4`;
  const trimCommand = `-ss 00:00:00.080` // start time for ios for decent thumbnails

  // Build the ffmpeg command based on the platform
  // let ffmpegCommand;
  // if (Platform.OS === 'android') {
  //   // For Android, use the provided ffmpeg binary in the react-native-ffmpeg library
  //   ffmpegCommand = `-i ${inputPath} -vf "scale=${outputWidth}:${outputHeight}" -b:v ${minBitrate}k ${outputPath}`;
  // } else if (Platform.OS === 'ios') {
  //   // For iOS, use the system-installed ffmpeg (if available) or the provided ffmpeg binary
  //   ffmpegCommand = `-i ${inputPath} -vf "scale=${outputWidth}:${outputHeight}" -b:v ${minBitrate}k -c:v libx264 -c:a aac ${outputPath}`;
  // }

  //const testCMD02 = `-hwaccel auto -threads 6 -y -i ${inputPath} -c:v copy -b:v ${minBitrate}k -preset ultrafast -pix_fmt yuv420p -crf 28 ${outputPath}`
  // const testCMD0 = `-hwaccel auto -threads 6 -y -i ${inputPath} -c:v copy -b:v ${minBitrate}k -pix_fmt yuv420p -crf 28 ${outputPath}`
  const ffmpegCommand = `-y -i ${inputPath} ${!isAndroid && trimCommand} -c:v libx264 -minrate 5000 -r 30 -vf "scale=${outputWidth}:${outputHeight}" ${outputPath}`
  // Run the ffmpeg command
  await FFmpegKit.execute(ffmpegCommand);
  console.log('Video compression completed successfully!')  ;
  return outputPath;
};

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
  const newFileName = v4();
  uploadStore.set(newFileName, {
    teacherId,
    studentIds,
    filename,
    title,
    practiceItemId,
    progress: 0,
    compressing: true,
  });
  // const maybeTrimmedVideoUri = isAndroid ? localVideoUri : await trimIosVideo(localVideoUri, filename);
  // const maybeTrimmedVideoUri = await trimIosVideo(localVideoUri, filename);
  const compressedVideoUri = await compressVideo(localVideoUri, newFileName);
  uploadStore.compressComplete(newFileName);
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
            uploadStore.setComplete(newFileName);
            FileSystem.deleteAsync(localVideoUri).then(() => 'deleted!');
          });
        },
        (err) => console.log('err', err), // TODO handle
        (loaded, total) => {
          uploadStore.progress(newFileName, loaded / total);
        }
      )
    }
  )
};
