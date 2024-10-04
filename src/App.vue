<!-- ./src/App.vue -->

<template>
  <router-view />
</template>

<script>
export default {
  name: 'App',
  mounted() {
    document.addEventListener('selectionchange', this.handleSelectionChange)
  },
  beforeUnmount() {
    document.removeEventListener('selectionchange', this.handleSelectionChange)
  },
  methods: {
    handleSelectionChange() {
      if (this.$store.state.selectionMode) {
        window.getSelection().removeAllRanges()
      }
    },
  },
}
</script>

<style>
/* Global styles can be added here */
.disable-text-selection {
  user-select: none;
}
</style>
