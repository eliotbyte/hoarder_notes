<!-- ./src/components/HoarderNotesList.vue -->

<template>
  <div
    id="notes"
    class="w-full flex flex-col items-center"
    :class="{ 'disable-text-selection': selectionMode }"
  >
    <Note
      v-for="note in notes"
      :key="note.id"
      :note="note"
      @replyNote="handleReplyNote"
      @editNote="handleEditNote"
      @showContextMenu="handleShowContextMenu"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Note from './HoarderNote.vue'

export default {
  components: {
    Note,
  },
  props: {
    notes: {
      type: Array,
      required: true,
    },
  },
  computed: {
    ...mapState(['selectionMode']),
  },
  emits: ['replyNote', 'editNote', 'showContextMenu'],
  methods: {
    handleReplyNote(note) {
      this.$emit('replyNote', note)
    },
    handleEditNote(note) {
      this.$emit('editNote', note)
    },
    handleShowContextMenu(data) {
      this.$emit('showContextMenu', data)
    },
  },
}
</script>

<style>
.disable-text-selection {
  user-select: none;
}
</style>
