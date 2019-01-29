import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
  // authorization data
  authorized: false,
  userId: null,
  userAccount: null,
  userName: null,
  userRole: null,
  // notification data
  notifications: [],
  lastViewDate: new Date(2000, 0, 1),
  // snakbar data
  snackbarMessage: '',
  snackbarTimeout: 4000,
  snackbarColor: 'info',
  snackbarMultiLine: false,
  showSnackbar: false
}

const getters = {
  // authorization data
  authorized: state => state.authorized,
  userId: state => state.userId,
  userAccount: state => state.userAccount,
  userName: state => state.userName,
  userRole: state => state.userRole,
  // notification data
  notifications: state => state.notifications,
  lastViewDate: state => state.lastViewDate,
  // snackbar data
  snackbarMessage: state => state.snackbarMessage,
  snackbarTimeout: state => state.snackbarTimeout,
  snackbarColor: state => state.snackbarColor,
  snackbarMultiLine: state => state.snackbarMultiLine,
  showSnackbar: state => state.showSnackbar
}

const mutations = {
  setAuthorized (state, authorized) {
    state.authorized = authorized
  },
  setUser (state, payload) {
    state.userId = payload.id
    state.userAccount = payload.account
    state.userName = payload.name
    state.userRole = payload.role
  },
  setNotifications (state, notifications) {
    state.notifications = notifications
  },
  setLastViewDate (state, lastViewDate) {
    state.lastViewDate = lastViewDate
  },
  setSnackbar (state, payload) {
    state.snackbarMessage = payload.message
    state.snackbarTimeout = payload.timeout || 4000
    state.snackbarColor = payload.color || 'info'
    state.snackbarMultiLine = payload.multiLine
    state.showSnackbar = payload.show
  },
  showSnackbar (state, show) {
    state.showSnackbar = show
  }
}

const actions = {
  setAuthorized ({ commit }, authorized) {
    commit('setAuthorized', authorized)
  },
  setUser ({ commit }, payload) {
    commit('setUser', payload)
  },
  setNotifications ({ commit }, notifications) {
    commit('setNotifications', notifications)
  },
  setLastViewDate ({ commit }, lastViewDate) {
    commit('setLastViewDate', lastViewDate)
  },
  setSnackbar ({ commit }, payload) {
    commit('setSnackbar', payload)
  },
  showSnackbar ({ commit }, show) {
    commit('showSnackbar', show)
  }
}

export default new Vuex.Store({
  state,
  getters,
  actions,
  mutations
})
