import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export default class NewSongIcon extends React.PureComponent {
  render() {
    return (
      <View>
        <Svg width="24" height="24" viewBox="0 0 24 24">
          <Path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="#ffffff"/>
          <Path d="M0 0h24v24H0z" fill="none"/>
        </Svg>
      </View>
    );
  }
}