<!-- ./src/views/HoarderSpecificNote.vue -->
<template>
  <div class="common-layout">
    <n-layout>
      <HoarderHeader />
      <n-layout-content class="layout-content">
        <div class="grid-content p-4 grid gap-1">
          <!-- Main Note -->
          <div class="content-block">
            <NoteItem
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
          </div>
          <!-- Reply Input -->
          <div class="content-block">
            <NoteItem
              :note="{}"
              mode="create"
              :parent-note="note"
              :format-time="formatTime"
              @create-note="handleCreateReply"
            />
          </div>
          <!-- Replies -->
          <div
            v-for="(reply, index) in replies"
            :key="reply.id || `reply-${index}`"
            class="content-block"
          >
            <NoteItem
              :note="reply"
              :format-time="formatTime"
              :parent-note="note"
              :mode="reply.mode || 'view'"
              :index="index"
              @update-note="handleUpdateNote"
              @reply-click="handleReplyClick"
              @chat-click="handleChatClick"
              @time-click="handleTimeClick"
              @dropdown-command="handleDropdownCommand"
              @restore-note="handleRestoreNote"
            />
          </div>
          <div v-if="loading">Loading replies...</div>
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
    const note = ref({})
    const replies = ref([])
    const loading = ref(false)
    const dialog = useDialog()

    const loadNote = async () => {
      try {
        const response = await api.get(`/notes/${route.params.id}`)
        note.value = response.data
        loadReplies()
      } catch (error) {
        console.error('Error loading note:', error)
      }
    }

    const loadReplies = async (page = 1, pageSize = 10) => {
      loading.value = true
      try {
        const response = await api.get('/notes', {
          params: {
            parentId: route.params.id,
            page,
            pageSize,
          },
        })
        if (page === 1) {
          replies.value = response.data.data
        } else {
          replies.value.push(...response.data.data)
        }
        // You can handle pagination flags here if needed
      } catch (error) {
        console.error('Error loading replies:', error)
      } finally {
        loading.value = false
      }
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

    const handleCreateReply = (noteData) => {
      noteData.parentId = note.value.id
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
        // Handle reply command if needed
      } else {
        console.log(`${command} clicked`, noteItem)
      }
    }

    const deleteNote = async (noteItem) => {
      try {
        await api.delete(`/notes/${noteItem.id}`)
        noteItem.deletedAt = new Date().toISOString()
      } catch (error) {
        console.error('Error deleting note:', error)
      }
    }

    const handleRestoreNote = async (noteItem) => {
      try {
        await api.put(`/notes/${noteItem.id}/restore`)
        noteItem.deletedAt = null
        noteItem.mode = 'view'
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

    onMounted(() => {
      loadNote()
    })

    return {
      note,
      replies,
      handleUpdateNote,
      handleCreateReply,
      handleReplyClick,
      handleChatClick,
      handleTimeClick,
      handleDropdownCommand,
      handleRestoreNote,
      formatTime,
      loading,
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
  padding: 16px;
}

.n-icon {
  font-size: 24px;
  color: var(--text-color);
}
</style>
