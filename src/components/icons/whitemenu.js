import React, { memo } from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const Whitemenu = memo(() => {
  return (
    <View>
      <Svg width="24" height="24" viewBox="0 0 24 24">
        <Path d="M0 0h24v24H0z" fill="none"/>
        <Path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" fill="#ffffff"/>
      </Svg>
    </View>
  );
})

export default Whitemenu;