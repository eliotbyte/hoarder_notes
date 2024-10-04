<!-- ./src/components/HoarderHeader.vue -->

<template>
  <div class="fixed-header">
    <div v-if="!selectionMode" id="normal-header" class="header-container">
      <div class="jakarta-semibold text-[32px] text-textColor">ZAEBEAST</div>
      <div class="flex space-x-4 items-center">
        <button
          class="bg-red-500 text-white px-4 py-2 rounded-md"
          @click="logout"
        >
          Logout
        </button>
        <img
          src="https://www.svgrepo.com/download/533701/refresh-cw.svg"
          alt="Refresh Icon"
          class="w-6 h-6 icon-filter cursor-pointer"
          @click="refreshNotes"
        />
        <img
          id="plus-icon"
          src="https://www.svgrepo.com/download/491467/plus.svg"
          alt="Plus Icon"
          class="w-6 h-6 cursor-pointer icon-filter"
          @click="$emit('openModal')"
        />
        <img
          id="theme-toggle"
          :src="themeIcon"
          :alt="themeAlt"
          class="w-6 h-6 cursor-pointer icon-filter"
          @click="toggleTheme"
        />
      </div>
    </div>
    <div v-else id="selection-header" class="header-container">
      <div
        id="selected-count"
        class="jakarta-semibold text-[24px] text-textColor"
      >
        {{ selectedNotes.length }} selected
      </div>
      <div class="flex space-x-4 items-center">
        <button
          class="bg-red-500 text-white px-4 py-2 rounded-md"
          @click="deleteSelected"
        >
          Delete
        </button>
        <button
          class="bg-gray-500 text-white px-4 py-2 rounded-md"
          @click="cancelSelection"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'

export default {
  emits: ['openModal'],
  data() {
    return {
      isDarkTheme: false,
    }
  },
  computed: {
    ...mapState(['selectedNotes', 'selectionMode']),
    themeIcon() {
      return this.isDarkTheme
        ? 'https://www.svgrepo.com/download/45607/day-of-sun.svg'
        : 'https://www.svgrepo.com/download/487620/night.svg'
    },
    themeAlt() {
      return this.isDarkTheme ? 'Switch to Light Mode' : 'Switch to Dark Mode'
    },
  },
  methods: {
    ...mapMutations(['setSelectedNotes', 'setSelectionMode']),
    refreshNotes() {
      this.$store.dispatch('fetchNotes')
    },
    toggleTheme() {
      this.isDarkTheme = !this.isDarkTheme
      document.documentElement.classList.toggle('dark')
      if (this.isDarkTheme) {
        localStorage.setItem('theme', 'dark')
      } else {
        localStorage.setItem('theme', 'light')
      }
    },
    deleteSelected() {
      this.selectedNotes.forEach((note) => {
        this.$store.dispatch('deleteNote', note.id)
      })
      this.cancelSelection()
    },
    cancelSelection() {
      this.setSelectedNotes([])
      this.setSelectionMode(false)
    },
    logout() {
      this.$store.dispatch('logout')
      this.$router.push('/login')
    },
    initializeTheme() {
      const userTheme = localStorage.getItem('theme')
      const systemPrefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches

      if (userTheme === 'dark' || (!userTheme && systemPrefersDark)) {
        this.isDarkTheme = true
        document.documentElement.classList.add('dark')
      } else {
        this.isDarkTheme = false
        document.documentElement.classList.remove('dark')
      }
    },
  },
  mounted() {
    this.initializeTheme()
  },
}
</script>

<style>
/* Add styles if needed */
</style>
