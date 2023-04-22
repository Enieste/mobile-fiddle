import React from 'react';
import Svg, { Path, G, Circle } from 'react-native-svg';
import responsiveWidthHeight from '../wrappers/responsiveWidthHeight';
import { iconFont } from '../../colorSets';

const Icon = responsiveWidthHeight(({ width, height }) =>
  <Svg width={width} height={height} viewBox="0 0 216 140">
    <G fill="none" fillRule="evenodd">
      <Circle
        cx="108"
        cy="70"
        r="108"
        fill={iconFont}
      />
      <G fill="#FFFFFF" fillRule="nonzero" transform="scale(0.5) translate(112, 70)">
        <Path d="m207.5 108.72v-85.438l-54 27v-39.281c0-5.799-4.701-10.5-10.5-10.5h-132c-5.799 0-10.5 4.701-10.5 10.5v110c0 5.799 4.701 10.5 10.5 10.5h132c5.799 0 10.5-4.701 10.5-10.5v-39.281l54 27z"/>
      </G>
    </G>
  </Svg>);

export default class CameraIcon extends React.PureComponent {
  render() {
    return (<Icon />);
  }
};