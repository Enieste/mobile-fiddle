import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Platform,
  ActivityIndicator
} from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { useKeepAwake } from 'expo-keep-awake';
import last from 'lodash/last';
import find from 'lodash/find';
import debounce from 'lodash/debounce';
import Icon from 'react-native-vector-icons/FontAwesome';
import { inputFont, fontColor } from "../colorSets";
import { durationToStr } from '../lib/utils';
import permissionAlert from '../components/permissionAlert';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import LoadingView from "../components/loadingView";
const { getPlatformOrientationLockAsync } = ScreenOrientation;
const isAndroid = Platform.OS === 'android';

const desiredRatioH = [4, 3];
const desiredRatioV = [3, 4];

const useVideoDurationCount = () => {
  const [duration, setDuration] = useState(0);
  const [isCounting, setCounting] = useState(false);
  const intervalRef = useRef();

  const startTimer = () => {
    if (isCounting) return;
    intervalRef.current = setInterval(() => {
      setDuration(((d) => d + 1000));
    }, 1000);
    setCounting(true);
  };

  const stopTimer = () => {
    if (!isCounting) return;
    setCounting(false);
    clearInterval(intervalRef.current);
  };

  const resetTimer = () => {
    setDuration(0);
  }

  return [duration, startTimer, stopTimer, resetTimer];
}

const getRatioStrings = (n1, n2) => [[n1, n2], [n2, n1]].map(([first, second]) => `${first}:${second}`);

const useToggleOrientationMode = () => {
  const toggleToLandscape = async () => {
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
  };
  const toggleToPortrait = async () => {
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  }
  useFocusEffect(useCallback(() => {
    toggleToLandscape();
    return () => {
      return toggleToPortrait();
    }
  }, [])) // toggle orientation on screen change
};

const useIosLockUnlockCameraRenderBugFix = ({ isPermGranted, isCameraReady }) => {
  const navigation = useNavigation();
  useEffect(() => {
    if (isAndroid) return;
    const timer = setTimeout(() => {
      if(isPermGranted && !isCameraReady) {
        navigation.goBack();
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [isPermGranted, isCameraReady]);
};

const useOrientation = () => {
  const [orientation, setOrientation] = useState(
      ScreenOrientation.Orientation.PORTRAIT_UP
  );
  const dimensions = Dimensions.get('window');
  useEffect(() => {
    // set initial orientation
    ScreenOrientation.getOrientationAsync().then((info) => {
      setOrientation(info.orientation);
    });
  }, []);

  useEffect(() => {
    if (isAndroid) return;
    const getAndSetCurrentOrientation = async() => {
      const currentOrientation = await getPlatformOrientationLockAsync();
      const promise = new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve('foo');
          setOrientation(currentOrientation.screenOrientationArrayIOS[0]);
        }, 100); // for ios, otherwise camera sometimes is rendered incorrect
      });
    };
    getAndSetCurrentOrientation();
  }, [dimensions.width]);
  return orientation;
};

const usePermissionsGuard = () => {
  const [isPermGranted, setPermGranted] = useState(null);
  const ps = [
    Camera.useCameraPermissions(),
    Camera.useMicrophonePermissions(),
    MediaLibrary.usePermissions()
  ];
  useEffect(() => {
    const askPermissions = async () => {
      if (!ps.map(([p]) => !!p).every(Boolean)) {
        console.log('permissions not ready to read');
        return;
      }
      console.log('permissions ready to read');
      const res = await Promise.all(
          ps.map(async ([p, ask]) => {
            return !p.granted ? (await (async () => {
              const perms = await ask();
              if (!perms) throw new Error('perms are certainly here but they are not here')
              return perms;
            })()).granted : true
          })
      );
      const allGranted = res.every(Boolean);
      if (allGranted) {
        setPermGranted(true);
      }
      // handled somehow differently TODO check it
      if (!isAndroid && !allGranted) {
        console.log("PERMISSION ALERT")
        permissionAlert();
      }
    }
    void askPermissions();
  }, ps.map(p => p && p[0]?.granted))
  return isPermGranted;
};

const getSupportedRatiosAsync = async (cameraRef) => {
  return await Platform.select({
    ios: () => Promise.resolve(Platform.isPad ? getRatioStrings(3, 4) : getRatioStrings(9, 16)),
    android: () => cameraRef.current.getSupportedRatiosAsync()
  })();
};

const getRatio = async (cameraRef, isOrientationVertical) => {
  const ratios = (await getSupportedRatiosAsync(cameraRef))
      .map(r => r.split(':').map(Number)).filter(([r1, r2]) => isOrientationVertical ? r1 < r2 : r1 > r2);
  const desiredRatio = isOrientationVertical ? desiredRatioV : desiredRatioH;
  return find(ratios, r => r[0] === desiredRatio[0] && r[1] === desiredRatio[1]) || last(ratios);
};

