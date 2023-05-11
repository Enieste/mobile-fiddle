import React from 'react';
import Svg, { Path, G, Circle } from 'react-native-svg';
import responsiveWidthHeight from '../wrappers/responsiveWidthHeight';
import { iconFont } from '../../colorSets';

const Icon = responsiveWidthHeight(({ width, height }) =>
  <Svg width={width} height={height} viewBox="0 0 104 145">
    <G fill="#5591BB" fillRule="evenodd" transform="scale(0.4) translate(80, 90)">
      <Circle
        cx="52"
        cy="72"
        r="72"
        fill={iconFont}
      />
      <G fill="#FFFFFF" fillRule="nonzero" transform="scale(0.5) translate(52, 65)">
        <Path d="m0.048028 143.97v-5.535c0-29.912 0.022-59.825-0.048-89.738-5e-3 -2.223 0.665-2.859 2.839-2.83 7.997 0.109 15.997 0.041 23.996 0.047 0.666 0 1.332 0.045 1.998 0.074 1.911 0.084 3.245 1.234 2.85 2.962-0.252 1.104-1.777 2.479-2.927 2.698-2.252 0.426-4.642 0.131-6.975 0.132-5.153 1e-3 -10.307 0-15.823 0v2.617c0 27.08 0.025 54.16-0.048 81.24-6e-3 2.174 0.759 2.632 2.736 2.629 28.912-0.047 57.825-0.047 86.738 4e-3 1.898 4e-3 2.609-0.411 2.604-2.486-0.068-27.33-0.045-54.659-0.046-81.989v-2.004c-2.373 0-4.511 2e-3 -6.649 0-5.166-6e-3 -10.332-0.035-15.498-8e-3 -2.005 0.011-3.59-0.608-3.641-2.826-0.051-2.248 1.616-2.965 3.543-2.974 8.665-0.044 17.33 3e-3 25.996-0.061 2.093-0.016 2.169 1.168 2.168 2.747-0.024 16.248-6e-3 32.496-2e-3 48.744 2e-3 14.498-0.048 28.996 0.052 43.494 0.017 2.308-0.465 3.126-2.967 3.12-32.663-0.085-65.325-0.057-97.988-0.057h-2.908z" />
        <Path d="m48.333 13.539c-0.78 0.72-1.588 1.412-2.336 2.164-4.696 4.721-9.378 9.457-14.065 14.187-0.235 0.236-0.467 0.476-0.712 0.7-1.352 1.233-2.89 1.512-4.232 0.219-1.324-1.275-1.304-2.916 0.01-4.23 8.116-8.128 16.276-16.212 24.428-24.304 0.106-0.105 0.297-0.124 0.681-0.275 0.648 0.569 1.418 1.175 2.108 1.862 7.247 7.236 14.481 14.485 21.718 21.731 0.352 0.354 0.738 0.687 1.027 1.088 0.963 1.338 1.326 2.816 0.055 4.08-1.329 1.322-2.916 1.179-4.232-0.087-2.517-2.424-4.968-4.919-7.411-7.419-3.239-3.315-6.445-6.663-9.665-9.997-0.246 0.114-0.492 0.229-0.738 0.344-0.058 1.02-0.164 2.038-0.165 3.057-0.017 24.313-0.022 48.627-0.03 72.94 0 0.666 1e-3 1.332-5e-3 1.998-0.018 1.824-0.787 3.163-2.718 3.213-2.034 0.053-2.956-1.206-2.955-3.204 5e-3 -8.076-6e-3 -16.153-4e-3 -24.23 4e-3 -16.902 0.013-33.805 0.02-50.708 1e-3 -0.957 0-1.914 0-2.87-0.259-0.087-0.519-0.173-0.779-0.259" />
      </G>
    </G>
  </Svg>);

export default class IosUploadIcon extends React.PureComponent {
  render() {
    return (<Icon />);
  }
};