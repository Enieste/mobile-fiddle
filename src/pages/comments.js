import React, { Component } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, TextInput, ScrollView, Switch } from 'react-native';
import get from 'lodash/get';
import { withNavigationFocus } from '@react-navigation/compat';
import renderButton from '../components/button';
import { backgroundMain, fontColor, inputFont, iconFont } from '../colorSets';

class Comments extends Component {

  constructor(props) {
    super(props);

    this.state = {
      description: '',
      notesForTeacher: '',
      isForPosting: true,
    };
  }

  onChangeDescription = (text) => {
    this.setState({
      description: text
    })
  };

  onChangeNotes = (text) => {
    this.setState({
      notesForTeacher: text
    })
  };

  toggleSwitch = () => {
    this.setState({
      isForPosting: !this.state.isForPosting
    })
  };

  onNext = () => {
    const { description, notesForTeacher, isForPosting } = this.state;
    const videoUri = get(this.props, ['navigation', 'state', 'params', 'videoUri']);
    const studentIds = get(this.props, ['navigation', 'state', 'params', 'studentIds']);
    const category = get(this.props, ['navigation', 'state', 'params', 'category']);
    const practiceItemId = get(this.props, ['navigation', 'state', 'params', 'practiceItemId']);
    const title = get(this.props, ['navigation', 'state', 'params', 'title']);
    this.props.navigation.navigate('Summary', {
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

  render() {
    return  <View style={styles.page}>
      <KeyboardAvoidingView style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-start',}} behavior="padding" enabled   keyboardVerticalOffset={20}>
        <ScrollView>
          <View style={styles.container}>
            <View style={styles.inputContainer}>
              <Text style={styles.text}>Any comments to describe the video? (this will display with the video)</Text>
              <TextInput
                style={styles.textInput}
                onChangeText={text => this.onChangeDescription(text)}
                underlineColorAndroid='rgba(0,0,0,0)'
                value={this.state.description}
                multiline={true}
                textAlignVertical={'top'}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.text}>Any comments just for the teacher?</Text>
              <TextInput
                style={styles.textInput}
                onChangeText={text => this.onChangeNotes(text)}
                underlineColorAndroid='rgba(0,0,0,0)'
                value={this.state.notesForTeacher}
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
                  thumbColor={this.state.isForPosting ? "#ffffff" : "#ffffff"}
                  ios_backgroundColor={inputFont}
                  onValueChange={this.toggleSwitch}
                  value={this.state.isForPosting}
                />
              </View>
            </View>
            <View style={styles.buttonContainer}>
              { renderButton(this.onNext, 'Next', iconFont) }
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  }
}

Comments.navigationOptions = () => ({
  title: 'Any comments?',
  headerRight: <View />,
});

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