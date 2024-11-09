<template>
  <div class="common-layout">
    <n-layout>
      <HoarderHeader />
      <n-layout-content class="layout-content">
        <div class="grid-content p-4 grid gap-6">
          <NoteItem
            v-if="note"
            :note="note"
            :format-time="formatTime"
            :mode="note.mode || 'view'"
            @update-note="handleUpdateNote"
            @reply-click="handleReplyClick"
            @chat-click="handleChatClick"
            @time-click="handleTimeClick"
            @dropdown-command="handleDropdownCommand"
            @restore-note="handleRestoreNote"
          />
          <!-- Empty NoteItem for creating a reply -->
          <NoteItem
            v-if="note"
            :note="{}"
            :parent-note="note"
            mode="create"
            :format-time="formatTime"
            @create-note="handleCreateNote"
          />
          <NoteItem
            v-for="(replyNote, index) in replies"
            :key="replyNote.id"
            :note="replyNote"
            :format-time="formatTime"
            :mode="replyNote.mode || 'view'"
            :index="index"
            @update-note="handleUpdateNote"
            @reply-click="handleReplyClick"
            @chat-click="handleChatClick"
            @time-click="handleTimeClick"
            @dropdown-command="handleDropdownCommand"
            @restore-note="handleRestoreNote"
          />
          <div v-if="loading">Loading...</div>
        </div>
      </n-layout-content>
    </n-layout>
  </div>
</template>

<script>
import { NLayout, NLayoutContent, useDialog } from 'naive-ui'
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import NoteItem from '@/components/NoteItem.vue'
import HoarderHeader from '@/components/HoarderHeader.vue'
import api from '@/utils/api.js'

export default {
  name: 'HoarderSpecificNote',
  components: {
    NLayout,
    NLayoutContent,
    NoteItem,
    HoarderHeader,
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const note = ref(null)
    const replies = ref([])
    const loading = ref(false)
    const page = ref(1)
    const pageSize = ref(10)
    const dialog = useDialog()

    const loadNote = async () => {
      loading.value = true
      try {
        const response = await api.get(`/notes/${route.params.id}`)
        note.value = response.data
        await loadReplies()
      } catch (error) {
        console.error('Error loading note:', error)
      } finally {
        loading.value = false
      }
    }

    const loadReplies = async () => {
      loading.value = true
      try {
        const params = {
          page: page.value,
          pageSize: pageSize.value,
          parentId: note.value.id,
          spaceId: note.value.spaceId, // Include spaceId from parent note
          topicId: note.value.topicId, // Include topicId from parent note if needed
        }

        // Use the correct endpoint '/notes' as per your API
        const response = await api.get('/notes', { params })

        replies.value.push(
          ...response.data.data.map((reply) => ({ ...reply, mode: 'view' }))
        )
        page.value += 1
      } catch (error) {
        console.error('Error loading replies:', error)
      } finally {
        loading.value = false
      }
    }

    const handleDropdownCommand = (command, noteItem) => {
      if (command === 'delete') {
        dialog.warning({
          title: 'Confirm Deletion',
          content: 'Are you sure you want to delete this note?',
          positiveText: 'Yes',
          negativeText: 'No',
          onPositiveClick: () => {
            deleteNote(noteItem)
          },
        })
      } else if (command === 'edit') {
        noteItem.mode = 'edit'
      } else if (command === 'reply') {
        // Already on the specific note page
      } else {
        console.log(`${command} clicked`, noteItem)
      }
    }

    const deleteNote = async (noteItem) => {
      try {
        await api.delete(`/notes/${noteItem.id}`)
        if (noteItem.id === note.value.id) {
          note.value.deletedAt = new Date().toISOString()
        } else {
          const index = replies.value.findIndex((n) => n.id === noteItem.id)
          if (index !== -1) {
            replies.value[index].deletedAt = new Date().toISOString()
          }
        }
      } catch (error) {
        console.error('Error deleting note:', error)
      }
    }

    const handleRestoreNote = async (noteItem, index) => {
      try {
        await api.put(`/notes/${noteItem.id}/restore`)
        if (noteItem.id === note.value.id) {
          note.value.deletedAt = null
          note.value.mode = 'view'
        } else {
          replies.value[index] = { ...noteItem, deletedAt: null, mode: 'view' }
        }
      } catch (error) {
        console.error('Error restoring note:', error)
      }
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

    const handleCreateNote = (noteData) => {
      // Set spaceId and topicId from the parent note when creating a reply
      noteData.spaceId = note.value.spaceId
      noteData.topicId = note.value.topicId
      api
        .post('/notes', noteData)
        .then((response) => {
          replies.value.unshift({ ...response.data, mode: 'view' })
        })
        .catch((error) => {
          console.error('Error creating reply:', error)
        })
    }

    const handleUpdateNote = (noteData, noteItem) => {
      api
        .put(`/notes/${noteItem.id}`, noteData)
        .then((response) => {
          Object.assign(noteItem, response.data)
          noteItem.mode = 'view'
        })
        .catch((error) => {
          console.error('Error updating note:', error)
        })
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

    onMounted(() => {
      loadNote()
    })

    return {
      note,
      replies,
      loading,
      formatTime,
      handleCreateNote,
      handleUpdateNote,
      handleDropdownCommand,
      handleRestoreNote,
      handleReplyClick,
      handleChatClick,
      handleTimeClick,
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

.grid-content {
  display: flex;
  flex-direction: column;
}

.n-icon {
  font-size: 24px;
  color: var(--text-color);
}
</style>
