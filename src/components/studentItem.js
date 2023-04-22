import React, { PureComponent } from 'react';
import { View, TouchableOpacity, Text, CheckBox, StyleSheet, Platform } from 'react-native';
import { getId } from '../lib/utils';
import IosCheckBox from 'react-native-check-box';

import get from 'lodash/get';
import { getStudentName, isAndroid } from '../lib/utils';
import { fontColor, iconFont } from '../colorSets';

export default class StudentItem extends PureComponent {

  onSelect = () => {
    this.props.selectStudent([getId(this.props.student)])
  };

  onCheck = () => this.props.onCheckBoxClick(getId(this.props.student));

  checkboxRender = () => {
    const { student, selectedStudents } = this.props;
    const studentId = getId(student);
    const commonProps = {
      style: { marginRight: 5 },
      onClick: this.onCheck,
      isChecked: selectedStudents.has(studentId)
    };
    return Platform.select({
      ios: (props) => <IosCheckBox
        style={props.style}
        onClick={props.onClick}
        isChecked={props.isChecked}
        checkBoxColor={iconFont}
      />,
      android: (props) => <CheckBox
        style={props.style}
        value={props.isChecked}
        onChange={props.onClick}
      />
    })(commonProps);
  };

  render() {
    const { student, isGroup } = this.props;
    const studentId = getId(student);
    return (<TouchableOpacity onPress={isGroup ? this.onCheck : this.onSelect}>
      <View style={styles.student}>
        { isGroup && this.checkboxRender() }
        <Text
          key={studentId}
          style={styles.studentName}
        >
          { getStudentName(student) }
        </Text>
      </View>
    </TouchableOpacity>);
  }
};

const styles = StyleSheet.create({
  student: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: fontColor,
    borderBottomWidth: 0.5,
  },
  studentName: {
    fontSize: 16,
    lineHeight: 25,
  },
});

