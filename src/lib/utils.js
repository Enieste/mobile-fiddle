import { Platform } from 'react-native';
import get from 'lodash/get';
import initial from 'lodash/initial';
import last from 'lodash/last';
import first from 'lodash/first';
import moment from 'moment';

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


