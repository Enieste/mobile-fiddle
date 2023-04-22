import React, { Component, PureComponent } from 'react';
import { View, FlatList, ProgressBarAndroid, ProgressViewIOS, Text, StyleSheet, Platform } from 'react-native';
import Meteor, { createContainer } from 'react-native-meteor';
import { observer } from 'mobx-react';
import { autorun } from 'mobx';
import get from 'lodash/get';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import uploadsStore from '../mobx/uploadsStore';
import { fontColor, iconFont } from '../colorSets';
import { studentNamesToString, isTeacher, isIndependent, userName } from '../lib/utils';
import UploadComplete from '../components/icons/uploadComplete';
import { withNavigationFocus } from 'react-navigation';

const isIos = Platform.OS === 'ios';

const getFilename = upload => upload.filename;

const isComplete  = upload => upload.complete;

const isCompressing = upload => upload.compressing;

class UploadsView extends PureComponent {

  componentWillReceiveProps = next => {
    if(this.props.isFocused && !next.isFocused) {
      uploadsStore.clearCompleted();
    }
  }

  composeUploadText = (item) => {
    const { user } = this.props;
    const studentsIds = item.studentIds;
    const studentNames = studentsIds.map(id => get(this.props.students
      .find(student => get(student, '_id') === id), ['profile', 'firstName']));
    return `${isIndependent(user) ? userName(user) : studentNamesToString(studentNames)} playing ${item.title}`;
  }

  progressBarRender = (progress) => {
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

  uploadRender = item => {
    const complete = isComplete(item);
    const compressing = isCompressing(item);
    return <View style={styles.upload}>
      <View style={styles.textContainer}>
        { complete && <View style={styles.icon}>
          <UploadComplete />
        </View> }
        <Text>{this.composeUploadText(item)}</Text>
      </View>
      { !complete && !compressing && this.progressBarRender(item.progress) }
      { compressing && <Text>Compressing...</Text> }
    </View>
  }

  render() {
    const { isFocused } = this.props;
    const { uploads } = this.props;
    return this.props.students ? <FlatList
      style={{ width: '100%'}}
      data={uploads}
      renderItem={({ item }) => this.uploadRender(item)}
      keyExtractor={getFilename}
      /> : <View />
  }
}

const UploadViewContainer = createContainer(params => {
  const user = Meteor.user();
  const studentsSub = isTeacher(user) ? Meteor.subscribe('MyStudents') : Meteor.subscribe('Children');
  return {
    user,
    students: studentsSub.ready() && Meteor.collection('users').find({ 'profile.accountType': 'student' }),
  };
}, UploadsView);


export default withNavigationFocus(observer(class UploadProgresses extends Component {

    componentWillReceiveProps = next => {
      if(!this.props.isFocused && next.isFocused) {
        activateKeepAwake();
      }
      if(this.props.isFocused && !next.isFocused) {
        deactivateKeepAwake();
      }
    }

    // componentDidMount() {
    //   this.disposeMobX = autorun(() => {
    //     const uploads = uploadsStore.list();
    //     if (uploads.length) {
    //       console.log('activeted', uploads.length, uploads)
    //       KeepAwake.activate();
    //     } else {
    //       console.log('deactiveted')
    //       KeepAwake.deactivate();
    //     }
    //   });
    // }
    //
    // componentWillUnmount() {
    //   this.disposeMobX();
    // }

    render() {
      const uploads = uploadsStore.list();
      return <View style={styles.container}>
        { uploads.length ?
          <UploadViewContainer uploads={uploads} isFocused={this.props.isFocused } key='container' />
          : <View style={styles.placeholderContainer}>
            <Text style={styles.text}>
              Your queue is empty.{"\n"}All your videos have been uploaded!
            </Text>
          </View>}
      </View>;
    }
  }
));

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