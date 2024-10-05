// ./src/store/index.js

import { createStore } from 'vuex'
import api from '../utils/api'

export default createStore({
  state: {
    notes: [],
    selectedNotes: [],
    selectionMode: false, // Track selection mode
    token: localStorage.getItem('token') || null,
  },
  mutations: {
    setNotes(state, notes) {
      state.notes = notes
    },
    appendNotes(state, notes) {
      state.notes = state.notes.concat(notes)
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
    async fetchNotes({ commit }, { lastNoteCreatedAt, page, append = false } = {}) {
      try {
        const params = {
          lastNoteCreatedAt: lastNoteCreatedAt || new Date().toISOString(),
          page: page || 1,
          pageSize: 10,
        }

        const notes = await api.getNotes(params)
        if (append) {
          commit('appendNotes', notes)
        } else {
          commit('setNotes', notes)
        }
        return notes
      } catch (error) {
        // Check if the error is not handled (i.e., not a 401)
        if (error.response && error.response.status !== 401) {
          console.error('Error fetching notes:', error)
        }
        // Do not rethrow the error to prevent further handling
      }
    },
    async login({ commit, dispatch }, credentials) {
      try {
        const data = await api.login(credentials)
        const token = data.token
        commit('setToken', token)
        // After successful authentication, load notes
        await dispatch('fetchNotes')
      } catch (error) {
        if (error.response && error.response.status === 401) {
          // Optionally, handle unauthorized login attempts here
        } else {
          console.error('Login error:', error)
        }
        throw error // Re-throw other errors to be handled elsewhere if needed
      }
    },
    logout({ commit }) {
      commit('setToken', null)
    },
    async createNote({ dispatch }, noteData) {
      try {
        await api.createNote(noteData)
        await dispatch('fetchNotes')
      } catch (error) {
        if (error.response && error.response.status !== 401) {
          console.error('Error creating note:', error)
        }
        // Do not rethrow the error
      }
    },
    async updateNote({ dispatch }, noteData) {
      try {
        await api.updateNote(noteData)
        await dispatch('fetchNotes')
      } catch (error) {
        if (error.response && error.response.status !== 401) {
          console.error('Error updating note:', error)
        }
        // Do not rethrow the error
      }
    },
    async deleteNote({ dispatch }, noteId) {
      try {
        await api.deleteNote(noteId)
        await dispatch('fetchNotes')
      } catch (error) {
        if (error.response && error.response.status !== 401) {
          console.error('Error deleting note:', error)
        }
        // Do not rethrow the error
      }
    },
  },
  getters: {
    isAuthenticated(state) {
      return !!state.token
    },
  },
})
