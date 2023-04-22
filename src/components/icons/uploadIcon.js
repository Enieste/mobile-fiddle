import React from 'react';
import Svg, { Path, G, Circle } from 'react-native-svg';
import responsiveWidthHeight from '../wrappers/responsiveWidthHeight';
import { iconFont } from '../../colorSets';

const Icon = responsiveWidthHeight(({ width, height }) =>
  <Svg width={width} height={height} viewBox="0 0 183 184">
    <G fill="none" fillRule="evenodd">
      <Circle
        cx="92"
        cy="92"
        r="87"
        fill="none"
        stroke={iconFont}
        fillOpacity="0"
        strokeWidth="5"
      />
      <G fill="#5591BB" fillRule="nonzero" transform="scale(0.5) translate(92, 92)">
        <Path d="m91.5 0.8c18.4 24.5 36.5 48.6 54.9 73.3h-36.5v73.2h-36.7v-73.1h-36.7c18.5-24.7 36.6-48.9 55-73.4z" />
        <Path d="m0.1 166h182.8v18h-182.8v-18z" />
      </G>
    </G>
  </Svg>);

export default class UploadIcon extends React.PureComponent {
  render() {
    return (<Icon />);
  }
};