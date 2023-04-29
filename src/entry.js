import { registerRootComponent } from 'expo';
import React from 'react';
import AppNavigator from '../App';

let navigatorRef;

export const getNavigatorRef = () => navigatorRef;

const App = () => <AppNavigator />;

registerRootComponent(App);