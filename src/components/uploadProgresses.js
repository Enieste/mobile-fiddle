import React, { useEffect } from 'react';
import { View, FlatList, ProgressBarAndroid, ProgressViewIOS, Text, StyleSheet, Platform } from 'react-native';
import Meteor, { useTracker } from '@meteorrn/core';
import { observer } from 'mobx-react';
import { autorun } from 'mobx';
import get from 'lodash/get';
import { useKeepAwake } from 'expo-keep-awake';
import uploadsStore from '../mobx/uploadsStore';
import { fontColor, iconFont } from '../colorSets';
import { studentNamesToString, isTeacher, isIndependent, userName } from '../lib/utils';
import UploadComplete from '../components/icons/uploadComplete';
import { useIsFocused } from '@react-navigation/native';

const getFilename = upload => upload.filename;

const isComplete  = upload => upload.complete;

const isCompressing = upload => upload.compressing;

const UploadsView = () => {
  const isFocused = useIsFocused();
  const { user, students } = useTracker(() => {
    const user = Meteor.user();
    const studentsSub = isTeacher(user) ? Meteor.subscribe('MyStudents') : Meteor.subscribe('Children');
    return {
      user,
      students: studentsSub.ready() && Meteor.collection('users').find({ 'profile.accountType': 'student' }),
    };
  });

  useEffect(() => {
    if (!isFocused) uploadsStore.clearCompleted();
  }, [isFocused]);

  const composeUploadText = (item) => {
    const studentsIds = item.studentIds;
    const studentNames = studentsIds.map(id => get(students
      .find(student => get(student, '_id') === id), ['profile', 'firstName']));
    return `${isIndependent(user) ? userName(user) : studentNamesToString(studentNames)} playing ${item.title}`;
  }

// https://github.com/oblador/react-native-image-progress TODO change
  const progressBarRender = (progress) => {
    return Platform.select({
      ios: () => <ProgressViewIOS
        progress={progress}
        progressViewStyle='bar'
        trackTintColor="#C1C1C1"
        progressTintColor={iconFont}
        style={styles.iosMargin}
      />,
      android: () => <ProgressBarAndroid
        progress={progress}
        styleAttr='Horizontal'
        indeterminate={false}
      />,
    })();
  }

  const uploadRender = (item) => {
    const complete = isComplete(item);
    const compressing = isCompressing(item);
    return <View style={styles.upload}>
      <View style={styles.textContainer}>
        { complete && <View style={styles.icon}>
          <UploadComplete />
        </View> }
        <Text>{composeUploadText(item)}</Text>
      </View>
      { !complete && !compressing && progressBarRender(item.progress) }
      { compressing && <Text>Compressing...</Text> }
    </View>
  }

  const { uploads } = this.props;

  return students ? <FlatList
    style={{ width: '100%'}}
    data={uploads}
    renderItem={({ item }) => uploadRender(item)}
    keyExtractor={getFilename}
  /> : <View />

}

const UploadProgresses = observer(() => {
  useKeepAwake();
  const uploads = uploadsStore.list();
  return <View style={styles.container}>
    { uploads.length ?
      <UploadsView uploads={uploads} key='container' />
      : <View style={styles.placeholderContainer}>
        <Text style={styles.text}>
          Your queue is empty.{"\n"}All your videos have been uploaded!
        </Text>
      </View>}
  </View>;
})

const styles = StyleSheet.create({
  container: {
    flex: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: 20,
  },
  upload: {
    flex: 0,
    width: '100%',
  },
  textContainer: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
  },
  iosMargin: {
    marginTop: 10,
  },
  placeholderContainer : {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  text: {
    fontSize: 16,
    color: fontColor,
    textAlign: 'center',
    lineHeight: 25,
  },
  icon: {
    aspectRatio: 1,
    height: 30,
    marginRight: 10,
  },
});

export default UploadProgresses;