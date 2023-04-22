import { registerRootComponent } from 'expo';
import React from 'react';
import AppNavigator from '../App';

let navigatorRef;

export const getNavigatorRef = () => navigatorRef;

class App extends React.Component {

  render() {
    return <AppNavigator ref={nav => { navigatorRef = nav; }} />;
  }
}

registerRootComponent(App);