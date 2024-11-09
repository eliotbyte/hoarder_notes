import { createStore } from 'vuex'

export default createStore({
  state: {
    accessToken: localStorage.getItem('accessToken') || null,
  },
  mutations: {
    setAccessToken(state, token) {
      state.accessToken = token
      localStorage.setItem('accessToken', token)
    },
    clearAccessToken(state) {
      state.accessToken = null
      localStorage.removeItem('accessToken')
    },
  },
  actions: {
    logout({ commit }) {
      commit('clearAccessToken')
    },
  },
  getters: {
    isAuthenticated: (state) => !!state.accessToken,
  },
})
