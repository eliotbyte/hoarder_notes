<template>
  <div class="common-layout">
    <n-layout>
      <n-layout-header class="header">
        <div class="header-left">
          <h1 class="header-title">Hoarder Notes</h1>
        </div>
        <div class="header-right">
          <n-button text @click="handleToggleDark">
            <n-icon v-if="!isDark">
              <SunnyIcon />
            </n-icon>
            <n-icon v-else>
              <MoonIcon />
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
              <!-- Empty NoteItem for creating new note -->
              <NoteItem
                :note="{}"
                mode="create"
                :format-time="formatTime"
                @create-note="handleCreateNote"
              />
              <NoteItem
                v-for="(note, index) in notes"
                :key="note.id || `reply-${index}`"
                :note="note"
                :format-time="formatTime"
                :parent-note="note.parentNote"
                :mode="note.isEditing ? 'edit' : 'view'"
                @create-note="handleCreateNote"
                @update-note="handleUpdateNote"
                @cancel-create="handleCancelCreate"
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
  SunnyOutline as SunnyIcon,
  MoonOutline as MoonIcon,
} from '@vicons/ionicons5'
import { computed, ref } from 'vue'
import { isDark, toggleDark } from '../composables'
import { useInfiniteScroll } from '@vueuse/core'
import NoteItem from '@/components/NoteItem.vue'
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
    SunnyIcon,
    MoonIcon,
    NoteItem,
  },
  setup() {
    const notes = ref([])
    const loading = ref(false)
    const page = ref(1)
    const pageSize = ref(10)
    const lastNoteCreatedAt = ref('2025-10-02T02:06:51.619403')
    const noMoreNotes = ref(false)

    const darkMode = computed(() => isDark.value)

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
        note.isEditing = true
      } else if (command === 'reply') {
        const index = notes.value.findIndex((n) => n.id === note.id)
        if (index !== -1) {
          // Check if a reply NoteItem already exists
          if (
            !notes.value[index + 1] ||
            notes.value[index + 1].isReply !== true
          ) {
            notes.value.splice(index + 1, 0, {
              isReply: true,
              parentNote: note,
            })
          }
        }
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

        notes.value.push(
          ...response.data.map((note) => ({ ...note, isEditing: false }))
        )
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

    const handleCreateNote = (noteData, noteItem) => {
      api
        .post('/api/Notes', noteData)
        .then((response) => {
          if (noteItem.parentNote) {
            // This is a reply to a note
            const index = notes.value.findIndex((n) => n === noteItem)
            if (index !== -1) {
              notes.value.splice(index, 1)
              notes.value.splice(index, 0, response.data)
            }
          } else {
            // This is a new note
            notes.value.unshift(response.data)
          }
        })
        .catch((error) => {
          console.error('Error creating note:', error)
        })
    }

    const handleUpdateNote = (noteData, note) => {
      api
        .put(`/api/Notes/${note.id}`, noteData)
        .then(() => {
          Object.assign(note, noteData)
          note.isEditing = false
        })
        .catch((error) => {
          console.error('Error updating note:', error)
        })
    }

    const handleCancelCreate = (noteItem) => {
      const index = notes.value.findIndex((n) => n === noteItem)
      if (index !== -1) {
        notes.value.splice(index, 1)
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
      handleCreateNote,
      handleUpdateNote,
      handleCancelCreate,
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
</style>
