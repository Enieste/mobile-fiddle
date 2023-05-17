import React, { useCallback, useEffect, useState } from 'react';
import Meteor, { Mongo, useTracker } from '@meteorrn/core';
import { observer } from 'mobx-react';
import { AndroidBackHandler } from 'react-navigation-backhandler';
import { View, StyleSheet, FlatList, TouchableOpacity, Text } from 'react-native';
import get from 'lodash/get';
import omit from 'lodash/omit';
import { getStudentName, listFilter, accountType, TEACHER, goBack, useGoBack } from '../lib/utils';
import { HeaderBackButton } from 'react-navigation-stack';
import appStore from '../mobx/appStore';
import SearchInput from '../components/searchField';
import StudentItem from '../components/studentItem';
import { backgroundMain } from '../colorSets';
import GroupIcon from '../components/icons/group';
import CheckIcon from '../components/icons/checkIcon';
import { useFocusEffect, useRoute, useNavigation } from '@react-navigation/native';

const StudentSelect = observer(() => {
  const [filter, setFilter] = useState('');
  const [selectedStudents, setSelectedStudents] = useState(new Set());

  const navigation = useNavigation();
  const route = useRoute();
  const isGroup = appStore.get('groupSelect');
  const back = useGoBack();
  const BackButton = (props) => {
    const onPress = () => {
      const isGroup = appStore.get('groupSelect');
      (isGroup ? appStore.unsetGroupValue : back)();
    }
    return <HeaderBackButton
      {...omit(props, 'onPress')}
      onPress={onPress}
    />
  };

  useEffect(() => {
    navigation.setOptions({
      title: 'Select Student',
      headerLeft: () => (<BackButton />),
      headerRight: () => (<View />)
    })
  }, [navigation]);

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
    (isGroup ? appStore.unsetGroupValue : back)();
    return true
  };

  const navigateFurther = (idArray) => {
    const videoUri = get(route, ['params', 'videoUri']);
    navigation.navigate('CategorySelect', { videoUri, studentIds: idArray });
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
            onChange={setFilter}
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
            keyExtractor={getId}
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