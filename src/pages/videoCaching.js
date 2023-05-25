import React, { useEffect } from 'react';
import { Text, View, ActivityIndicator, StyleSheet, Platform, Alert } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import Meteor from '@meteorrn/core';
import get from 'lodash/get';
import { accountType, childrenIds, TEACHER, STUDENT } from "../lib/utils";
import { useKeepAwake } from 'expo-keep-awake';
import { useNavigation, useRoute } from '@react-navigation/native';

import appStore from '../mobx/appStore';

const isAndroid = Platform.OS === 'android';

const isOnlyStudent = (user) => {
  const userType = accountType(user);
  const isOnly = userType !== TEACHER && getStudentId(user).length === 1;
  appStore.isOneStudent(isOnly);
  return isOnly;
};

const getStudentId = (user) => {
  const userType = accountType(user);
  return userType === STUDENT ? [get(user, ['_id'])] : childrenIds(user);
};

const createPath = (navigator, videoUri, user) => {
  return navigator.navigate(isOnlyStudent(user) ? 'CategorySelect': 'StudentSelect',
    { videoUri,
      ...isOnlyStudent(user) && { studentIds: getStudentId(user), onlyStudent: true }
    })
};

const rotationModulus = 180;

const nonLandscapeAlert = () => Alert.alert(
  'Please choose another video.',
  'Only videos shot in landscape mode can be uploaded to FiddleQuest.',
  [
    {text: 'OK'},
  ],
  { cancelable: true }
);

const CachingVideo = () => {
  const navigation = useNavigation();
  const route = useRoute();
  useKeepAwake();

  useEffect(() => {
    const user = Meteor.user();
    const uploadedVideoInfo = get(route, ['params', 'videoInfo']);
    console.log("uriPromise", uploadedVideoInfo)
    const videoForSaveUri = get(route, ['params', 'videoForSaveUri']);

    if (uploadedVideoInfo) {
      if (isAndroid && uploadedVideoInfo.rotation % rotationModulus !==0) {
        nonLandscapeAlert();
        navigation.canGoBack();
        // throw 'nonLandscapeVideo';
      }

      //ProcessingManager.getVideoInfo(result.uri) for ios

      if (uploadedVideoInfo.height > uploadedVideoInfo.width) {
        nonLandscapeAlert();
        navigation.canGoBack();
        // throw 'nonLandscapeVideo';
      }

      createPath(navigation, uploadedVideoInfo.uri, user);
    }

    videoForSaveUri && MediaLibrary.saveToLibraryAsync(videoForSaveUri).then(() =>
      {
        console.log('saving complete');
        createPath(navigation, videoForSaveUri, user);
      }
    );

  }, [navigation])

  return (<View style={styles.container}>
    <ActivityIndicator size='large' />
    <Text>Video processing...</Text>
  </View>)
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default CachingVideo;