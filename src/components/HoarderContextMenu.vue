<!-- ./src/components/HoarderContextMenu.vue -->

<template>
  <div
    v-show="visible"
    class="context-menu"
    :style="{ top: y + 'px', left: x + 'px' }"
    @contextmenu.prevent
  >
    <div
      class="px-4 py-2 cursor-pointer hover:bg-background"
      @click="replyNote"
    >
      Reply
    </div>
    <div class="px-4 py-2 cursor-pointer hover:bg-background" @click="editNote">
      Edit
    </div>
    <div
      class="px-4 py-2 cursor-pointer hover:bg-background"
      @click="deleteNote"
    >
      Delete
    </div>
  </div>
</template>

<script>
export default {
  emits: ['replyNote', 'editNote'],
  data() {
    return {
      visible: false,
      x: 0,
      y: 0,
      note: null,
    }
  },
  mounted() {
    document.addEventListener('mousedown', this.handleDocumentClick)
  },
  beforeUnmount() {
    document.removeEventListener('mousedown', this.handleDocumentClick)
  },
  methods: {
    showContextMenu({ note, x, y }) {
      console.log('showContextMenu in HoarderContextMenu.vue called')
      console.log('Позиция контекстного меню:', x, y)
      this.note = note
      this.x = x
      this.y = y
      this.visible = true
    },
    handleDocumentClick(event) {
      if (this.visible && !this.$el.contains(event.target)) {
        this.visible = false
      }
    },
    replyNote() {
      this.$emit('replyNote', this.note)
      this.visible = false
    },
    editNote() {
      this.$emit('editNote', this.note)
      this.visible = false
    },
    deleteNote() {
      this.$store.dispatch('deleteNote', this.note.id)
      this.visible = false
    },
  },
}
</script>

<style scoped>
.context-menu {
  position: absolute;
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  padding: 10px;
  z-index: 9999; /* Установите высокий z-index */
  border-radius: 8px;
  background-color: var(--note-background-color);
  display: block; /* Убедитесь, что display установлен в block */
}
</style>
