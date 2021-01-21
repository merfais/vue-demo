import map from 'lodash/map'

const variable = {
  namespaced: true,
  state: {
    map: {
      varA: 1,
    },
  },
  getters: {
    list(state, getters) {
      return map(state.map, (item) => {
        const getterKey = `${item.key}/value`
        let value = ''
        try {
          value = JSON.stringify(getters[getterKey])
        } catch (e) {}
        return {
          key: item.key,
          type: item.type,
          name: item.name,
          value,
        }
      })
    },
  },
  mutations: {
    setState(state, payload) {
      Object.assign(state, payload)
    },
  },
  actions: {
  },
}

export default variable
