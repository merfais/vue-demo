import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    filePath: '',
    pageName: '',
  },
  mutations: {
    setState(state, payload) {
      Object.assign(state, payload)
    },
  },
  actions: {
  },
  modules: {
  },
});
