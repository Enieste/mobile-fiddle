import React, { PureComponent } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Dimensions, StatusBar, Platform } from 'react-native';
import { ScreenOrientation } from 'expo';
import { Camera } from 'expo-camera';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import * as Permissions from 'expo-permissions';
import last from 'lodash/last';
import find from 'lodash/find';
import debounce from 'lodash/debounce';
import every from 'lodash/every';
import Icon from 'react-native-vector-icons/FontAwesome';
import { withNavigationFocus } from '@react-navigation/compat';
import { inputFont, fontColor } from "../colorSets";
import { durationToStr } from '../lib/utils';
import permissionAlert from '../components/permissionAlert';

const isAndroid = Platform.OS === 'android';

const desiredRatioH = [4, 3];
const desiredRatioV = [3, 4];

const getRatioStrings = (n1, n2) => [[n1, n2], [n2, n1]].map(([first, second]) => `${first}:${second}`);

async function toggleOrientationMode(nextProps, oldProps, dimensionListener) {
  if (nextProps.isFocused && !oldProps.isFocused) {
    await ScreenOrientation.lockAsync(isAndroid ? ScreenOrientation.OrientationLock.LANDSCAPE_LEFT : ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
    Dimensions.addEventListener('change', dimensionListener);
  } else if (!nextProps.isFocused && oldProps.isFocused) {
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    Dimensions.removeEventListener('change', dimensionListener);
  }
}

class CameraMode extends PureComponent {
  static navigationOptions = {
    headerStyle: {
      display: 'none'
    },
  };
  state = {
    hasCameraPermission: null,
    type: Camera.Constants.Type.back,
    shooting: false,
    duration: 0,
    isOrientationVertical: true,
  };

  initCamera = (ref) => {
    this.camera = ref;
  };

  onCameraReady = async () => {
    await this.orientationSet(Dimensions.get('window'));
  };

  dimensionListener = async(e) => {
    return await this.orientationSet(e.window);
  };

  getSupportedRatiosAsync = async () => {
    return await Platform.select({
      ios: () => Promise.resolve(Platform.OS.isPad ? getRatioStrings(3, 4) : getRatioStrings(9, 16)),
      android: () => this.camera.getSupportedRatiosAsync()
    })();
  };

  getRatio = async (isOrientationVertical) => {
    const ratios = (await this.getSupportedRatiosAsync())
      .map(r => r.split(':').map(Number)).filter(([r1, r2]) => isOrientationVertical ? r1 < r2 : r1 > r2);
    const desiredRatio = isOrientationVertical ? desiredRatioV : desiredRatioH;
    return find(ratios, r => r[0] === desiredRatio[0] && r[1] === desiredRatio[1]) || last(ratios);
  };

  orientationSet = async ({ width, height }) => {
    const isOrientationVertical = width < height;
    const [r1, r2] = await this.getRatio(isOrientationVertical);
    const width1 = width;
    const height1 = width1 * r1 / r2;
    const height2 = height;
    const width2 = height2 * r1 / r2;

    const vertical = {
      width: width1,
      height: height1,
    };

    const horizontal = {
      width: width2,
      height: height2,
    };

    this.setState({
      isOrientationVertical,
      ratio: '' + r1 + ':' + r2,
      ...(isOrientationVertical ? vertical : horizontal),
    });
  };

  async componentWillMount() {

    const permissions = [Permissions.CAMERA, Permissions.AUDIO_RECORDING, Permissions.CAMERA_ROLL];

    const results = await permissions.reduce((acc, p) => acc.then(
      results => Permissions.askAsync(p).then(r => results.concat([r]))
    ), Promise.resolve([]));

    const permissionsGranted = every(results, r => r.status === 'granted');
    this.setState({ hasCameraPermission:
      permissionsGranted,
    });
    if (!isAndroid && !permissionsGranted) {
      permissionAlert();
    }
    const toggle = toggleOrientationMode(this.props, {
      isFocused: false
    }, this.dimensionListener);
  }

  componentWillReceiveProps(nextProps) {
    toggleOrientationMode(nextProps, this.props, this.dimensionListener);
    if(!this.props.isFocused && nextProps.isFocused) {
      activateKeepAwake();
    }
    if(this.props.isFocused && !nextProps.isFocused) {
      deactivateKeepAwake();
    }
  }

  setVideoDurationCount = () => {
    this.interval = setInterval(() => {
      this.setState({
        duration: this.state.duration + 100,
      })
    }, 100);
  };

  toggleRecord = () => {
    const { shooting } = this.state;
    (shooting ? this.stopShooting : this.takeVideo)();
  };

  handleRecordOrStopPress = debounce(this.toggleRecord, 500, { leading: true, trailing: false });

  takeVideo = () => {
    const recordingConfig = {
      quality : Camera.Constants.VideoQuality['720p'],
    };
    if (this.state.shooting) return;
    if (this.camera) {
      this.setState({
        shooting: true,
      }, async () => {
        this.setVideoDurationCount();
        // const result = await this.camera.recordAsync(recordingConfig);
        this.camera.recordAsync(isAndroid && recordingConfig).then(res => {
          if (!this.props.isFocused) return; // recordingAsync will be resolved on camera component unmount
          console.log('result', res)
          this.props.navigation.navigate('CachingVideo', { videoForSaveUri: res.uri });
        })
      });
    }
  };

  stopShooting = () => {
    if (!this.state.shooting) return;
    clearInterval(this.interval);
    this.setState({ duration: 0 });
    // if (!isFocused) return;
    this.camera.stopRecording();
    this.setState({
      shooting: false,
    });
  };

  back = () => {
    const { goBack, state } = this.props.navigation;
    if (this.state.shooting) this.camera.stopRecording();
    const params = state.params || {};
    goBack(params.go_back_key);
  };

  render() {
    const { isFocused } = this.props;
    const { hasCameraPermission, shooting, isOrientationVertical, width, height, ratio } = this.state;
    if (hasCameraPermission === null) {
      return <View>
        <Text>Waiting for camera</Text>
      </View>;
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    } else {
      return ( isFocused &&
        <View style={styles.container}>
          <StatusBar hidden />
          <TouchableOpacity style={styles.backButton} onPress={this.back}>
            <Icon
              title="Info"
              name='arrow-left'
              size={16}
              color={fontColor}
              style={{ marginRight: 5 }}
            />
            <Text style={styles.backButtonText}>Cancel</Text>
          </TouchableOpacity>
          <View style={styles.warning}>
            <Text style={styles.warningText}>
              Use in landscape only
            </Text>
          </View>
          <Camera
            ratio={ratio}
            ref={this.initCamera}
            style={[styles.camera, { width, height, maxWidth: width, maxHeight: height }]}
            type={Camera.Constants.Type.back}
            onCameraReady={this.onCameraReady}
          >
            <View
              style={[styles.buttonContainer]}>
              <TouchableOpacity
                style={styles.flipButton}
                onPress={this.handleRecordOrStopPress}>
                <Icon
                  title="Info"
                  name={shooting ? 'square' : 'circle'}
                  size={shooting ? 30 : 45}
                  color='red'
                />
              </TouchableOpacity>
            </View>
            <View style={styles.timerContainer}>
              <View style={styles.timer}>
                <Text style={styles.timerText}>{durationToStr(this.state.duration)}</Text>
              </View>
            </View>
          </Camera>
        </View>
      );
    }
  }
}

export default withNavigationFocus(CameraMode);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: '100%',
    width: '100%',
    backgroundColor: '#767676',
  },
  camera: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipButton: {
    flex: 1,
    maxHeight: 60,
    maxWidth: 60,
    height: 60,
    width: 60,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderColor: 'white',
    borderWidth: 5,
  },
  buttonContainer: {
    bottom: '2%',
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'flex-end',
    margin: 30,
  },
  hide: {
    display: 'none',
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    flex: 0,
    flexDirection: 'row',
    zIndex: 1000,
    padding: 10,
    backgroundColor: inputFont,
    borderRadius: 10,
  },
  backButtonText: {
    color: fontColor,
  },
  timerContainer: {
    position: 'absolute',
    top: 5,
    width: '100%',
    height: '20%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    zIndex: 999,
  },
  timer: {
    zIndex: 999,
    paddingHorizontal: 10,
    paddingVertical: 2,
    backgroundColor: 'black',
    opacity: 0.5,
    borderRadius: 10,
  },
  timerText: {
    color: 'white',
  },
  warning: {
    position: 'absolute',
    top: 10,
    right: 15,
    flex: 0,
    flexDirection: 'row',
    zIndex: 1000,
    padding: 10,
    backgroundColor: inputFont,
    borderRadius: 10,
  },
  warningText: {
    color: fontColor,
  }
});