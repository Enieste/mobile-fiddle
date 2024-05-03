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
import UploadsStore from "../mobx/uploadsStore";
import uploadsStore from "../mobx/uploadsStore";

const compressVideo = async (inputPath, newFileName) => {
    console.log("inputPath", inputPath)
  const session = await FFprobeKit.getMediaInformation(inputPath);
  const videoInfo = session.getMediaInformation();
  const width = videoInfo.getStreams()[0].getWidth();
  const height = videoInfo.getStreams()[0].getHeight();
  const filePath = inputPath.substring(0, inputPath.lastIndexOf("/")) + "/";
  //const videoExtension = inputPath.substring(inputPath.lastIndexOf('.') + 1)

  // Calculate the desired width and height based on the aspect ratio
  const outputWidth = 960;
  const outputHeight = Math.floor((outputWidth / width) * height);

  // Set the minimum bitrate
  const outputPath = `${filePath}${newFileName}.mp4`;
  const trimCommand = `-ss 00:00:00.080` // start time for ios for decent thumbnails

  const ffmpegCMD = `-y -i ${inputPath} -color_trc 6 -color_primaries 5 -color_range 1 -vcodec libx264 ${isAndroid ? "" : trimCommand} -pix_fmt yuv420p -level 5.1 -preset ultrafast -c:a aac -b:a 128k -vf "scale=${outputWidth}:${outputHeight}" ${outputPath}`;
    uploadsStore.videoFileAddedToCache(inputPath);
    uploadsStore.videoFileStartedEncoding(inputPath, outputPath);
  await FFmpegKit.execute(ffmpegCMD);
    uploadsStore.videoFileEncoded(inputPath);

  console.log('Video compression completed successfully!');
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

  const compressedVideoUri = await compressVideo(localVideoUri, newFileName);
  // TODO remove
  uploadStore.compressComplete(newFileName);
  const trimmedDescription = description ? description.trim() : null;
  const trimmedNotes = notesForTeacher ? notesForTeacher.trim() : null;
  uploadsStore.videoFileStartedUpload(localVideoUri);
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
            uploadsStore.videoFileUploaded(localVideoUri);
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
