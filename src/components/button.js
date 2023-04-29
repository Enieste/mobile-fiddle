import React, { PureComponent } from 'react';
import { View, Platform, TouchableOpacity, Text, Button, StyleSheet } from 'react-native';
import { iconFont } from "../colorSets";


export default (onClick, label, color) => {
  return Platform.select({
    ios: () => {
      return (<TouchableOpacity style={styles.buttonIos} onPress={onClick}>
        <Text style={styles.buttonText}>{label}</Text>
      </TouchableOpacity>)
    },
    android: () => {
      return <View style={styles.buttonAndroid}>
        <Button
          onPress={onClick}
          title={label}
          color={color}
        />
      </View>
    },
  })();
};

const styles = StyleSheet.create({
  buttonIos: {
    flex: 0,
    backgroundColor: iconFont,
    width: '80%',
    paddingVertical: 18,
    alignItems: 'center',
    marginVertical: 20,
    borderRadius: 10,
  },
  buttonAndroid: {
    flex: 0,
    width: '70%',
    marginVertical: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
  },
});