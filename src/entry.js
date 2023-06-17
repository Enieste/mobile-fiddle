import { registerRootComponent } from 'expo';
import React from 'react';
import AppNavigator from '../App';

const App = () => <AppNavigator />;

registerRootComponent(App);