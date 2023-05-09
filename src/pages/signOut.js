import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform, Button } from 'react-native';
import Meteor from '@meteorrn/core';
import { backgroundMain, signOutButton } from '../colorSets';
import { useNavigation } from '@react-navigation/native';

const SignOut = () => {
  const navigation = useNavigation();

  const sighingOut = () => {
    Meteor.logout();
    navigation.navigate('SignIn')
  };

  const buttonRender = () => {
    return Platform.select({
      ios: () => {
        return (<TouchableOpacity style={styles.buttonIos} onPress={sighingOut}>
          <Text style={styles.buttonText}>Sign Out from FiddleQuest</Text>
        </TouchableOpacity>)
      },
      android: () => {
        return <View style={styles.buttonAndroid}>
          <Button
            onPress={sighingOut}
            title="Sign Out from FiddleQuest"
            color="#F3172D"
          />
        </View>
      },
    })();
  };

  return (
    <View style={styles.container}>
      {buttonRender()}
    </View>
  );
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
