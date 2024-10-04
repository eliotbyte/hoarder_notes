<!-- ./src/views/HoarderHome.vue -->

<template>
  <div
    class="content-spacing max-w-[1169px] mx-auto flex flex-col items-center"
  >
    <HoarderHeader @openModal="openNoteModal" />
    <NotesList
      :notes="notes"
      @replyNote="openReplyModal"
      @editNote="openEditModal"
      @showContextMenu="handleShowContextMenu"
    />

    <NoteModal
      v-if="isNoteModalVisible"
      :modalMode="modalMode"
      :replyingToNote="replyingToNote"
      :editingNote="editingNote"
      @closeModal="closeNoteModal"
    />
    <ContextMenu
      ref="contextMenu"
      @replyNote="openReplyModal"
      @editNote="openEditModal"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import HoarderHeader from '../components/HoarderHeader.vue'
import NotesList from '../components/HoarderNotesList.vue'
import NoteModal from '../components/HoarderNoteModal.vue'
import ContextMenu from '../components/HoarderContextMenu.vue'

export default {
  components: {
    HoarderHeader,
    NotesList,
    NoteModal,
    ContextMenu,
  },
  data() {
    return {
      isNoteModalVisible: false,
      modalMode: 'create',
      replyingToNote: null,
      editingNote: null,
    }
  },
  computed: {
    ...mapState(['notes']),
  },
  methods: {
    loadNotes() {
      const { time, page } = this.$route.query
      this.$store.dispatch('fetchNotes', {
        lastNoteCreatedAt: time,
        page: parseInt(page, 10) || 1,
      })
    },
    openNoteModal() {
      this.modalMode = 'create'
      this.editingNote = null
      this.replyingToNote = null
      this.isNoteModalVisible = true
    },
    closeNoteModal() {
      this.isNoteModalVisible = false
      this.replyingToNote = null
      this.editingNote = null
    },
    openReplyModal(note) {
      this.modalMode = 'reply'
      this.replyingToNote = note
      this.editingNote = null
      this.isNoteModalVisible = true
    },
    openEditModal(note) {
      this.modalMode = 'edit'
      this.editingNote = note
      this.replyingToNote = null
      this.isNoteModalVisible = true
    },
    handleShowContextMenu({ note, x, y }) {
      console.log('handleShowContextMenu in HoarderHome.vue called')
      if (this.$refs.contextMenu) {
        this.$refs.contextMenu.showContextMenu({ note, x, y })
      } else {
        console.error('contextMenu ref is not defined')
      }
    },
  },
  created() {
    if (!this.$store.getters.isAuthenticated) {
      this.$router.push('/login')
    } else {
      this.loadNotes()
    }
  },
}
</script>

<style>
/* Добавьте стили, если нужно */
</style>
