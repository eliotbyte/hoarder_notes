// ./src/store/index.js

import { createStore } from 'vuex'
import api from '../utils/api'

export default createStore({
  state: {
    notes: [],
    selectedNotes: [],
    selectionMode: false, // Added to track selection mode
    token: localStorage.getItem('token') || null,
  },
  mutations: {
    setNotes(state, notes) {
      state.notes = notes
    },
    setSelectedNotes(state, selectedNotes) {
      state.selectedNotes = selectedNotes
    },
    setSelectionMode(state, selectionMode) {
      state.selectionMode = selectionMode
    },
    setToken(state, token) {
      state.token = token
      if (token) {
        localStorage.setItem('token', token)
      } else {
        localStorage.removeItem('token')
      }
    },
  },
  actions: {
    async fetchNotes({ commit }, { lastNoteCreatedAt, page } = {}) {
      try {
        const params = {
          lastNoteCreatedAt: lastNoteCreatedAt || new Date().toISOString(),
          page: page || 1,
          pageSize: 10,
        }

        const notes = await api.getNotes(params)
        commit('setNotes', notes)
      } catch (error) {
        console.error('Error fetching notes:', error)
      }
    },
    async login({ commit, dispatch }, credentials) {
      try {
        const data = await api.login(credentials)
        const token = data.token
        commit('setToken', token)
        // After successful authentication, load notes
        dispatch('fetchNotes')
      } catch (error) {
        console.error('Login error:', error)
        throw error
      }
    },
    logout({ commit }) {
      commit('setToken', null)
    },
    async createNote({ dispatch }, noteData) {
      try {
        await api.createNote(noteData)
        dispatch('fetchNotes') // Refresh notes list
      } catch (error) {
        console.error('Error creating note:', error)
      }
    },
    async updateNote({ dispatch }, noteData) {
      try {
        await api.updateNote(noteData)
        dispatch('fetchNotes') // Refresh notes list
      } catch (error) {
        console.error('Error updating note:', error)
      }
    },
    async deleteNote({ dispatch }, noteId) {
      try {
        await api.deleteNote(noteId)
        dispatch('fetchNotes') // Refresh notes list
      } catch (error) {
        console.error('Error deleting note:', error)
      }
    },
  },
  getters: {
    isAuthenticated(state) {
      return !!state.token
    },
  },
})
