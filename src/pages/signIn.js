import React, { memo, useCallback, useState } from 'react';
import Meteor from '@meteorrn/core';
import { StyleSheet, Text, View, TextInput, Image, KeyboardAvoidingView } from 'react-native';
import { iconFont, backgroundGray } from '../colorSets';
import renderButton from '../components/button';
import { useNavigation } from '@react-navigation/native';

const SignIn = memo(() => {
  const [email, setEmail] = useState('igor.loskutoff@gmail.com');
  const [password, setPassword] = useState('100gktntq');
  const [error, setError] = useState(null);

  const navigation = useNavigation();

  const isValid = useCallback(() => {
    let valid = false;

    if (email.length > 0 && password.length > 0) {
      valid = true;
    }

    if (email.length === 0) {
      setError('You must enter an email address');
    } else if (password.length === 0) {
      setError('You must enter a password');
    }
    return valid;
  }, [email, password]);

  const onSignIn = useCallback(() => {
    if (isValid()) {
      console.log('Meteor.loginWithPassword', Meteor.loginWithPassword)
      Meteor.loginWithPassword(email.toLowerCase(), password, (error) => {
        console.log('after login attempt')
        if (error) {
          setError(error.reason);
          return;
        }
        console.log('this.props.navigation', navigation)
        navigation.navigate('Home');
      });
    } else {
      console.error('TODO error on invalid signin');
    }
  }, [password, navigation]);

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          style={{ flex:1, height: undefined, width: undefined }}
          resizeMode="center"
          source={require('../assets/wordmark-for-login.png')}
        />
      </View>
      <TextInput
        style={[styles.input, styles.top]}
        value={email}
        onChangeText={email => setEmail(email)}
        placeholder="Username"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        underlineColorAndroid='rgba(0,0,0,0)'
      />

      <TextInput
        style={styles.input}
        value={password}
        onChangeText={password => setPassword(password)}
        placeholder="Password"
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry={true}
        underlineColorAndroid='rgba(0,0,0,0)'
      />
      {renderButton(onSignIn, 'Sign In', iconFont)}
      <Text style={styles.error}>{error}</Text>

    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: backgroundGray,
  },
  inputContainer: {
    flex: 0,
    width: '100%',
  },
  input: {
    width: '100%',
    fontSize: 16,
    height: 50,
    padding: 10,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderColor: '#c1c1c1',
    borderWidth: 1,
  },
  top: {
    borderBottomWidth: 0,
  },
  buttonIos: {
    flex: 0,
    backgroundColor: iconFont,
    width: '80%',
    paddingVertical: 18,
    alignItems: 'center',
    marginVertical: 20,
    borderRadius: 10,
  },
  buttonAndroid: {
    flex: 0,
    width: '70%',
    marginVertical: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
  },
  imageContainer: {
    height: '40%',
    minHeight: '20%',
    width: '100%',
    padding: 20,
  },
});

export default SignIn;