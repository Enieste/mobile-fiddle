import React, { Component } from 'react';
import { Text, View, ActivityIndicator, StyleSheet, Platform, Alert, CameraRoll } from 'react-native';
import Meteor from '@meteorrn/core';
import get from 'lodash/get';
import { accountType, childrenIds, TEACHER, STUDENT } from "../lib/utils";
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import { withNavigationFocus } from '@react-navigation/compat';

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

class CachingVideo extends Component {

  componentWillReceiveProps(next) {
    if(!this.props.isFocused && next.isFocused) {
      activateKeepAwake();
    }
    if(this.props.isFocused && !next.isFocused) {
      deactivateKeepAwake();
    }
  }

  async componentDidMount() {
    const user = Meteor.user();
    const uriPromise = get(this.props, ['navigation', 'state', 'params', 'videoUriPromise']);
    const videoForSaveUri = get(this.props, ['navigation', 'state', 'params', 'videoForSaveUri']);
    uriPromise && uriPromise.then(result => {
      if (result.cancelled) {
        this.props.navigation.popToTop();
        throw 'Result.cancelled';
      }
      return result;
    }).then(result => {console.log(result); return result})
      .then(result => {
        if (isAndroid && result.rotation % rotationModulus !== 0) {
          nonLandscapeAlert();
          this.props.navigation.popToTop();
          throw 'nonLandscapeVideo';
        }
        return result;
      })
      .then(result => {
        return result.uri
          .then(({ size }) => {
            if(size.height > size.width) {
              nonLandscapeAlert();
              this.props.navigation.popToTop();
              throw 'nonLandscapeVideo';
            }
            return result.uri;
        });

    }).then(videoUri => createPath(this.props.navigation, videoUri, user));

    videoForSaveUri && CameraRoll.saveToCameraRoll(videoForSaveUri, 'video').then(() =>
      {
        console.log('saving complete');
        createPath(this.props.navigation, videoForSaveUri, user);
      }
    );

  }

  render() {
    return <View style={styles.container}>
      <ActivityIndicator size='large' />
      <Text>Video processing...</Text>
    </View>;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default withNavigationFocus(CachingVideo);