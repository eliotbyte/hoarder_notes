<!-- ./src/views/NotePage.vue -->

<template>
  <div
    class="content-spacing max-w-[1169px] mx-auto flex flex-col items-center"
  >
    <HoarderHeader />
    <div v-if="note" class="note-detail">
      <Note :note="note" />
      <h2>Replies:</h2>
      <NotesList :notes="replies" />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import HoarderHeader from '../components/HoarderHeader.vue'
import Note from '../components/HoarderNote.vue'
import NotesList from '../components/HoarderNotesList.vue'
import api from '../utils/api'

export default {
  components: {
    HoarderHeader,
    Note,
    NotesList,
  },
  data() {
    return {
      note: null,
      replies: [],
    }
  },
  computed: {
    ...mapState(['notes']),
  },
  async created() {
    const noteId = this.$route.params.id
    this.note = await api.getNoteById(noteId)
    this.replies = this.notes.filter((n) => n.parentId === this.note.id)
  },
}
</script>

<style>
/* Add styles if needed */
</style>
