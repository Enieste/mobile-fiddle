import React, { PureComponent } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { fontColor, inputFont } from '../colorSets';

export default class SearchInput extends PureComponent {
  render() {
    const { onChange, value } = this.props;
    return (<View style={styles.searchContainer}>
      <View style={styles.searchIcon}>
        <Icon
          title="Search"
          name="search"
          size={14}
          color={fontColor}
        />
      </View>
      <TextInput
        style={styles.textInput}
        onChangeText={onChange}
        value={value}
        underlineColorAndroid='rgba(0,0,0,0)'
        placeholder='Search'
        placeholderTextColor={fontColor}
        clearButtonMode='always'
      />
    </View>);
  }
}

const styles = StyleSheet.create({
  searchContainer: {
    flex: 0,
    flexDirection: 'row',
    margin: 10,
  },
  textInput: {
    flex: 1,
    height: 40,
    paddingTop: 10,
    paddingRight: 10,
    paddingBottom: 10,
    paddingLeft: 0,
    borderRadius: 10,
    borderBottomLeftRadius: 0,
    borderTopLeftRadius: 0,
    backgroundColor: inputFont,
    alignItems: 'center',
  },
  searchIcon: {
    height: 40,
    borderRadius: 10,
    borderBottomRightRadius: 0,
    borderTopRightRadius: 0,
    padding: 10,
    flex: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: inputFont,
  },
});