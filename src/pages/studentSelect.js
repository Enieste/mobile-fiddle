import React, { useCallback, useState } from 'react';
import Meteor, { Mongo, useTracker } from '@meteorrn/core';
import { observer } from 'mobx-react';
import { AndroidBackHandler } from 'react-navigation-backhandler';
import { View, StyleSheet, FlatList, TouchableOpacity, Text } from 'react-native';
import get from 'lodash/get';
import omit from 'lodash/omit';
import { getStudentName, listFilter, accountType, TEACHER } from '../lib/utils';
import { NavigationActions, StackActions } from '@react-navigation/compat';
import { HeaderBackButton } from 'react-navigation-stack';
import appStore from '../mobx/appStore';
import SearchInput from '../components/searchField';
import StudentItem from '../components/studentItem';
import { backgroundMain } from '../colorSets';
import GroupIcon from '../components/icons/group';
import CheckIcon from '../components/icons/checkIcon';
import { getNavigatorRef } from '../entry';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

const StudentSelect = observer(() => {
  const [filter, setFilter] = useState('');
  const [selectedStudents, setSelectedStudents] = useState(new Set());

  const navigation = useNavigation();
  const route = useRoute();
  const isGroup = appStore.get('groupSelect');

  const { students, dataReady } = useTracker(() => {
    const user = Meteor.user();
    const userType = accountType(user);
    const sub = Meteor.subscribe(userType === TEACHER ? 'MyStudents' : 'Children');
    return {
      students: sub.ready() && new Mongo.Collection('users')
        .find({ 'profile.accountType': 'student' }, { sort: { 'profile.fullName': 1 } }).fetch(),
      dataReady: sub.ready(),
    };
  });

  useFocusEffect(
    (useCallback(() => {
      return () => {
        if (appStore.get('groupSelect')) {
          appStore.unsetGroupValue();
          setSelectedStudents(new Set());
        }
      }
    }, []))
  );

  const onBackButtonPressAndroid = () => {
    const isGroup = appStore.get('groupSelect');
    (isGroup ? appStore.unsetGroupValue : navigation.popToTop)();
    return true
  };

  const navigateFurther = (idArray) => {
    const videoUri = get(route, ['params', 'videoUri']);
    navigation.navigate('CategorySelect', { videoUri, studentIds: idArray });
  };

  const studentsFilter = (str) => {
    setFilter(str);
  };

  const selectGroup = () => {
    navigateFurther(Array.from(selectedStudents));
  };

  const addDeleteId = (id) => {

    setSelectedStudents((ss) => {
      const selectedStudents = new Set(ss);
      const isSelected = selectedStudents.has(id);
      if (isSelected) {
        selectedStudents.delete(id);
      } else {
        selectedStudents.add(id);
      }
      return selectedStudents;
    });
  };

  const getId = item => get(item, '_id');

  const modeHandler = () => {
    const isGroup = appStore.get('groupSelect');
    appStore.setGroupValue(!isGroup);
  };

  const filteredStudents = students && listFilter(students, getStudentName, filter);

  return <AndroidBackHandler onBackPress={onBackButtonPressAndroid}>
    <View>
      { students ? <View style={styles.page}>
          <SearchInput
            onChange={studentsFilter}
            value={filter}
          />
          <FlatList
            style={styles.list}
            data={filteredStudents}
            renderItem={({ item }) => <StudentItem
              isGroup={isGroup}
              student={item}
              selectedStudents={selectedStudents}
              selectStudent={navigateFurther}
              onCheckBoxClick={addDeleteId}
            />
            }
            keyExtractor={this.getId}
          />
        </View> :
        <View style={styles.page}>
          <Text>{ dataReady ? 'You haven\'t got students yet' : 'Loading...' }</Text>
        </View> }
      <TouchableOpacity
        style={[styles.circle, selectedStudents.size ? styles.active : styles.opaque, !isGroup && styles.active]}
        onPress={isGroup && selectedStudents.size ? selectGroup : modeHandler}
      >
        { isGroup ? <View style={styles.containCheckIcon}>
          <CheckIcon />
        </View> : <View style={styles.containGroupIcon}>
          <GroupIcon />
        </View> }
      </TouchableOpacity>
    </View>
  </AndroidBackHandler>
});

