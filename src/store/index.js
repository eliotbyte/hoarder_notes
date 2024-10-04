// ./src/store/index.js

import { createStore } from 'vuex'
import api from '../utils/api'

export default createStore({
  state: {
    notes: [],
    selectedNotes: [],
    selectionMode: false, // Добавлено для отслеживания режима выделения
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
        console.error('Ошибка при получении заметок:', error)
      }
    },
    async login({ commit, dispatch }, credentials) {
      try {
        const data = await api.login(credentials)
        const token = data.token
        commit('setToken', token)
        // После успешной авторизации загружаем заметки
        dispatch('fetchNotes')
      } catch (error) {
        console.error('Ошибка при авторизации:', error)
        throw error
      }
    },
    logout({ commit }) {
      commit('setToken', null)
    },
    async createNote({ dispatch }, noteData) {
      try {
        await api.createNote(noteData)
        dispatch('fetchNotes') // Обновляем список заметок
      } catch (error) {
        console.error('Ошибка при создании заметки:', error)
      }
    },
    async updateNote({ dispatch }, noteData) {
      try {
        await api.updateNote(noteData)
        dispatch('fetchNotes') // Обновляем список заметок
      } catch (error) {
        console.error('Ошибка при обновлении заметки:', error)
      }
    },
    async deleteNote({ dispatch }, noteId) {
      try {
        await api.deleteNote(noteId)
        dispatch('fetchNotes') // Обновляем список заметок
      } catch (error) {
        console.error('Ошибка при удалении заметки:', error)
      }
    },
  },
  getters: {
    isAuthenticated(state) {
      return !!state.token
    },
  },
})
