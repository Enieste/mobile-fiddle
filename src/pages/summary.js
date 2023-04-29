import React, { PureComponent } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView } from 'react-native';
import Meteor, { withTracker } from '@meteorrn/core';
import { withNavigationFocus } from '@react-navigation/compat';
import get from 'lodash/get';
import { getId, studentNamesToString, isTeacher, isIndependent, userName, getTeacherId } from '../lib/utils';
import uploadItem from '../lib/upload';
import { backgroundMain } from '../colorSets';

const BlueUploadIcon = Platform.select({
  ios: () => require('../components/icons/blueIosUploadIcon').default,
  android: () => require('../components/icons/blueUploadAndroid').default,
})();

class Summary extends PureComponent {
  state = {
    clicked: false,
  };

  componentWillReceiveProps = next => {
    if(!this.props.isFocused && next.isFocused) {
      this.setState({
        clicked: false,
      });
    }
  }

  confirmUpload = () => {
    const { user } = this.props;
    if (!this.props.isFocused) return; // it may be a rogue callback from previous screen if clicked again quickly
    this.setState({
      clicked: true,
    });
    const localVideoUri = get(this.props, ['navigation', 'state', 'params', 'videoUri']);
    const studentIds = get(this.props, ['navigation', 'state', 'params', 'studentIds']);
    const title = get(this.props, ['navigation', 'state', 'params', 'title']);
    const practiceItemId = get(this.props, ['navigation', 'state', 'params', 'practiceItemId']);
    const teacherId = isTeacher(user) ? getId(user) : (isIndependent(user) ?
      getTeacherId(user) : studentIds.map(id => getTeacherId(this.props.students
        .find(student => get(student, '_id') === id))).filter(Boolean)[0]);
    const description = get(this.props, ['navigation', 'state', 'params', 'description']);
    const notesForTeacher = get(this.props, ['navigation', 'state', 'params', 'notesForTeacher']);
    const isForPosting = get(this.props, ['navigation', 'state', 'params', 'isForPosting']);
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
    this.props.navigation.popToTop();
  };

  composeText = () => {
    const { user } = this.props;
    const title = get(this.props, ['navigation', 'state', 'params', 'title']);
    const studentsIds = get(this.props, ['navigation', 'state', 'params', 'studentIds']);
    const category = get(this.props, ['navigation', 'state', 'params', 'category']);
    const description = get(this.props, ['navigation', 'state', 'params', 'description']);
    const notesForTeacher = get(this.props, ['navigation', 'state', 'params', 'notesForTeacher']);
    const studentNames = studentsIds.map(id => get(this.props.students
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

  render() {
    const title = get(this.props, ['navigation', 'state', 'params', 'title']);
    const studentsIds = get(this.props, ['navigation', 'state', 'params', 'studentIds']);
    const localVideoUri = get(this.props, ['navigation', 'state', 'params', 'videoUri']);
    return <View style={styles.page}>
      { this.props.ready && this.props.students && title && studentsIds && localVideoUri &&
      <View style={styles.modal}>
        {this.composeText()}
      </View>}
      { this.props.ready &&
        <View style={styles.iconContainer}>
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={this.confirmUpload}
            disabled={!this.props.students && !title && !localVideoUri || this.state.clicked}
          >
            <BlueUploadIcon />
          </TouchableOpacity>
        </View> }
    </View>
  }
}

// Size is important here. Smaller icons doesn't work with iphone 6 and 7. So we scale them in svg. Even 5% smaller broke TouchableOpacity.

const summaryContainer = withTracker(params => {
  const user = Meteor.user();
  const studentsSub = Meteor.subscribe(isTeacher(user) ? 'MyStudents' : 'Children');
  return {
    user,
    students: studentsSub.ready() && Meteor.collection('users').find({ 'profile.accountType': 'student' }),
    ready: studentsSub.ready(),
  };
})(Summary);

export default withNavigationFocus(summaryContainer);

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
