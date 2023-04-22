import React, { PureComponent } from 'react';
import { View } from 'react-native';

export default (C) => class ResponsiveWidthHeight extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      width: undefined,
      height: undefined,
      canBeShown: false,
    };
  }

  calculateWH = (event) => {
    const { width, height } = event.nativeEvent.layout;
    this.setState({
      canBeShown: width && height,
      width,
      height,
    });
  };

  render() {
    const { width, height } = this.state;
    return <View onLayout={this.calculateWH} style={{ width: '100%',
      height: '100%',
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      { this.state.canBeShown && <C
          {...this.props}
          width={width.toString()}
          height={height.toString()}
        />
      }
    </View>
  }
}