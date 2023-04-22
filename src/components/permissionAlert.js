import { Alert, Linking } from "react-native";

export default () => {
  Alert.alert(
    'Alert',
    'Want to grant the necessary permissions to the FiddleQuest for Teachers App?',
    [
      { text: 'Visit app settings', onPress: () => Linking.openURL('app-settings:') },
      { text: 'Cancel' },
    ],
    { cancelable: true }
  );
};

