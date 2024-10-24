<template>
  <div class="common-layout">
    <n-layout>
      <n-layout-header class="header">
        <div class="header-left">
          <h1 class="header-title">Hoarder Notes</h1>
        </div>
        <div class="header-right">
          <n-button text @click="handleCreateNote">
            <n-icon>
              <CreateOutline />
            </n-icon>
          </n-button>
          <n-button text @click="handleToggleDark">
            <n-icon v-if="!isDark">
              <Sunny />
            </n-icon>
            <n-icon v-else>
              <Moon />
            </n-icon>
          </n-button>
        </div>
      </n-layout-header>
      <n-layout-content>
        <n-row :gutter="30">
          <n-col :span="6">
            <div class="grid-content" />
          </n-col>
          <n-col :span="12">
            <div class="grid-content p-4 grid gap-6">
              <NoteItem
                v-for="note in notes"
                :key="note.id"
                :note="note"
                :format-time="formatTime"
                @reply-click="handleReplyClick"
                @chat-click="handleChatClick"
                @time-click="handleTimeClick"
                @dropdown-command="handleDropdownCommand"
              />
              <div v-if="loading">Loading...</div>
            </div>
          </n-col>
          <n-col :span="6">
            <div class="grid-content" />
          </n-col>
        </n-row>
      </n-layout-content>
    </n-layout>

    <!-- NoteEdit Modal -->
    <div v-if="showNoteEdit" class="overlay" @click.self="handleNoteEditCancel">
      <NoteEdit
        :note="editingNote"
        @create="handleNoteEditCreate"
        @cancel="handleNoteEditCancel"
        @input="unsavedChanges = true"
      />
    </div>
  </div>
</template>

<script>
import {
  NLayout,
  NLayoutHeader,
  NLayoutContent,
  NRow,
  NCol,
  NButton,
  NIcon,
  useDialog,
} from 'naive-ui'
import {
  SunnyOutline as Sunny,
  MoonOutline as Moon,
  CreateOutline,
} from '@vicons/ionicons5'
import { computed, ref } from 'vue'
import { isDark, toggleDark } from '../composables'
import { useInfiniteScroll } from '@vueuse/core'
import NoteItem from '@/components/NoteItem.vue'
import NoteEdit from '@/components/NoteEdit.vue'
import api from '@/utils/api.js'

