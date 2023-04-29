import React, { PureComponent, Component } from 'react';
import Meteor, { withTracker } from '@meteorrn/core';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Button, Platform } from 'react-native';
import get from 'lodash/get';
import { observer } from 'mobx-react';
import { getId, itemTitle, listFilter, isTeacher } from '../lib/utils';
import { withNavigationFocus } from '@react-navigation/compat';
import SearchInput from '../components/searchField';
import { backgroundGray, backgroundMain, fontColor, inputFont, iconFont } from '../colorSets';
import NewSongIcon from '../components/icons/newSongIcon';
import appStore from '../mobx/appStore';

const songSelectObserved = observer(class SongSelect extends Component {

  constructor(props) {
    super(props);

    this.state = {
      filter: '',
      clicked: false,
      customTitle: '',
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.isFocused && !nextProps.isFocused && appStore.get('modalVisible')) {
      appStore.hideModal();
      this.setState({
        customTitle: '',
      });
    }
  }

  selectSong = (item) => {
    const { customTitle, _id } = item;
    const { category, user } = this.props;
    const title = customTitle ? customTitle : itemTitle(item, category.id);
    const videoUri = get(this.props, ['navigation', 'state', 'params', 'videoUri']);
    const studentIds = get(this.props, ['navigation', 'state', 'params', 'studentIds']);
    this.props.navigation.navigate(isTeacher(user) ? 'Summary' : 'Comments', { videoUri, studentIds, title, practiceItemId: _id, category });
  };

  songFilter = (str) => {
    this.setState({
      filter: str,
    });
  };

  handleCustomSongSubmit = () => {
    const { customTitle } = this.state;
    appStore.hideModal();
    this.setState({
      customTitle: ''
    });
    this.selectSong({
      customTitle
    });
  };

  handleCustomTitleChange = text => this.setState({
    customTitle: text
  });

  cancelModal = () => {
    appStore.hideModal();
    this.setState({customTitle: ''});
  };

  modalBottomRender = () => {
    return Platform.select({
      ios: () => {
        return (<View style={styles.modalBottom}>
          <TouchableOpacity
            style={[styles.button, styles.firstButton]}
            onPress={this.handleCustomSongSubmit}
            disabled={!this.state.customTitle}
          >
            <Text style={styles.modalButtonText}>Submit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={appStore.hideModal}
          >
            <Text style={styles.modalButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>)
      },
      android: () => {
        return (<View style={styles.modalBottom}>
          <TouchableOpacity
            disabled={!this.state.customTitle}
            style={[styles.androidButton, styles.androidButtonRight]}
          >
            <Button
              disabled={!this.state.customTitle}
              onPress={this.handleCustomSongSubmit}
              title="Submit"
              color="#4C92C1"
            />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.androidButton, styles.androidButtonLeft]}>
            <Button
              title="Cancel"
              color="#F3172D"
              onPress={this.cancelModal}
            />
          </TouchableOpacity>
        </View>)
      },
    })();
  };

  render() {
    const isModalOpen = appStore.get('modalVisible');
    const { category } = this.props;
    const filteredSongs = this.props.practiceItems && listFilter(this.props.practiceItems, itemTitle, this.state.filter);
    return <View style={styles.page}>
      { this.props.practiceItems.length ? <View style={styles.container}>
        <Modal
          transparent={true}
          visible={isModalOpen}
          onRequestClose={this.cancelModal}>
          <KeyboardAvoidingView behavior="height" style={styles.modalContainer}>
            <View style={styles.modalView}>
              <View style={[styles.modalTop, Platform.OS === 'android' && styles.androidModalTop]}>
                <View style={styles.modalTextContainer}>
                  <Text style={styles.modalBoldText}>Name the Song</Text>
                  <Text style={styles.modalText}>Song name not on the list?{'\n'}Enter it here.</Text>
                </View>
                <TextInput
                  style={styles.modalInput}
                  placeholder='Name'
                  underlineColorAndroid='rgba(0,0,0,0)'
                  autoFocus={true}
                  onChangeText={this.handleCustomTitleChange}
                  value={this.state.customTitle}
                />
              </View>
              { this.modalBottomRender() }
            </View>
          </KeyboardAvoidingView>
        </Modal>
        <SearchInput
          onChange={this.songFilter}
          value={this.state.filter}
        />
        <FlatList
          style={styles.list}
          data={filteredSongs}
          renderItem={({ item }) => <TouchableOpacity onPress={() => this.selectSong(item)}>
            <View style={styles.song}>
              <Text style={styles.songName} key={get(item, '_id')}>{itemTitle(item, category.id)}</Text>
            </View>
          </TouchableOpacity>}
          keyExtractor={getId}
        />
      </View> : <View style={styles.loading}>
        <Text> {this.props.ready ? 'No items of this subtype are available' : 'Loading...'}</Text>
      </View> }
    </View>
  }
});

const songSelectContainer = withTracker(params => {
  const category = get(params, ['navigation', 'state', 'params', 'category']);
  const subscription = Meteor.subscribe('PracticeItemsForType', category.id);
  return {
    practiceItems: subscription.ready() &&
      Meteor.collection('practiceItems')
        .find({}, { sort: category.id === 'song' ? { 'recordingsMeta.0.name': 1 } : [['level', 'asc'], ['unit', 'asc']] }),
    user: Meteor.user(),
    ready: subscription.ready(),
    category,
  };
})(songSelectObserved);

class NewTitleButton extends PureComponent {
  onPress = () => {
    const isOpen = appStore.get('modalVisible');
    appStore.setModalVisible(!isOpen);
  };
  render() {
    return (<TouchableOpacity
      style={{ marginRight: 10 }}
      onPress={this.onPress}
    >
      <NewSongIcon />
    </TouchableOpacity>)
  }
}

songSelectContainer.navigationOptions =  (navigation) => {
  const title = get(navigation, ['navigation', 'state', 'params', 'category']);
  const isSong = get(title, 'id') === 'song';
  return ({
    title: `Select ${isSong ? 'Song' : 'Skill'}`,
    headerRight: isSong ? <NewTitleButton /> : <View />,
  })
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: backgroundMain,
    height: '100%',
  },
  container: {
    padding: 10,
  },
  song: {
    flex: 1,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: fontColor,
    borderBottomWidth: 0.5,
  },
  songName: {
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
  modalContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#00000050',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: '20%',
    paddingHorizontal: '10%',
  },
  modalView: {
    borderRadius: 10,
    flex: 0,
    backgroundColor: backgroundGray,
    paddingTop: 10,
  },
  modalTop: {
    flex: 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 5,
  },
  androidModalTop: {
    marginBottom: 20,
  },
  modalTextContainer: {
    marginVertical: 15,
  },
  modalBottom: {
    flex: 0,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  androidButton: {
    flex: 1,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  androidButtonRight: {
    marginRight: 10,
  },
  androidButtonLeft: {
    marginLeft: 10,
  },
  modalText: {
    fontSize: 14,
    textAlign: 'center',
  },
  modalBoldText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: inputFont,
    height: 30,
    padding: 5,
    marginHorizontal: 25,
    marginVertical: 10,
    width: '100%',
    borderColor: fontColor,
    borderWidth: 0.5,
  },
  button: {
    flex: 0,
    width: '50%',
    borderColor: fontColor,
    borderTopWidth: 0.5,
    padding: 10,
  },
  firstButton: {
    borderRightWidth: 0.5,
  },
  modalButtonText: {
    textAlign: 'center',
    color: iconFont,
    fontSize: 16,
  },
});

export default withNavigationFocus(songSelectContainer);
