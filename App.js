import React, {createContext, useEffect, useRef, useState} from 'react';
import Meteor, { useTracker } from '@meteorrn/core';
import { createStackNavigator } from '@react-navigation/stack';
import 'react-native-gesture-handler';
import SignIn from './src/pages/signIn';
import SignOut from './src/pages/signOut';
import UploadPage from './src/pages/main';
import CameraMode from './src/pages/cameraMode';
import CachingVideo from './src/pages/videoCaching';
import StudentSelect from './src/pages/studentSelect';
import SongSelect from './src/pages/songSelect';
import CategorySelect from './src/pages/categorySelect';
import Comments from './src/pages/comments';
import Summary from './src/pages/summary';
import {backgroundTitle, iconFont} from './src/colorSets';
import { NavigationContainer } from "@react-navigation/native";
import {ActivityIndicator, Alert, BackHandler, StyleSheet, Text, View} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SplashScreen from 'expo-splash-screen';
import NetInfo from '@react-native-community/netinfo';
import { useDebounce } from "@uidotdev/usehooks";
import {
  CACHING_VIDEO_PAGE,
  CAMERA_MODE_PAGE,
  CATEGORY_SELECT_PAGE, COMMENTS_PAGE,
  SETTINGS_PAGE, SONG_SELECT_PAGE,
  STUDENT_SELECT_PAGE, SUMMARY_PAGE
} from "./src/constants";
const useIsConnected = () => {
  const [isConnected, setIsConnected] = useState(null);
  useEffect(() => NetInfo.addEventListener(state => {
    setIsConnected(state.isConnected);
  }), []);
  return isConnected;
};

const development = 'ws://localhost:3000/websocket';
const staging = 'wss://app.staging.fiddlequest.com/websocket';
const production = 'wss://app.fiddlequest.com/websocket';

Meteor.connect(staging, { AsyncStorage });

SplashScreen.preventAutoHideAsync();

const userContextDefaultValue = {
  userCertainlyChecked: false,
  isLoading: false,
  user: undefined,
}

const UserContext = createContext(userContextDefaultValue);

const useUser = () => {
  const [userCertainlyChecked, setUserCertainlyChecked] = useState(false);
  const { user: userOnSpeeds/*meteor blinks user to true then to false then to true with NO F REASON*/, loggingIn } = useTracker(() => {
    const user = Meteor.user();
    const loggingIn = Meteor.loggingIn();
    return {
      user,
      loggingIn,
    };
  });
  const user = useDebounce(userOnSpeeds, 300);
  const loggingInRef = useRef(false/*being changed to undefined or an object, never "false" again*/);
  useEffect(() => {
    const prevLoggingIn = loggingInRef.current;
    if (!loggingIn && prevLoggingIn) {

      // I did log in and now I do not log in but I'm still not ready! no no
      //if (!user) return;
      SplashScreen.hideAsync().then(() => {
      });
      setUserCertainlyChecked(true);
    }
    loggingInRef.current = loggingIn;
  }, [loggingIn, user]);
  return { user, isLoading: loggingIn, userCertainlyChecked };
};

const AuthStack_ = createStackNavigator();

const AppStack_ = createStackNavigator();

const screenOptions = {
  headerStyle: {
    backgroundColor: backgroundTitle,
  },
  headerTitleAlign: 'center',
  headerTintColor: '#fff',
};

/*
titleStyle: {
  flex: 1,
  textAlign: 'center',
},
 */

const AppStack = <>
  <AppStack_.Screen
    name="Home"
    component={UploadPage}
  />
  <AppStack_.Screen name={SETTINGS_PAGE} component={SignOut} />
  <AppStack_.Screen name={CAMERA_MODE_PAGE} component={CameraMode} />
  <AppStack_.Screen name={CACHING_VIDEO_PAGE} component={CachingVideo} />
  <AppStack_.Screen name={STUDENT_SELECT_PAGE} component={StudentSelect} />
  <AppStack_.Screen name={CATEGORY_SELECT_PAGE} component={CategorySelect} />
  <AppStack_.Screen name={SONG_SELECT_PAGE} component={SongSelect} />
  <AppStack_.Screen name={COMMENTS_PAGE} component={Comments} />
  <AppStack_.Screen name={SUMMARY_PAGE} component={Summary} />
</>;

const Stack = createStackNavigator();

const App = () => {
  const { user, isLoading, userCertainlyChecked } = useUser();
  const isConnected = useIsConnected();
  return (
      <>
        {isLoading || !userCertainlyChecked ? <View>
          <Text>
            Loading...
          </Text>
        </View> : null}
        {!isConnected && <View><Text>Internet is not connected...</Text></View>}
        <NavigationContainer>
          <Stack.Navigator screenOptions={screenOptions}>
            {!user ? (
                // No token found, user isn't signed in
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
            ) : (
                // User is signed in
                AppStack
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </>

  );
}

export default App;