export default {
  name: 'HoarderNotes',
  components: {
    NLayout,
    NLayoutHeader,
    NLayoutContent,
    NRow,
    NCol,
    NButton,
    NIcon,
    Sunny,
    Moon,
    CreateOutline,
    NoteItem,
    NoteEdit,
  },
  setup() {
    const notes = ref([])
    const loading = ref(false)
    const page = ref(1)
    const pageSize = ref(10)
    const lastNoteCreatedAt = ref('2025-10-02T02:06:51.619403')
    const noMoreNotes = ref(false)

    const darkMode = computed(() => isDark.value)

    const showNoteEdit = ref(false)
    const editingNote = ref(null)
    const unsavedChanges = ref(false)

    const handleToggleDark = () => {
      toggleDark()
    }

    const dialog = useDialog()

    const handleDropdownCommand = (command, note) => {
      if (command === 'delete') {
        dialog.warning({
          title: 'Confirm Deletion',
          content: 'Are you sure you want to delete this note?',
          positiveText: 'Yes',
          negativeText: 'No',
          onPositiveClick: () => {
            deleteNote(note)
          },
        })
      } else if (command === 'edit') {
        editingNote.value = { ...note }
        showNoteEdit.value = true
        unsavedChanges.value = false
      } else if (command === 'reply') {
        editingNote.value = {
          parentId: note.id,
          parentTextPreview: note.text,
        }
        showNoteEdit.value = true
        unsavedChanges.value = false
      } else {
        console.log(`${command} clicked`, note)
      }
    }

    const deleteNote = async (note) => {
      try {
        await api.delete(`/api/Notes/${note.id}`)
        note.deleted = true
      } catch (error) {
        console.error('Error deleting note:', error)
      }
    }

    const handleReplyClick = (note) => {
      console.log('Reply clicked', note)
    }

    const handleChatClick = (note) => {
      console.log('Chat clicked', note)
    }

    const handleTimeClick = (note) => {
      console.log('Time clicked', note)
    }

    const formatTime = (createdAt) => {
      const now = new Date()
      const created = new Date(createdAt)
      const diff = now - created

      const seconds = Math.floor(diff / 1000)
      const minutes = Math.floor(seconds / 60)
      const hours = Math.floor(minutes / 60)
      const days = Math.floor(hours / 24)
      const years = now.getFullYear() - created.getFullYear()

      if (seconds < 60) {
        return `${seconds} seconds ago`
      } else if (minutes < 60) {
        return `${minutes} minutes ago`
      } else if (hours < 24) {
        return `${hours} hours ago`
      } else if (days < 30) {
        return `${days} days ago`
      } else if (years < 1) {
        return created.toLocaleDateString(undefined, {
          month: 'long',
          day: 'numeric',
        })
      } else {
        return created.toLocaleDateString(undefined, {
          month: 'long',
          year: 'numeric',
        })
      }
    }

    const loadMoreNotes = async () => {
      if (loading.value || noMoreNotes.value) return
      loading.value = true

      try {
        const response = await api.get('/api/Notes/filter', {
          params: {
            lastNoteCreatedAt: lastNoteCreatedAt.value,
            page: page.value,
            pageSize: pageSize.value,
          },
        })

        if (response.data.length < pageSize.value) {
          noMoreNotes.value = true
        }

        notes.value.push(...response.data)
        page.value += 1
      } catch (error) {
        console.error('Error loading notes:', error)
      } finally {
        loading.value = false
      }
    }

    useInfiniteScroll(window, loadMoreNotes, {
      distance: 100,
      immediate: false,
    })

    const handleCreateNote = () => {
      editingNote.value = {}
      showNoteEdit.value = true
      unsavedChanges.value = false
    }

    const handleNoteEditCancel = () => {
      if (unsavedChanges.value) {
        dialog.warning({
          title: 'Unsaved Changes',
          content: 'If you close, the entered data will be lost.',
          positiveText: 'Close',
          negativeText: 'Cancel',
          onPositiveClick: () => {
            showNoteEdit.value = false
            editingNote.value = null
            unsavedChanges.value = false
          },
        })
      } else {
        showNoteEdit.value = false
        editingNote.value = null
        unsavedChanges.value = false
      }
    }

    const handleNoteEditCreate = (noteData) => {
      if (editingNote.value && editingNote.value.id) {
        // Update note
        api
          .put(`/api/Notes/${editingNote.value.id}`, noteData)
          .then(() => {
            const index = notes.value.findIndex(
              (n) => n.id === editingNote.value.id
            )
            if (index !== -1) {
              // Update the existing note object with the new data
              Object.assign(notes.value[index], noteData)
            }
            showNoteEdit.value = false
            editingNote.value = null
            unsavedChanges.value = false
          })
          .catch((error) => {
            console.error('Error updating note:', error)
          })
      } else {
        // Create new note
        api
          .post('/api/Notes', noteData)
          .then((response) => {
            notes.value.unshift(response.data)
            showNoteEdit.value = false
            editingNote.value = null
            unsavedChanges.value = false
          })
          .catch((error) => {
            console.error('Error creating note:', error)
          })
      }
    }

    return {
      isDark: darkMode,
      handleToggleDark,
      handleDropdownCommand,
      handleReplyClick,
      handleChatClick,
      handleTimeClick,
      notes,
      loading,
      loadMoreNotes,
      formatTime,
      showNoteEdit,
      handleCreateNote,
      handleNoteEditCancel,
      handleNoteEditCreate,
      unsavedChanges,
      editingNote,
    }
  },
}
</script>

<style scoped>
.common-layout {
  width: 1169px;
  margin: 0 auto;
  position: relative;
  top: 0;
  background-color: var(--bg-color);
  color: var(--text-color);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--bg-color);
  padding: 20px;
  border-bottom: 1px solid #ccc;
}

.header-title {
  font-size: 24px;
  color: var(--text-color);
}

.n-icon {
  font-size: 24px;
  color: var(--text-color);
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
</style>