const useOnOrientationSet = () => {
  const [ratio, setRatio] = useState(undefined);
  const [width, setWidth] = useState(undefined);
  const [height, setHeight] = useState(undefined);
  const orientationSet = async (cameraRef) => {
    const { width, height } = Dimensions.get('window')
    const isOrientationVertical = width < height;
    const [r1, r2] = await getRatio(cameraRef, isOrientationVertical);
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

    setRatio('' + r1 + ':' + r2);
    setWidth(isOrientationVertical ? vertical.width : horizontal.width);
    setHeight(isOrientationVertical ? vertical.height : horizontal.height);

  };
  return {
    orientationSet,
    width,
    height,
    ratio
  };
};

const CameraMode = () => {
  const [shooting, setShooting] = useState(false);
  const [isCameraReady, setCameraReady] = useState(false);

  const navigation = useNavigation();

  const isPermGranted = usePermissionsGuard();
  // ios, sometimes when a user locks/unlocks the screen in phone settings, the camera won't render from the first attempt
  useIosLockUnlockCameraRenderBugFix({ isPermGranted, isCameraReady });
  const orientation = useOrientation();
  useKeepAwake();
  useToggleOrientationMode();
  const isFocused = useIsFocused();

  const cameraRef = useRef(null);
  const videoPromiseRef = useRef(null);

  const {
    orientationSet,
    width,
    height,
    ratio
  } = useOnOrientationSet();

  const onCameraReady = async () => {
    await orientationSet(cameraRef);
    setCameraReady(true);
  };

  const onMountError = () => {
    navigation.goBack();
  };

  const toggleRecord = () => {
    (shooting ? stopShooting : startShooting)();
  };

  const handleRecordOrStopPress = debounce(toggleRecord, 500, { leading: true, trailing: false });

  const recordingConfig = {
    quality: Camera.Constants.VideoQuality['720p'],
  };

  const [duration, startTimer, stopTimer, resetTimer] = useVideoDurationCount();

  const startShooting = () => {
    if (shooting) return;
    setShooting(true);
    startTimer();
    videoPromiseRef.current = cameraRef.current.recordAsync(isAndroid && recordingConfig);
  };

  const stopSequence = () => {
    stopTimer();
    resetTimer();
  };

  const stopShooting = () => {
    if (!shooting) return;
    stopSequence();
    cameraRef.current.stopRecording();
    setShooting(false);
    return videoPromiseRef.current.then(res => {
      videoPromiseRef.current = null;
      console.log('result', res);
      navigation.navigate('CachingVideo', { videoForSaveUri: res.uri });
    });
  };

  const back = () => {
    if (!shooting) {
      navigation.goBack();
    } else {
      stopSequence();
      cameraRef.current.stopRecording();
      // on Duane's pixel (and only there so far) there's a bug after clicking "back" during shooting that we can't reproduce anywhere
      // we add a magic timeout here because the theories are:
      // 1) some setState isn't actually set on Pixel yet e.g. .then may go synchronously
      // 2) some handlers aren't cleared up after stopping shooting
      videoPromiseRef.current.then(res => {
        videoPromiseRef.current = null;
        setTimeout(() => {
          // and also purposely clear cameraRef JUST IN CASE
          cameraRef.current = null;
          navigation.goBack();
        }, 300);
      });
    }
  };

  const isReadyForCamera = () => {
    return isAndroid || orientation === 4;
  }

  // don't draw camera in the background
  if (!isFocused) return null;
  if (isPermGranted === null) {
    return <LoadingView text="Waiting for permissions" />
  } else if (isPermGranted === false) {
    return <Text>No access to camera</Text>;
  } else {
    return (
      <View style={styles.container}>
        {!isCameraReady ? <LoadingView text='Waiting for camera' /> : null}
        <StatusBar hidden/>
        <TouchableOpacity style={styles.backButton} onPress={back}>
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
        { isReadyForCamera() ? <Camera
          responsiveOrientationWhenOrientationLocked={true}
          ratio={ratio}
          ref={cameraRef}
          style={[styles.camera, { opacity: width && height && ratio ? 1 : 0, width, height, maxWidth: width, maxHeight: height }]}
          type={Camera.Constants.Type.back}
          onCameraReady={onCameraReady}
          onMountError={onMountError}
        >
          <View
            style={[styles.buttonContainer]}>
            <TouchableOpacity
              style={styles.flipButton}
              onPress={handleRecordOrStopPress}>
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
              <Text style={styles.timerText}>{durationToStr(duration)}</Text>
            </View>
          </View>
        </Camera> : <View>
      <Text>Waiting for orientation</Text>
    </View>}
      </View>
    );
  }
}

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

export default CameraMode;