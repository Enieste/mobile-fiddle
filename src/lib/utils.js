import { Platform } from 'react-native';
import get from 'lodash/get';
import initial from 'lodash/initial';
import last from 'lodash/last';
import first from 'lodash/first';
import moment from 'moment';
import { StackActions, useNavigation, useRoute } from "@react-navigation/native";
import { useCallback } from "react";
import uploadsStore from "../mobx/uploadsStore";
import { CACHING_VIDEO_PAGE, CATEGORY_SELECT_PAGE, STUDENT_SELECT_PAGE } from "../constants";

export const TEACHER = 'teacher';
export const STUDENT = 'student';
export const PARENT = 'parent';

export const getId = item => get(item, '_id');

export const getStudentName = item => get(item, ['profile', 'fullName']);

export const listFilter = (list, lens, filter) => {
  return list.filter(item => lens(item).toLowerCase().indexOf(filter.toLowerCase()) !== -1);
};

export const studentNamesToString = studentNames => {
  const isPlural = studentNames.length > 1;
  return '' + (isPlural ? initial(studentNames).join(', ') +
    (last(studentNames) ? ` and ${last(studentNames)}` : '') :
    first(studentNames))
};

export const isAndroid = () => Platform.OS === 'android';

export const durationToStr = ms => moment(ms).format('mm:ss');

export const itemTitle = (item, category) => {
  const isSong = category === 'song';
  const rm = item.recordingsMeta[
    isSong ? 0 : category === 'scale' ? 1 : 0];
  const n = rm && rm.name;
  return `${!isSong ? `${item.level}-${item.unit}: ` : ''}${n}`;
};

export const accountType = (user) => get(user, ['profile', 'accountType']);

export const childrenIds = (user) => {
  const ids = get(user, ['profile', 'settings', 'general', 'chldrn']);
  return ids.map(i => i.id);
};

export const isTeacher = user => accountType(user) === TEACHER;

export const isIndependent = user => accountType(user) === STUDENT && !get(user, ['profile', 'parentId']);

export const getTeacherId = user => get(user, ['profile', 'teacherId']);

export const userName = user => get(user, ['profile', 'firstName']);

const penultimate = a => a.length > 1 ? a[a.length - 2] : null;

export const goBack = (navigation) => navigation.dispatch(StackActions.popToTop());
export const useGoBack = () => {
  const navigation = useNavigation();
  return useCallback(() => {
    const state = navigation.getState();
    const current = last(state.routes);
    const next = penultimate(state.routes);
    if (next && current && next.name === CACHING_VIDEO_PAGE && [STUDENT_SELECT_PAGE, CATEGORY_SELECT_PAGE].indexOf(current.name) !== -1) {
      uploadsStore.cancelCurrentUpload();
    }
    goBack(navigation);
  }, [navigation]);
};

export const useRouteProps = () => {
  const route = useRoute();
  return {
    title: get(route, ['params', 'title']),
    studentIds: get(route, ['params', 'studentIds']),
    description: get(route, ['params', 'description']),
    category: get(route, ['params', 'category']),
    notesForTeacher: get(route, ['params', 'notesForTeacher']),
    localVideoUri: get(route, ['params', 'videoUri']),
    practiceItemId: get(route, ['params', 'practiceItemId']),
    isForPosting: get(route, ['params', 'isForPosting'])
  }
};
