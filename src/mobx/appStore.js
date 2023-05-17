import { makeAutoObservable, observable } from 'mobx';

class AppStore {

  // states = observable(new Map([['groupSelect', false], ['modalVisible', false], ['isOneStudent', false]]));

  states = new Map([['groupSelect', false], ['modalVisible', false], ['isOneStudent', false]])

  constructor() {
    makeAutoObservable(this)
  }

  setGroupValue = (value) => {
    this.states.set('groupSelect', value);
  };

  isOneStudent = (value) => {
    this.states.set('isOneStudent', value);
  };

  unsetGroupValue = () => this.setGroupValue(false);

  setModalVisible = (value) => {
    this.states.set('modalVisible', value);
  };

  hideModal = () => this.setModalVisible(false);

  get = state => this.states.get(state);

}

const appStore = new AppStore();

export default appStore;
