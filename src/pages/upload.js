import React, { PureComponent } from 'react';
import { Text, View, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import * as Permissions from 'expo-permissions';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import UploadProgresses from '../components/uploadProgresses';
import { backgroundMain, backgroundGray, iconFont } from '../colorSets';
import WhiteMenu from '../components/icons/whitemenu';
import CameraIcon from '../components/icons/camera';
import uploadStore from '../mobx/uploadsStore';
import permissionAlert from '../components/permissionAlert';

const UploadIcon = Platform.select({
  ios: () => require('../components/icons/iosUploadIcon').default,
  android: () => require('../components/icons/uploadIcon').default,
})();

const isAndroid = Platform.OS === 'android';

const styles = StyleSheet.create({
  title: {
    padding: 10,
    paddingLeft: 17,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: backgroundMain,
    width: '100%',
    height: '100%',
  },
  list: {
    height: '60%',
    flex: 1,
    width: '90%',
    margin: 30,
    alignSelf: 'center',
  },
  upload: {
    flex: 0,
    flexDirection: 'row',
    margin: 30,
    width: '90%',
    maxHeight: '30%',
    height: '30%',
    padding: 10,
  },
  gallery: {
    flex: 1,
    flexDirection: 'column',
    width: '50%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    flexDirection: 'column',
    width: '50%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    flex: 0,
    backgroundColor: backgroundGray,
    borderRadius: 10,
  },
  text: {
    fontSize: 16,
    color: iconFont,
    textAlign: 'center',
  },
  bold: {
    fontWeight: 'bold',
  },
  watermark: {
    position: 'absolute',
    top: '-5%',
    left: 0,
    width: '100%',
    height: '100%',
    paddingHorizontal: 20,
  },
  icon: {
    marginBottom: 5,
    fontSize: 40,
  },
  iconContainer: {
    width: '45%',
    maxHeight: '60%',
    flex: 1,
    aspectRatio: 1,
    marginBottom: 10,
  }
});

class UploadPage extends PureComponent {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Upload Queue',
      headerLeft: (
        <TouchableOpacity style={styles.title} onPress={() => navigation.navigate('Settings')}>
          <WhiteMenu />
        </TouchableOpacity>
      ),
      headerRight: (<View />) // for centered title
    };
  };

  componentDidMount () {
    FileSystem.readDirectoryAsync(FileSystem.cacheDirectory).then(res => {
      console.log('cache', res);
      if (res) res.map(cat => {
        FileSystem.deleteAsync(FileSystem.cacheDirectory + cat).then(() => console.log(cat, 'cleared'));
      })
    }) // video files stay in cache if upload progress wasn't ended
  }

  pickVideo = async () => {
    const roll = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    this.setState({ hasCameraRollPermission: roll.status === 'granted',
    });
    if (!isAndroid && roll.status !== 'granted') {
      permissionAlert();
    }
    uploadStore.clearCompleted();
    const resultPromise = ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
    });

    this.props.navigation.navigate('CachingVideo', { videoUriPromise: resultPromise });
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.watermark}>
          <Image
            style={{ flex:1, height: undefined, width: undefined }}
            resizeMode="contain"
            source={require('../assets/wordmark-for-main-page.png')}
          />
        </View>
        <View style={styles.list}>
          <View style={styles.background}>
            <UploadProgresses />
          </View>
        </View>
        <View style={[styles.upload, styles.background]}>
          <TouchableOpacity
            style={styles.gallery}
            onPress={this.pickVideo}
          >
            <View style={styles.iconContainer}>
              <UploadIcon />
            </View>
            <Text style={styles.text}>{`Upload from\n${isAndroid ? 'Gallery' : 'Camera Roll'}`}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.camera}
            onPress={() => this.props.navigation.navigate('CameraMode')}
          >
            <View style={styles.iconContainer}>
              <CameraIcon />
            </View>
            <Text style={[styles.text, styles.bold]}>Shoot new{"\n"}video</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

export default UploadPage;
