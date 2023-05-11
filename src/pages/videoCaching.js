import React, { useEffect } from 'react';
import { Text, View, ActivityIndicator, StyleSheet, Platform, Alert } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import Meteor from '@meteorrn/core';
import get from 'lodash/get';
import { accountType, childrenIds, TEACHER, STUDENT } from "../lib/utils";
import { useKeepAwake } from 'expo-keep-awake';
import { observer } from "mobx-react";
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
        navigation.popToTop();
        throw 'nonLandscapeVideo';
      }

      //ProcessingManager.getVideoInfo(result.uri) for ios

      if (uploadedVideoInfo.height > uploadedVideoInfo.width) {
        nonLandscapeAlert();
        navigation.popToTop();
        throw 'nonLandscapeVideo';
      }

      createPath(navigation, uploadedVideoInfo.uri, user);
    }
    // const uploadVideo = async () => {
    //   // uploadedVideoInfo && Promise.resolve(uploadedVideoInfo)
    //   //   .then(result => {console.log(result); return result})
    //   //   .then(result => {
    //   //     if (isAndroid && result.rotation % rotationModulus !== 0) {
    //   //       nonLandscapeAlert();
    //   //       navigation.popToTop();
    //   //       throw 'nonLandscapeVideo';
    //   //     }
    //   //     return result;
    //     }).then(result => {
    //       return result // if ios - was ProcessingManager.getVideoInfo(result.uri)
    //         .then((res) => {
    //           console.log("promise4")
    //           if(res.height > res.width) {
    //             nonLandscapeAlert();
    //             navigation.popToTop();
    //             throw 'nonLandscapeVideo';
    //           }
    //           return res.uri;
    //         });
    //     }).then(videoUri => createPath(navigation, videoUri, user));
    //
    //
    // }

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


// class CachingVideo extends Component {

  // componentWillReceiveProps(next) {
  //   if(!this.props.isFocused && next.isFocused) {
  //     activateKeepAwakeAsync();
  //   }
  //   if(this.props.isFocused && !next.isFocused) {
  //     deactivateKeepAwake();
  //   }
  // }

  // async componentDidMount() {
  //   const user = Meteor.user();
  //   const uriPromise = get(this.props, ['navigation', 'state', 'params', 'videoUri']);
  //   const videoForSaveUri = get(this.props, ['navigation', 'state', 'params', 'videoForSaveUri']);
  //   uriPromise && uriPromise.then(result => {
  //     if (result.canceled) {
  //       this.props.navigation.popToTop();
  //       throw 'Result.canceled';
  //     }
  //     return result;
  //   }).then(result => {console.log(result); return result})
  //     .then(result => {
  //       if (isAndroid && result.rotation % rotationModulus !== 0) {
  //         nonLandscapeAlert();
  //         this.props.navigation.popToTop();
  //         throw 'nonLandscapeVideo';
  //       }
  //       return result;
  //     })
  //     .then(result => {
  //       return result.uri
  //         .then(({ size }) => {
  //           if(size.height > size.width) {
  //             nonLandscapeAlert();
  //             this.props.navigation.popToTop();
  //             throw 'nonLandscapeVideo';
  //           }
  //           return result.uri;
  //       });
  //
  //   }).then(videoUri => createPath(this.props.navigation, videoUri, user));
  //
  //   videoForSaveUri && CameraRoll.saveToCameraRoll(videoForSaveUri, 'video').then(() =>
  //     {
  //       console.log('saving complete');
  //       createPath(this.props.navigation, videoForSaveUri, user);
  //     }
  //   );
  //
  // }

  // render() {
  //   return <View style={styles.container}>
  //     <ActivityIndicator size='large' />
  //     <Text>Video processing...</Text>
  //   </View>;
  // }
// }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default CachingVideo;