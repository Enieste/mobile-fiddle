import React, { Component, PureComponent } from 'react';
import Meteor, { createContainer } from 'react-native-meteor';
import { observer } from 'mobx-react';
import { AndroidBackHandler } from 'react-navigation-backhandler';
import { View, StyleSheet, FlatList, TouchableOpacity, Text } from 'react-native';
import get from 'lodash/get';
import omit from 'lodash/omit';
import { getStudentName, listFilter, accountType, TEACHER } from '../lib/utils';
import { withNavigationFocus, HeaderBackButton, NavigationActions, StackActions } from 'react-navigation';
import appStore from '../mobx/appStore';
import SearchInput from '../components/searchField';
import StudentItem from '../components/studentItem';
import { backgroundMain } from '../colorSets';
import GroupIcon from '../components/icons/group';
import CheckIcon from '../components/icons/checkIcon';
import { getNavigatorRef } from '../entry';

const studentSelectObserver = observer(class StudentSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filter: '',
      selectedStudents: new Set(),
    }
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.isFocused && !nextProps.isFocused && appStore.get('groupSelect')) {
      appStore.unsetGroupValue();
      this.setState({
        selectedStudents: new Set(),
      });
    }
  }

  onBackButtonPressAndroid = () => {
    const isGroup = appStore.get('groupSelect');
    (isGroup ? appStore.unsetGroupValue : this.props.navigation.popToTop)();
    return true
  };

  navigateFurther = (idArray) => {
    const videoUri = get(this.props, ['navigation', 'state', 'params', 'videoUri']);
    this.props.navigation.navigate('CategorySelect', { videoUri, studentIds: idArray });
  };
  studentsFilter = (str) => {
    this.setState({
      filter: str,
    });
  };
  selectGroup = () => {
    this.navigateFurther(Array.from(this.state.selectedStudents));
  };
  addDeleteId = (id) => {
    const selectedStudents = new Set(this.state.selectedStudents);
    const isSelected = selectedStudents.has(id);
    if (isSelected) {
      selectedStudents.delete(id);
    } else {
      selectedStudents.add(id);
    }
    this.setState({
      selectedStudents,
    })
  };

  getId = item => get(item, '_id');

  modeHandler = () => {
    const isGroup = appStore.get('groupSelect');
    appStore.setGroupValue(!isGroup);
  };

  render() {
    const isGroup = appStore.get('groupSelect');
    const { selectedStudents } = this.state;
    const filteredStudents = this.props.students && listFilter(this.props.students, getStudentName, this.state.filter);
    return <AndroidBackHandler onBackPress={this.onBackButtonPressAndroid}>
      <View>
      { this.props.students ? <View style={styles.page}>
        <SearchInput
          onChange={this.studentsFilter}
          value={this.state.filter}
        />
        <FlatList
          style={styles.list}
          data={filteredStudents}
          renderItem={({ item }) => <StudentItem
              isGroup={isGroup}
              student={item}
              selectedStudents={selectedStudents}
              selectStudent={this.navigateFurther}
              onCheckBoxClick={this.addDeleteId}
            />
          }
          keyExtractor={this.getId}
        />
      </View> :
      <View style={styles.page}>
        <Text>{ this.props.dataReady ? 'You haven\'t got students yet' : 'Loading...' }</Text>
      </View> }
      <TouchableOpacity
        style={[styles.circle, selectedStudents.size ? styles.active : styles.opaque, !isGroup && styles.active]}
        onPress={isGroup && selectedStudents.size ? this.selectGroup : this.modeHandler}
      >
        { isGroup ? <View style={styles.containCheckIcon}>
          <CheckIcon />
        </View> : <View style={styles.containGroupIcon}>
         <GroupIcon />
        </View> }
      </TouchableOpacity>
      </View>
    </AndroidBackHandler>
  }
});

const studentSelectContainer = createContainer(params => {
  const user = Meteor.user();
  const userType = accountType(user);
  const sub = Meteor.subscribe(userType === TEACHER ? 'MyStudents' : 'Children');
  return {
    students: sub.ready() && Meteor.collection('users')
      .find({ 'profile.accountType': 'student' }, { sort: { 'profile.fullName': 1 } }),
    dataReady: sub.ready(),
  };
}, studentSelectObserver);

class BackButton extends PureComponent {
  onPress = () => {
    const isGroup = appStore.get('groupSelect');
    const goBack = () => getNavigatorRef().dispatch(StackActions.reset({ // this is react-navigation's dispatch
      index: 0,
      actions: [NavigationActions.navigate({routeName: 'Home'})],
    }));
    (isGroup ? appStore.unsetGroupValue : goBack)();
  };
  render() {
    return <HeaderBackButton
      {...omit(this.props, 'onPress')}
      onPress={this.onPress}
    />
  }
}

studentSelectContainer.navigationOptions = ({ navigation }) => {
  return {
    title: 'Select Student',
    headerLeft: BackButton,
    headerRight: (<View />)
  };
};

export default withNavigationFocus(studentSelectContainer);

const styles = StyleSheet.create({
  page: {
    height: '100%',
    width: '100%',
    backgroundColor: backgroundMain,
    padding: 10,
  },
  title: {
    padding: 10,
  },
  circle: {
    height: '10%',
    borderRadius: 100,
    flex: -1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: '5%',
    right: '5%',
    zIndex: 100,
    aspectRatio: 1,
  },
  active: {
    backgroundColor: 'skyblue',
  },
  opaque: {
    backgroundColor: '#D3D3D3',
  },
  list: {
    margin: 10,
  },
  containGroupIcon: {
    width: '60%',
    height: '60%',
  },
  containCheckIcon: {
    width: '50%',
    height: '50%',
  }
});