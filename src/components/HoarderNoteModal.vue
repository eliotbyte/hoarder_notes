// ./src/components/HoarderNoteModal.vue

<template>
  <div class="modal">
    <div class="modal-content">
      <h2 class="text-xl font-bold text-textColor">{{ modalTitle }}</h2>
      <!-- Reply preview -->
      <div
        v-if="replyPreviewVisible"
        class="reply-preview bg-background text-textColor rounded-md p-2 mb-2 flex justify-between items-center"
      >
        <span>{{ replyPreviewTextShort }}</span>
        <img
          src="https://www.svgrepo.com/download/509072/cross.svg"
          alt="Delete reply"
          class="w-4 h-4 cursor-pointer"
          @click="showRemoveReplyModal"
        />
      </div>
      <!-- Note input field -->
      <textarea
        v-model="noteText"
        class="note-input bg-noteBackground text-textColor"
        placeholder="Enter text..."
      ></textarea>
      <!-- Tag input field -->
      <div
        class="note-tags-input-container bg-noteBackground text-textColor rounded-md p-2 mt-2 flex flex-wrap"
      >
        <div v-for="tag in tags" :key="tag" class="tag" @click="editTag(tag)">
          <span class="tag-text">{{ tag }}</span>
          <img
            src="https://www.svgrepo.com/download/509072/cross.svg"
            alt="Delete tag"
            class="tag-remove"
            @click.stop="removeTag(tag)"
          />
        </div>
        <input
          ref="tagInput"
          v-model="tagInput"
          class="note-tags-input bg-noteBackground text-textColor flex-grow focus:outline-none"
          placeholder="Enter tags..."
          @keydown="handleKeyDown"
        />
      </div>
      <div class="flex justify-end space-x-2 mt-2">
        <button
          class="bg-gray-500 text-white px-4 py-2 rounded-md"
          @click="closeModal"
        >
          Cancel
        </button>
        <button
          class="bg-blue-500 text-white px-4 py-2 rounded-md"
          @click="postNote"
        >
          {{ postButtonText }}
        </button>
      </div>
    </div>
    <!-- Confirmation modals -->
    <ConfirmationModal
      v-if="showConfirmation"
      @confirm="discardChanges"
      @cancel="hideConfirmation"
    />
    <RemoveReplyModal
      v-if="showRemoveReply"
      @confirm="removeReply"
      @cancel="hideRemoveReplyModal"
    />
  </div>
</template>

<script>
import ConfirmationModal from './HoarderConfirmationModal.vue'
import RemoveReplyModal from './HoarderRemoveReplyModal.vue'

export default {
  components: {
    ConfirmationModal,
    RemoveReplyModal,
  },
  props: {
    modalMode: {
      type: String,
      default: 'create',
    },
    replyingToNote: {
      type: Object,
      default: null,
    },
    editingNote: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      noteText: '',
      tagInput: '',
      tags: [],
      localModalMode: this.modalMode,
      localReplyingToNote: this.replyingToNote,
      localEditingNote: this.editingNote,
      replyPreviewVisible: false,
      replyPreviewText: '',
      showConfirmation: false,
      showRemoveReply: false,
      originalNoteText: '',
      originalNoteTags: [],
    }
  },
  computed: {
    modalTitle() {
      if (this.localModalMode === 'edit') {
        return 'Edit note'
      } else if (this.localModalMode === 'reply') {
        return 'Reply to note'
      } else {
        return 'Create note'
      }
    },
    postButtonText() {
      return this.localModalMode === 'edit' ? 'Save' : 'Post'
    },
    hasUnsavedChanges() {
      return (
        this.noteText.trim() !== this.originalNoteText ||
        JSON.stringify(this.tags) !== JSON.stringify(this.originalNoteTags)
      )
    },
    replyPreviewTextShort() {
      const text = this.replyPreviewText
      return text.length > 100 ? text.substring(0, 100) + '...' : text
    },
  },
  watch: {
    replyingToNote: {
      immediate: true,
      handler(note) {
        this.localReplyingToNote = note
        if (note) {
          this.replyPreviewVisible = true
          this.replyPreviewText = note.text
        } else {
          this.replyPreviewVisible = false
        }
      },
    },
    editingNote: {
      immediate: true,
      handler(note) {
        this.localEditingNote = note
        if (note) {
          this.noteText = note.text
          this.tags = [...(note.tags || [])]
          this.originalNoteText = note.text
          this.originalNoteTags = [...(note.tags || [])]
          if (note.parentId) {
            this.localReplyingToNote = { id: note.parentId, text: '' }
          }
        }
      },
    },
  },
  methods: {
    closeModal() {
      if (this.hasUnsavedChanges) {
        this.showConfirmation = true
      } else {
        this.resetModal()
      }
    },
    postNote() {
      const noteData = {
        Text: this.noteText.trim(),
        tags: this.tags,
        parentId: this.localReplyingToNote ? this.localReplyingToNote.id : null,
      }

      if (this.localModalMode === 'create' || this.localModalMode === 'reply') {
        this.$store.dispatch('createNote', noteData)
      } else if (this.localModalMode === 'edit') {
        noteData.id = this.localEditingNote.id
        this.$store.dispatch('updateNote', noteData)
      }
      this.resetModal()
    },
    resetModal() {
      this.noteText = ''
      this.tags = []
      this.tagInput = ''
      this.replyPreviewVisible = false
      this.replyPreviewText = ''
      this.localModalMode = 'create'
      this.localEditingNote = null
      this.localReplyingToNote = null
      this.originalNoteText = ''
      this.originalNoteTags = []
      this.showConfirmation = false
      this.showRemoveReply = false
      this.$emit('closeModal')
    },
    handleKeyDown(event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        this.addTag()
      }
    },
    addTag() {
      if (this.tagInput.trim() && !this.tags.includes(this.tagInput.trim())) {
        this.tags.push(this.tagInput.trim())
        this.tagInput = ''
      }
    },
    removeTag(tag) {
      this.tags = this.tags.filter((t) => t !== tag)
    },
    editTag(tag) {
      this.tagInput = tag
      this.tags = this.tags.filter((t) => t !== tag)
      this.$nextTick(() => {
        this.$refs.tagInput.focus()
      })
    },
    showRemoveReplyModal() {
      this.showRemoveReply = true
    },
    hideRemoveReplyModal() {
      this.showRemoveReply = false
    },
    removeReply() {
      this.replyPreviewVisible = false
      this.replyPreviewText = ''
      this.localReplyingToNote = null
      this.showRemoveReply = false
    },
    discardChanges() {
      this.showConfirmation = false
      this.resetModal()
    },
    hideConfirmation() {
      this.showConfirmation = false
    },
  },
}
</script>

<style scoped>
/* Add styles if needed */
</style>
