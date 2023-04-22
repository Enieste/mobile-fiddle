import React, { Component, PureComponent } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import get from 'lodash/get';
import omit from 'lodash/omit';
import { HeaderBackButton, NavigationActions, StackActions, withNavigationFocus } from 'react-navigation';
import { AndroidBackHandler } from 'react-navigation-backhandler';
import { backgroundMain, fontColor } from '../colorSets';
import { getNavigatorRef } from "../entry";
import appStore from "../mobx/appStore";


const categories = [
  {
    title: 'Songs',
    id: 'song',
    section: 'Songs'
  }, {
    title: 'Scales',
    id: 'scale',
    section: 'Skills'
  }, {
    title: 'Harmony',
    id: 'harmony',
    section: 'Skills'
  }, {
    title: 'Comping',
    id: 'comping',
    section: 'Skills'
  }, {
    title: 'Style',
    id: 'style',
    section: 'Skills'
  }, {
    title: 'Teaching',
    id: 'teaching',
    section: 'Social'
  }, {
    title: 'Performing',
    id: 'performing',
    section: 'Social'
  }, {
    title: 'Collaboration',
    id: 'collaboration',
    section: 'Social'
  }, {
    title: 'Q & A',
    id: 'questions',
    section: 'Social'
  }, {
    title: 'Other',
    id: 'other',
    section: 'Social'
  },
];

const sections = ['Songs', 'Skills', 'Social'];

class CategorySelect extends Component {

  selectCategory = (category) => {
    const path = category.section === 'Social' ? 'Comments' : 'SongSelect';
    const videoUri = get(this.props, ['navigation', 'state', 'params', 'videoUri']);
    const studentIds = get(this.props, ['navigation', 'state', 'params', 'studentIds']);
    this.props.navigation.navigate(path, {
      videoUri,
      studentIds,
      category,
      ...category.section === 'Social' && { title: category.title }
    });
  };

  onBackButtonPressAndroid = () => {
    const isOnly = get(this.props, ['navigation', 'state', 'params', 'onlyStudent']);
    if (isOnly) {
      this.props.navigator.popToTop();
      return true;
    }
    return false;
  };

  renderList = (section) => {
    const filteredCategories = categories.filter(c => c.section === section);
    return <View key={section}>
      <View style={styles.sectionLabel}>
        <Text style={styles.sectionText}>{section}</Text>
      </View>
      <FlatList
        scrollEnabled={false}
        style={styles.list}
        data={filteredCategories}
        renderItem={({ item }) => <TouchableOpacity onPress={() => this.selectCategory(item)}>
          <View style={styles.category}>
            <Text style={styles.categoryName} key={item.id}>{item.title}</Text>
          </View>
        </TouchableOpacity>}
        keyExtractor={(item) => item.id }
      />
    </View>
  };


  render() {
    return <AndroidBackHandler onBackPress={this.onBackButtonPressAndroid}>
      <View style={styles.page}>
        { categories.length ? <View style={styles.container}>
            { sections.map(section => this.renderList(section)) }
        </View> : <View style={styles.loading}>
          <Text>Loading...</Text>
        </View> }
      </View>
    </AndroidBackHandler>
  }
}

class BackButton extends PureComponent {
  onPress = () => {
    const goBack = () => getNavigatorRef().dispatch(StackActions.reset({ // this is react-navigation's dispatch
      index: 0,
      actions: [NavigationActions.navigate({routeName: 'Home'})],
    }));
    goBack();
  };
  render() {
    return <HeaderBackButton
      {...omit(this.props, 'onPress')}
      onPress={this.onPress}
    />
  }
}

CategorySelect.navigationOptions = () => ({
  title: 'Select Category',
  headerRight: <View />,
  ...appStore.get('isOneStudent') && { headerLeft: BackButton }
});

const styles = StyleSheet.create({
  page: {
    backgroundColor: backgroundMain,
    height: '100%',
  },
  container: {
    padding: 10,
  },
  category: {
    flex: 1,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: fontColor,
    borderBottomWidth: 0.5,
  },
  categoryName: {
    fontSize: 16,
  },
  list: {
    margin: 10,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: {
    paddingTop: 10,
  },
  sectionText: {
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
  }
});

export default withNavigationFocus(CategorySelect);
