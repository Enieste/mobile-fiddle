import React, { PureComponent, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView } from 'react-native';
import Meteor, { Mongo, useTracker, withTracker } from '@meteorrn/core';
import { StackActions } from '@react-navigation/compat';
import get from 'lodash/get';
import {
  getId,
  studentNamesToString,
  isTeacher,
  isIndependent,
  userName,
  getTeacherId,
  useRouteProps
} from '../lib/utils';
import uploadItem from '../lib/upload';
import { backgroundMain } from '../colorSets';
import { useIsFocused, useNavigation, useRoute } from "@react-navigation/native";

const BlueUploadIcon = Platform.select({
  ios: () => require('../components/icons/blueIosUploadIcon').default,
  android: () => require('../components/icons/blueUploadAndroid').default,
})();

const Summary = () => {
  const [clicked, setClicked] = useState();

  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const {
    title,
    studentIds,
    description,
    category,
    notesForTeacher,
    localVideoUri,
    practiceItemId,
    isForPosting
  } = useRouteProps();

  const { user, students, ready } = useTracker(() => {
    const user = Meteor.user();
    const studentsSub = Meteor.subscribe(isTeacher(user) ? 'MyStudents' : 'Children');
    return {
      user,
      students: studentsSub.ready() && new Mongo.Collection('users').find({ 'profile.accountType': 'student' }).fetch(),
      ready: studentsSub.ready(),
    };
  });

  // if(!this.props.isFocused && next.isFocused) {
  //   this.setState({
  //     clicked: false,
  //   });
  // } TODO

  const confirmUpload = () => {
    if (!isFocused) return; // it may be a rogue callback from previous screen if clicked again quickly
    setClicked(true);
    const teacherId = isTeacher(user) ? getId(user) : (isIndependent(user) ?
      getTeacherId(user) : studentIds.map(id => getTeacherId(students
        .find(student => get(student, '_id') === id))).filter(Boolean)[0]);
    const uploadedByNonTeacher = !isTeacher(user);
    uploadItem({
      teacherId: teacherId ? teacherId : 'DEFAULT',
      studentIds,
      localVideoUri,
      title,
      practiceItemId,
      isForPosting,
      description,
      notesForTeacher,
      uploadedByNonTeacher
    });
    navigation.dispatch(StackActions.popToTop());
  };

  const composeText = () => {
    const studentNames = studentIds.map(id => get(students
      .find(student => get(student, '_id') === id), ['profile', 'firstName']));
    const isSkill = category.secton === 'Skills';
    return (<ScrollView bounces={false} contentContainerStyle={styles.textContainer}>
      <View style={styles.textContainer}>
        <Text style={[styles.text, styles.bold]}>{isIndependent(user) ? userName(user) : studentNamesToString(studentNames)}</Text>
        <Text style={styles.text}>{`playing${isSkill ? ' ' + category.title + ' Skill' : ''}`}</Text>
        <Text style={[styles.text, styles.bold]}>{title}</Text>
        {!!description && <Text style={styles.text}>"{description}"</Text>}
        {!!notesForTeacher && <Text style={[styles.text, styles.bold]}>Only for teacher:</Text>}
        {!!notesForTeacher && <Text style={styles.text}>"{notesForTeacher}"</Text>}
      </View>
    </ScrollView>);
  };

  return <View style={styles.page}>
    { ready && students && title && studentIds && localVideoUri &&
    <View style={styles.modal}>
      {composeText()}
    </View>}
    { ready &&
    <View style={styles.iconContainer}>
      <TouchableOpacity
        style={styles.buttonContainer}
        onPress={confirmUpload}
        disabled={!students && !title && !localVideoUri || clicked}
      >
        <BlueUploadIcon />
      </TouchableOpacity>
    </View> }
  </View>
}

export default Summary;

const styles = StyleSheet.create({
  page: {
    height: '100%',
    width: '100%',
    backgroundColor: '#767676',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
    paddingHorizontal: '15%'
  },
  scrollView: {
    flex: 0,
  },
  modal: {
    flex: 0,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: backgroundMain,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    padding: 20,
    paddingBottom: 10,
  },
  textContainer: {
    flex: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10
  },
  text: {
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
  },
  bold: {
    fontWeight: 'bold',
  },
  iconContainer: {
    flex: 0,
    width: '100%',
    height: '20%',
    backgroundColor: backgroundMain,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    paddingBottom: 10,
  },
  buttonContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0,
    width: '75%',
    aspectRatio: 1,
  },
});
