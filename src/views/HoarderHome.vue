<!-- ./src/views/HoarderHome.vue -->

<template>
  <div
    class="content-spacing max-w-[1169px] mx-auto flex flex-col items-center pt-16"
  >
    <HoarderHeader @openModal="openNoteModal" />
    <NotesList
      :notes="notes"
      @replyNote="openReplyModal"
      @editNote="openEditModal"
      @showContextMenu="handleShowContextMenu"
    />
    <!-- Scroll to Top Button -->
    <button
      v-if="showScrollToTopButton"
      class="scroll-to-top-button fixed bottom-4 right-4 p-2 bg-blue-500 text-white rounded-full"
      @click="scrollToTop"
    >
      ↑
    </button>

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
      currentPage: 1,
      lastNoteCreatedAt: new Date().toISOString(),
      isLoadingMoreNotes: false,
      showScrollToTopButton: false,
      hasMoreNotes: true,
    }
  },
  computed: {
    ...mapState(['notes']),
  },
  methods: {
    loadNotes(append = false) {
      if (this.isLoadingMoreNotes || (!append && !this.hasMoreNotes)) return
      this.isLoadingMoreNotes = true
      const params = {
        lastNoteCreatedAt: this.lastNoteCreatedAt,
        page: this.currentPage,
      }
      this.$store
        .dispatch('fetchNotes', { ...params, append })
        .then((notes) => {
          this.isLoadingMoreNotes = false
          if (notes && notes.length === 0) {
            this.hasMoreNotes = false
          } else {
            if (append) {
              this.currentPage += 1
              const lastNote = notes[notes.length - 1]
              this.lastNoteCreatedAt = lastNote.createdAt
              this.updateUrl()
            } else {
              // When not appending, reset the page and lastNoteCreatedAt
              this.currentPage = 1
              this.lastNoteCreatedAt = new Date().toISOString()
              this.updateUrl()
              this.hasMoreNotes = true
            }
          }
        })
    },
    updateUrl() {
      if (this.currentPage > 1) {
        this.$router.replace({
          path: '/',
          query: {
            page: this.currentPage,
            time: this.lastNoteCreatedAt,
          },
        })
      } else {
        this.$router.replace({
          path: '/',
          query: {}, // Clear query parameters when on the first page
        })
      }
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
      // After closing the modal, refresh the notes
      this.loadNotes(false)
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
      if (this.$refs.contextMenu) {
        this.$refs.contextMenu.showContextMenu({ note, x, y })
      } else {
        console.error('contextMenu ref is not defined')
      }
    },
    handleScroll() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const windowHeight =
        window.innerHeight || document.documentElement.clientHeight
      const fullHeight = document.documentElement.scrollHeight

      // Show or hide the scroll to top button
      this.showScrollToTopButton = scrollTop > windowHeight

      if (scrollTop + windowHeight >= fullHeight - 100) {
        // Near the bottom, load more notes
        this.loadNotes(true)
      }

      // If scrolled back to the top, reset to the first page
      if (scrollTop === 0 && this.currentPage !== 1) {
        this.currentPage = 1
        this.updateUrl()
      }
    },
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    },
  },
  mounted() {
    if (!this.$store.getters.isAuthenticated) {
      this.$router.push('/login')
    } else {
      const page = parseInt(this.$route.query.page) || 1
      const time = this.$route.query.time || new Date().toISOString()
      this.currentPage = page
      this.lastNoteCreatedAt = time
      this.loadNotes()
    }
    window.addEventListener('scroll', this.handleScroll)
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
  },
}
</script>

<style>
.content-spacing {
  padding-top: 64px; /* Adjust to match the height of your header */
}

.scroll-to-top-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #1d4ed8; /* Tailwind CSS blue-700 */
  color: white;
  border: none;
  border-radius: 50%;
  padding: 12px;
  font-size: 24px;
  cursor: pointer;
}

.scroll-to-top-button:hover {
  background-color: #2563eb; /* Tailwind CSS blue-600 */
}
</style>
