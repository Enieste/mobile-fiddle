import React, { PureComponent } from 'react';
import Meteor, { createContainer } from 'react-native-meteor';
import { createStackNavigator, createSwitchNavigator } from 'react-navigation';
import Expo, { AppLoading } from 'expo';
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

const development = 'ws://localhost:3000/websocket';
const staging = 'wss://app.staging.fiddlequest.com/websocket';
const production = 'wss://app.fiddlequest.com/websocket';

Meteor.connect(development);

class AuthLoadingScreen extends PureComponent {
  constructor(props) {
    super(props);
  }

  checkUserAndSwitch = (props) => {
    this.props.navigation.navigate(props.user ? 'App' : 'Auth');
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.loggingIn !== nextProps.loggingIn && !nextProps.loggingIn) {
      this.checkUserAndSwitch(nextProps);
    }
  }

  render() {
    return <AppLoading />;
  }
}

const appContainer = createContainer(params => {
  const user = Meteor.user();
  const loggingIn = Meteor.loggingIn();
  return {
    user,
    loggingIn,
  };
}, AuthLoadingScreen);

const AuthStack = createStackNavigator({ SignIn: SignIn });

const AppStack = createStackNavigator({
    Home: {
      screen: UploadPage,
    },
    Settings: {
      screen: SignOut,
    },
    CameraMode: {
      screen: CameraMode,
    },
    CachingVideo: {
      screen: CachingVideo,
    },
    StudentSelect: {
      screen: StudentSelect,
    },
    CategorySelect: {
      screen: CategorySelect,
    },
    SongSelect: {
      screen: SongSelect,
    },
    Comments: {
      screen: Comments,
    },
    Summary: {
      screen: Summary,
    }
  }, {
    initialRouteName: 'Home',
    navigationOptions: {
      headerStyle: {
        backgroundColor: backgroundTitle,
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        flex: 1,
        textAlign: 'center',
      },
    },
  }
);

export default createSwitchNavigator({
    AuthLoading: appContainer,
    App: AppStack,
    Auth: AuthStack,
  }, {
    initialRouteName: 'AuthLoading',
  }
);
