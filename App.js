import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import Meteor, { useTracker } from '@meteorrn/core';
import { createSwitchNavigator } from '@react-navigation/compat';
import { createStackNavigator } from '@react-navigation/stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import 'react-native-gesture-handler';
import Expo from 'expo';
import AppLoading from 'expo-app-loading';
import SignIn from './src/pages/signIn';
import SignOut from './src/pages/signOut';
import UploadPage from './src/pages/upload';
import CameraMode from './src/pages/cameraMode';
import CachingVideo from './src/pages/videoCaching';
import StudentSelect from './src/pages/studentSelect';
import SongSelect from './src/pages/songSelect';
import CategorySelect from './src/pages/categorySelect';
import Comments from './src/pages/comments';
import Summary from './src/pages/summary';
import { backgroundTitle } from './src/colorSets';
import { NavigationContainer } from "@react-navigation/native";
import { Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SplashScreen from 'expo-splash-screen';

const development = 'ws://localhost:3000/websocket';
const staging = 'wss://app.staging.fiddlequest.com/websocket';
const production = 'wss://app.fiddlequest.com/websocket';

Meteor.connect(production, { AsyncStorage });

SplashScreen.preventAutoHideAsync();

const useUser = () => {
  const [userCertainlyChecked, setUserCertainlyChecked] = useState(false);
  const { user, loggingIn } = useTracker(() => {
    const user = Meteor.user();
    const loggingIn = Meteor.loggingIn();
    return {
      user,
      loggingIn,
    };
  });
  const loggingInRef = useRef(false/*being changed to undefined or an object, never "false" again*/);
  useEffect(() => {
    const prevLoggingIn = loggingInRef.current;
    if (!loggingIn && prevLoggingIn) {

      // I did log in and now I do not log in but I'm still not ready! no no
      if (!user) return;
      SplashScreen.hideAsync().then(() => {});
      setUserCertainlyChecked(true);
    }
    loggingInRef.current = loggingIn;
  }, [loggingIn, user]);
  return { user, isLoading: loggingIn, userCertainlyChecked };
};

const AuthLoadingScreen = memo(({ navigation }) => {
  const { user, loggingIn } = useTracker(() => {
    const user = Meteor.user();
    const loggingIn = Meteor.loggingIn();
    return {
      user,
      loggingIn,
    };
  });
  const checkUserAndSwitch = useCallback(() => {
    navigation.navigate(user ? 'App' : 'Auth');
  }, [navigation, user]);
  const loggingInRef = useRef(false/*being changed to undefined or an object, never "false" again*/);
  useEffect(() => {
    const prevLoggingIn = loggingInRef.current;
    if (loggingIn !== prevLoggingIn && !loggingIn) {
      checkUserAndSwitch();
    }
    loggingInRef.current = loggingIn;
  }, [loggingIn, checkUserAndSwitch]);
  return <View><Text>LOADING</Text></View>;
});

const AuthStack_ = createStackNavigator();

const AuthStack = () =>
  <AuthStack_.Screen
    name="SignIn"
    component={SignIn}
    options={{
      title: 'Sign-In',
      headerStyle: {
        backgroundColor: backgroundTitle
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        flex: 1,
        textAlign: 'center',
      }}
    }
  />

const AppStack_ = createStackNavigator();

const headerStyle = {
  backgroundColor: backgroundTitle,
  headerTintColor: '#fff',
};

const screenOptions = {
  headerStyle,
};

/*
titleStyle: {
  flex: 1,
  textAlign: 'center',
},
 */

const AppStack = <>
  <AppStack_.Screen name="Home" component={UploadPage} />
  <AppStack_.Screen name="Settings" component={SignOut} />
  <AppStack_.Screen name="CameraMode" component={CameraMode} />
  <AppStack_.Screen name="CachingVideo" component={CachingVideo} />
  <AppStack_.Screen name="StudentSelect" component={StudentSelect} />
  <AppStack_.Screen name="CategorySelect" component={CategorySelect} />
  <AppStack_.Screen name="SongSelect" component={SongSelect} />
  <AppStack_.Screen name="Comments" component={Comments} />
  <AppStack_.Screen name="Summary" component={Summary} />
</>;

const Stack = createStackNavigator();

const App = () => {
  const { user, isLoading, userCertainlyChecked } = useUser();
  if (isLoading || !userCertainlyChecked) return <View><Text>Loading...</Text></View>;
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={screenOptions}>
        {!user ? (
          // No token found, user isn't signed in
          <Stack.Screen
            name="Auth"
            component={AuthStack}
          />
        ) : (
          // User is signed in
          AppStack
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
