import React, { PureComponent } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform, Button } from 'react-native';
import Meteor from '@meteorrn/core';
import { backgroundMain, signOutButton } from '../colorSets';


class SignOut extends PureComponent {
  static navigationOptions = {
    title: 'Sign Out',
    headerRight: (<View />)
  };
  sighingOut = () => {
    Meteor.logout();
    this.props.navigation.navigate('Auth')
  };
  buttonRender = () => {
    return Platform.select({
      ios: () => {
        return (<TouchableOpacity style={styles.buttonIos} onPress={this.sighingOut}>
          <Text style={styles.buttonText}>Sign Out from FiddleQuest</Text>
        </TouchableOpacity>)
      },
      android: () => {
        return <View style={styles.buttonAndroid}>
          <Button
            onPress={this.sighingOut}
            title="Sign Out from FiddleQuest"
            color="#F3172D"
          />
        </View>
      },
    })();
  };
  render() {
    return (
      <View style={styles.container}>
        {this.buttonRender()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: backgroundMain,
  },
  buttonIos: {
    backgroundColor: signOutButton,
    width: '80%',
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 10,
    borderRadius: 10,
  },
  buttonAndroid: {
    width: '70%',
    marginBottom: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 18,
    textAlign: 'center',
  },
});

export default SignOut;
