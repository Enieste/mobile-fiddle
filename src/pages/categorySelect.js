import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import get from 'lodash/get';
import omit from 'lodash/omit';
import { HeaderBackButton } from 'react-navigation-stack';
import { AndroidBackHandler } from 'react-navigation-backhandler';
import { backgroundMain, fontColor } from '../colorSets';
import appStore from "../mobx/appStore";
import { withNavigationFocus } from "@react-navigation/compat";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useGoBack } from "../lib/utils";


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

const CategorySelect = () => {
  const navigation = useNavigation();
  const route = useRoute();

  useEffect(() => {
    navigation.setOptions({
      title: 'Select Category',
      headerRight: () => (<View />),
      ...appStore.get('isOneStudent') && { headerLeft: () => (BackButton) }
    })
  }, [navigation])

  const selectCategory = (category) => {
    const path = category.section === 'Social' ? 'Comments' : 'SongSelect';
    const videoUri = get(route, ['params', 'videoUri']);
    const studentIds = get(route, ['params', 'studentIds']);
    navigation.navigate(path, {
      videoUri,
      studentIds,
      category,
      ...category.section === 'Social' && { title: category.title }
    });
  };

  const back = useGoBack();

  const BackButton = (props) => {
      return <HeaderBackButton
        {...omit(props, 'onPress')}
        onPress={back}
      />
    };

  const onBackButtonPressAndroid = () => {
    const isOnly = get(route, ['params', 'onlyStudent']);
    if (isOnly) {
      back();
      return true;
    }
    return false;
  };

  const renderList = (section) => {
    const filteredCategories = categories.filter(c => c.section === section);
    return <View key={section}>
      <View style={styles.sectionLabel}>
        <Text style={styles.sectionText}>{section}</Text>
      </View>
      <FlatList
        scrollEnabled={false}
        style={styles.list}
        data={filteredCategories}
        renderItem={({ item }) => <TouchableOpacity onPress={() => selectCategory(item)}>
          <View style={styles.category}>
            <Text style={styles.categoryName} key={item.id}>{item.title}</Text>
          </View>
        </TouchableOpacity>}
        keyExtractor={(item) => item.id }
      />
    </View>
  };

  return <AndroidBackHandler onBackPress={onBackButtonPressAndroid}>
    <View style={styles.page}>
      { categories.length ? <View style={styles.container}>
        { sections.map(section => renderList(section)) }
      </View> : <View style={styles.loading}>
        <Text>Loading...</Text>
      </View> }
    </View>
  </AndroidBackHandler>
}

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
