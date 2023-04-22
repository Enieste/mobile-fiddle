import React, { PureComponent } from 'react';
import Meteor from 'react-native-meteor';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, Platform, Button } from 'react-native';
import { backgroundTitle, iconFont, backgroundGray } from '../colorSets';
import renderButton from '../components/button';

export default class SignIn extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: '',
      error: null,
    };
  }

  static navigationOptions = {
    title: 'Sign-In',
    headerStyle: {
      backgroundColor: backgroundTitle,
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      flex: 1,
      textAlign: 'center',
    },
  };

  isValid = () => {
    const { email, password } = this.state;
    let valid = false;

    if (email.length > 0 && password.length > 0) {
      valid = true;
    }

    if (email.length === 0) {
      this.setState({ error: 'You must enter an email address' });
    } else if (password.length === 0) {
      this.setState({ error: 'You must enter a password' });
    }
    return valid;
  };

  onSignIn = () => {
    const { email, password } = this.state;
    if (this.isValid()) {
      Meteor.loginWithPassword(email.toLowerCase(), password, (error) => {
        const user = Meteor.user();
        if (error) {
          this.setState({ error: error.reason });
        } else {
          this.props.navigation.navigate('Home');
        }
      });
    }
  };

  render() {
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
          onChangeText={email => this.setState({ email })}
          placeholder="Username"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          underlineColorAndroid='rgba(0,0,0,0)'
        />

        <TextInput
          style={styles.input}
          onChangeText={password => this.setState({ password })}
          placeholder="Password"
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={true}
          underlineColorAndroid='rgba(0,0,0,0)'
        />
        {renderButton(this.onSignIn, 'Sign In', iconFont)}
        <Text style={styles.error}>{this.state.error}</Text>

      </KeyboardAvoidingView>
    );
  }
}

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
