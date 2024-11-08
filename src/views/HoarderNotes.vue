<template>
  <div class="common-layout">
    <n-layout>
      <HoarderHeader />
      <n-layout-content class="layout-content">
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
                :mode="note.mode || 'view'"
                :index="index"
                @create-note="handleCreateNote"
                @update-note="handleUpdateNote"
                @cancel-create="handleCancelCreate"
                @reply-click="handleReplyClick"
                @chat-click="handleChatClick"
                @time-click="handleTimeClick"
                @dropdown-command="handleDropdownCommand"
                @restore-note="handleRestoreNote"
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
import { NLayout, NLayoutContent, NRow, NCol, useDialog } from 'naive-ui'
import { ref } from 'vue'
import { useInfiniteScroll } from '@vueuse/core'
import { useRouter } from 'vue-router'
import NoteItem from '@/components/NoteItem.vue'
import HoarderHeader from '@/components/HoarderHeader.vue'
import api from '@/utils/api.js'

export default {
  name: 'HoarderNotes',
  components: {
    NLayout,
    NLayoutContent,
    NRow,
    NCol,
    NoteItem,
    HoarderHeader,
  },
  setup() {
    const router = useRouter()
    const notes = ref([])
    const loading = ref(false)
    const noMoreNotes = ref(false)
    const lastNoteDate = ref(new Date().toISOString())
    const topicId = 1 // Hardcoded for now
    const spaceId = 1 // Hardcoded for now

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
        note.mode = 'edit'
      } else if (command === 'reply') {
        const index = notes.value.findIndex((n) => n.id === note.id)
        if (index !== -1) {
          if (
            !notes.value[index + 1] ||
            notes.value[index + 1].isReply !== true
          ) {
            notes.value.splice(index + 1, 0, {
              isReply: true,
              parentNote: note,
              mode: 'create',
              note: {},
            })
          }
        }
      } else {
        console.log(`${command} clicked`, note)
      }
    }

    const deleteNote = async (note) => {
      try {
        const response = await api.delete(`/notes/${note.id}`)
        notes.value = notes.value.map((n) =>
          n.id === note.id ? { ...response.data, mode: 'view' } : n
        )
      } catch (error) {
        console.error('Error deleting note:', error)
      }
    }

    const handleRestoreNote = async (note, index) => {
      try {
        const response = await api.put(`/notes/${note.id}/restore`)
        notes.value[index] = { ...response.data, mode: 'view' }
      } catch (error) {
        console.error('Error restoring note:', error)
      }
    }

    const handleReplyClick = (noteItem) => {
      if (noteItem.parentId) {
        router.push(`/notes/${noteItem.parentId}`)
      }
    }

    const handleChatClick = (noteItem) => {
      router.push(`/notes/${noteItem.id}`)
    }

    const handleTimeClick = (noteItem) => {
      router.push(`/notes/${noteItem.id}`)
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
        const response = await api.get('/notes', {
          params: {
            date: lastNoteDate.value,
            topicId: topicId,
            spaceId: spaceId,
            // tags: '', // Include tags if needed
          },
        })

        if (response.data.length === 0) {
          noMoreNotes.value = true
        }

        notes.value.push(
          ...response.data.map((note) => ({ ...note, mode: 'view' }))
        )

        if (response.data.length > 0) {
          lastNoteDate.value = response.data[response.data.length - 1].createdAt
        }
      } catch (error) {
        console.error('Error loading notes:', error)
      } finally {
        loading.value = false
      }
    }

    useInfiniteScroll(window, loadMoreNotes, {
      distance: 100,
      immediate: true,
    })

    const handleCreateNote = (noteData, index) => {
      noteData.topicId = topicId
      noteData.spaceId = spaceId
      api
        .post('/notes', noteData)
        .then((response) => {
          if (notes.value[index] && notes.value[index].isReply) {
            notes.value.splice(index, 1, { ...response.data, mode: 'view' })
          } else {
            notes.value.unshift({ ...response.data, mode: 'view' })
          }
        })
        .catch((error) => {
          console.error('Error creating note:', error)
        })
    }

    const handleUpdateNote = (noteData, note) => {
      api
        .put(`/notes/${note.id}`, noteData)
        .then((response) => {
          Object.assign(note, response.data)
          note.mode = 'view'
        })
        .catch((error) => {
          console.error('Error updating note:', error)
        })
    }

    const handleCancelCreate = (index) => {
      if (notes.value[index].isReply) {
        notes.value.splice(index, 1)
      }
    }

    return {
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
      handleRestoreNote,
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

.layout-content {
  padding-top: 80px;
}

.n-icon {
  font-size: 24px;
  color: var(--text-color);
}
</style>
