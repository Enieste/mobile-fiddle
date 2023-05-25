import React, { Component, useEffect, useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, TextInput, ScrollView, Switch } from 'react-native';
import get from 'lodash/get';
import { withNavigationFocus } from '@react-navigation/compat';
import renderButton from '../components/button';
import { backgroundMain, fontColor, inputFont, iconFont } from '../colorSets';
import { useNavigation, useRoute } from "@react-navigation/native";

const Comments = () => {
  const [description, setDescription] = useState('');
  const [notesForTeacher, setNotesForTeacher] = useState('');
  const [isForPosting, setIsForPosting] = useState(true);

  const navigation = useNavigation();
  const route = useRoute();

  useEffect(() => {
    navigation.setOptions({
      title: 'Any comments?',
      headerRight: () => (<View />),
    })
  }, [navigation])

  const onNext = () => {
    const videoUri = get(route, ['params', 'videoUri']);
    const studentIds = get(route, ['params', 'studentIds']);
    const category = get(route, ['params', 'category']);
    const practiceItemId = get(route, ['params', 'practiceItemId']);
    const title = get(route, ['params', 'title']);
    navigation.navigate('Summary', {
      videoUri,
      studentIds,
      title,
      practiceItemId,
      category,
      description : description.trim(),
      notesForTeacher: notesForTeacher.trim(),
      isForPosting
    });
  };

  return  <View style={styles.page}>
    <KeyboardAvoidingView style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-start',}} behavior="padding" enabled   keyboardVerticalOffset={20}>
      <ScrollView>
        <View style={styles.container}>
          <View style={styles.inputContainer}>
            <Text style={styles.text}>Any comments to describe the video? (this will display with the video)</Text>
            <TextInput
              style={styles.textInput}
              onChangeText={setDescription}
              underlineColorAndroid='rgba(0,0,0,0)'
              value={description}
              multiline={true}
              textAlignVertical={'top'}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.text}>Any comments just for the teacher?</Text>
            <TextInput
              style={styles.textInput}
              onChangeText={setNotesForTeacher}
              underlineColorAndroid='rgba(0,0,0,0)'
              value={notesForTeacher}
              multiline={true}
              textAlignVertical={'top'}
            />
          </View>
          <View style={styles.switchContainer}>
            <Text style={styles.text}>
              Post the video on FiddleQuest?
            </Text>
            <View style={styles.switch}>
              <Switch
                trackColor={{ false: '#eceeed', true: '#4C92C1' }}
                thumbColor={isForPosting ? "#ffffff" : "#ffffff"}
                ios_backgroundColor={inputFont}
                onValueChange={() => setIsForPosting((v) => !v)}
                value={isForPosting}
              />
            </View>
          </View>
          <View style={styles.buttonContainer}>
            { renderButton(onNext, 'Next', iconFont) }
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </View>

}

const styles = StyleSheet.create({
  page: {
    backgroundColor: backgroundMain,
    height: '100%',
  },
  container: {
    padding: '5%',
  },
  text: {
    fontSize: 16,
  },
  inputContainer: {
    margin: 10,
    marginVertical: 15,
  },
  switchContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    margin: 10,
    marginVertical: 15,
  },
  textInput: {
    marginVertical: 10,
    height: 80,
    padding: 15,
    backgroundColor: inputFont,
    color: fontColor,
    borderRadius: 10,
    fontSize: 14,
  },
  switch: {
    padding: 10,
  },
  buttonContainer: {
    flex: 1,
    alignItems: 'center'
  }
});

export default withNavigationFocus(Comments);