// const studentSelectObserver = observer(class _StudentSelect extends Component {
  // constructor(props) {
  //   super(props);
  //   this.state = {
  //     filter: '',
  //     selectedStudents: new Set(),
  //   }
  // }
  // componentWillReceiveProps(nextProps) {
  //   if (this.props.isFocused && !nextProps.isFocused && appStore.get('groupSelect')) {
  //     appStore.unsetGroupValue();
  //     this.setState({
  //       selectedStudents: new Set(),
  //     });
  //   }
  // }
  //
  // onBackButtonPressAndroid = () => {
  //   const isGroup = appStore.get('groupSelect');
  //   (isGroup ? appStore.unsetGroupValue : this.props.navigation.popToTop)();
  //   return true
  // };

  // navigateFurther = (idArray) => {
  //   const videoUri = get(this.props, ['navigation', 'state', 'params', 'videoUri']);
  //   this.props.navigation.navigate('CategorySelect', { videoUri, studentIds: idArray });
  // };
  // studentsFilter = (str) => {
  //   this.setState({
  //     filter: str,
  //   });
  // };
  // selectGroup = () => {
  //   this.navigateFurther(Array.from(this.state.selectedStudents));
  // };
  // addDeleteId = (id) => {
  //   const selectedStudents = new Set(this.state.selectedStudents);
  //   const isSelected = selectedStudents.has(id);
  //   if (isSelected) {
  //     selectedStudents.delete(id);
  //   } else {
  //     selectedStudents.add(id);
  //   }
  //   this.setState({
  //     selectedStudents,
  //   })
  // };
  //
  // getId = item => get(item, '_id');

  // modeHandler = () => {
  //   const isGroup = appStore.get('groupSelect');
  //   appStore.setGroupValue(!isGroup);
  // };
  //
  // render() {
    // const isGroup = appStore.get('groupSelect');
    // const { selectedStudents } = this.state;
    // const filteredStudents = this.props.students && listFilter(this.props.students, getStudentName, this.state.filter);
    // return <AndroidBackHandler onBackPress={this.onBackButtonPressAndroid}>
    //   <View>
    //   { this.props.students ? <View style={styles.page}>
    //     <SearchInput
    //       onChange={this.studentsFilter}
    //       value={this.state.filter}
    //     />
    //     <FlatList
    //       style={styles.list}
    //       data={filteredStudents}
    //       renderItem={({ item }) => <StudentItem
    //           isGroup={isGroup}
    //           student={item}
    //           selectedStudents={selectedStudents}
    //           selectStudent={this.navigateFurther}
    //           onCheckBoxClick={this.addDeleteId}
    //         />
    //       }
    //       keyExtractor={this.getId}
    //     />
    //   </View> :
    //   <View style={styles.page}>
    //     <Text>{ this.props.dataReady ? 'You haven\'t got students yet' : 'Loading...' }</Text>
    //   </View> }
    //   <TouchableOpacity
    //     style={[styles.circle, selectedStudents.size ? styles.active : styles.opaque, !isGroup && styles.active]}
    //     onPress={isGroup && selectedStudents.size ? this.selectGroup : this.modeHandler}
    //   >
    //     { isGroup ? <View style={styles.containCheckIcon}>
    //       <CheckIcon />
    //     </View> : <View style={styles.containGroupIcon}>
    //      <GroupIcon />
    //     </View> }
    //   </TouchableOpacity>
    //   </View>
    // </AndroidBackHandler>
//   }
// });

// const studentSelectContainer = withTracker(params => {
//   const user = Meteor.user();
//   const userType = accountType(user);
//   const sub = Meteor.subscribe(userType === TEACHER ? 'MyStudents' : 'Children');
//   return {
//     students: sub.ready() && Meteor.collection('users')
//       .find({ 'profile.accountType': 'student' }, { sort: { 'profile.fullName': 1 } }),
//     dataReady: sub.ready(),
//   };
// })(studentSelectObserver);

const BackButton = () => {
  const onPress = () => {
    const isGroup = appStore.get('groupSelect');
    const goBack = () => getNavigatorRef().dispatch(StackActions.reset({ // this is react-navigation's dispatch
      index: 0,
      actions: [NavigationActions.navigate({ routeName: 'Home' })],
    }));
    (isGroup ? appStore.unsetGroupValue : goBack)();
  }
  return <HeaderBackButton
    {...omit(this.props, 'onPress')}
    onPress={onPress}
  />
}

// class _BackButton extends PureComponent {
//   onPress = () => {
//     const isGroup = appStore.get('groupSelect');
//     const goBack = () => getNavigatorRef().dispatch(StackActions.reset({ // this is react-navigation's dispatch
//       index: 0,
//       actions: [NavigationActions.navigate({ routeName: 'Home' })],
//     }));
//     (isGroup ? appStore.unsetGroupValue : goBack)();
//   };
//   render() {
//     return <HeaderBackButton
//       {...omit(this.props, 'onPress')}
//       onPress={this.onPress}
//     />
//   }
// }

StudentSelect.navigationOptions = () => {
  return {
    title: 'Select Student',
    headerLeft: BackButton,
    headerRight: (<View />)
  };
};

export default StudentSelect;

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