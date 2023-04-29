import React, { memo, useCallback, useState } from 'react';
import Meteor from '@meteorrn/core';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, Platform, Button } from 'react-native';
import { backgroundTitle, iconFont, backgroundGray } from '../colorSets';
import renderButton from '../components/button';
import { useNavigation } from '@react-navigation/native';

// const rootNavigation = useNavigation();

const SignIn = memo(() => {
  const [email, setEmail] = useState('igor.loskutoff@gmail.com');
  const [password, setPassword] = useState('100gktntq');
  const [error, setError] = useState(null);

  const navigation = useNavigation();
  console.log("navigationnavigationnavigation", navigation)

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
        navigation.navigate('Root', { screen: 'Home' })
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

  // move out
  /*
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
   */
  // ...
});

// export default class SignIn extends PureComponent {
//   constructor(props) {
//     super(props);
//
//     this.state = {
//       email: 'igor.loskutoff@gmail.com',
//       password: '100gktntq',
//       error: null,
//     };
//   }
//
//   static navigationOptions = {
//     title: 'Sign-In',
//     headerStyle: {
//       backgroundColor: backgroundTitle,
//     },
//     headerTintColor: '#fff',
//     headerTitleStyle: {
//       flex: 1,
//       textAlign: 'center',
//     },
//   };
//
//   isValid = () => {
//     const { email, password } = this.state;
//     let valid = false;
//
//     if (email.length > 0 && password.length > 0) {
//       valid = true;
//     }
//
//     if (email.length === 0) {
//       this.setState({ error: 'You must enter an email address' });
//     } else if (password.length === 0) {
//       this.setState({ error: 'You must enter a password' });
//     }
//     return valid;
//   };
//
//   onSignIn = () => {
//     const { email, password } = this.state;
//
//     if (this.isValid()) {
//       console.log('Meteor.loginWithPassword', Meteor.loginWithPassword)
//       Meteor.loginWithPassword(email.toLowerCase(), password, (error) => {
//         console.log('after login attempt')
//         if (error) {
//           this.setState({ error: error.reason });
//           return;
//         }
//         console.log('this.props.navigation', this.props.navigation)
//         this.props.navigation.navigate('Home');
//       });
//     } else {
//       console.error('TODO error on invalid signin');
//     }
//   };
//
//   render() {
//     return (
//       <KeyboardAvoidingView behavior="padding" style={styles.container}>
//         <View style={styles.imageContainer}>
//           <Image
//             style={{ flex:1, height: undefined, width: undefined }}
//             resizeMode="center"
//             source={require('../assets/wordmark-for-login.png')}
//           />
//         </View>
//         <TextInput
//           style={[styles.input, styles.top]}
//           value={this.state.email}
//           onChangeText={email => this.setState({ email })}
//           placeholder="Username"
//           autoCapitalize="none"
//           autoCorrect={false}
//           keyboardType="email-address"
//           underlineColorAndroid='rgba(0,0,0,0)'
//         />
//
//         <TextInput
//           style={styles.input}
//           value={this.state.password}
//           onChangeText={password => this.setState({ password })}
//           placeholder="Password"
//           autoCapitalize="none"
//           autoCorrect={false}
//           secureTextEntry={true}
//           underlineColorAndroid='rgba(0,0,0,0)'
//         />
//         {renderButton(this.onSignIn, 'Sign In', iconFont)}
//         <Text style={styles.error}>{this.state.error}</Text>
//
//       </KeyboardAvoidingView>
//     );
//   }
// }

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