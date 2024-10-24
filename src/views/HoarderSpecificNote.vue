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
              <!-- Display the specific note -->
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
              <!-- Display "Replies:" text -->
              <div v-if="note && note.replyCount > 0" class="replies-text">
                Replies:
              </div>
              <!-- Empty NoteItem for creating new reply -->
              <NoteItem
                :note="{}"
                mode="create"
                :parent-note="note"
                :format-time="formatTime"
                @create-note="handleCreateNote"
              />
              <!-- List of replies -->
              <NoteItem
                v-for="(reply, index) in replies"
                :key="reply.id || `reply-${index}`"
                :note="reply"
                :format-time="formatTime"
                :mode="reply.mode || 'view'"
                :index="index"
                :hide-reply-block="true"
                @update-note="handleUpdateReply"
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
import { ref, watch } from 'vue'
import { useInfiniteScroll } from '@vueuse/core'
import { useRoute, useRouter } from 'vue-router'
import NoteItem from '@/components/NoteItem.vue'
import HoarderHeader from '@/components/HoarderHeader.vue'
import api from '@/utils/api.js'

export default {
  name: 'HoarderSpecificNote',
  components: {
    NLayout,
    NLayoutContent,
    NRow,
    NCol,
    NoteItem,
    HoarderHeader,
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const note = ref(null)
    const replies = ref([])
    const loading = ref(false)
    const page = ref(1)
    const pageSize = ref(10)
    const lastNoteCreatedAt = ref(new Date().toISOString())
    const noMoreReplies = ref(false)

    const dialog = useDialog()

    const fetchNote = async (id) => {
      try {
        const response = await api.get(`/api/Notes/${id}`)
        note.value = { ...response.data, mode: 'view' }
      } catch (error) {
        console.error('Error fetching note:', error)
      }
    }

    const loadReplies = async () => {
      if (loading.value || noMoreReplies.value || !note.value) return
      loading.value = true

      try {
        const response = await api.get('/api/Notes/filter', {
          params: {
            lastNoteCreatedAt: lastNoteCreatedAt.value,
            parentId: note.value.id,
            page: page.value,
            pageSize: pageSize.value,
          },
        })

        if (response.data.length < pageSize.value) {
          noMoreReplies.value = true
        }

        replies.value.push(
          ...response.data.map((reply) => ({ ...reply, mode: 'view' }))
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
        const index = replies.value.findIndex((n) => n.id === noteItem.id)
        if (index !== -1) {
          // Check if a reply NoteItem already exists
          if (
            !replies.value[index + 1] ||
            replies.value[index + 1].isReply !== true
          ) {
            replies.value.splice(index + 1, 0, {
              isReply: true,
              parentNote: noteItem,
              mode: 'create',
              note: {},
            })
          }
        }
      } else {
        console.log(`${command} clicked`, noteItem)
      }
    }

    const deleteNote = async (noteItem) => {
      try {
        await api.delete(`/api/Notes/${noteItem.id}`)
        noteItem.isDeleted = true
      } catch (error) {
        console.error('Error deleting note:', error)
      }
    }

    const handleRestoreNote = (noteItem, index) => {
      api
        .post(`/api/Notes/restore/${noteItem.id}`)
        .then((response) => {
          if (noteItem.id === note.value.id) {
            note.value = { ...response.data, mode: 'view' }
          } else {
            replies.value[index] = { ...response.data, mode: 'view' }
          }
        })
        .catch((error) => {
          console.error('Error restoring note:', error)
        })
    }

    const handleReplyClick = (noteItem) => {
      if (noteItem.parentId) {
        router.push(`/notes/${noteItem.parentId}`)
      }
    }

    const handleChatClick = () => {
      // Already on the page, do nothing or scroll to replies
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

    const handleCreateNote = (noteData) => {
      // This creates a new reply to the main note
      noteData.parentId = note.value.id
      api
        .post('/api/Notes', noteData)
        .then((response) => {
          replies.value.unshift({ ...response.data, mode: 'view' })
          note.value.replyCount += 1 // Update reply count
        })
        .catch((error) => {
          console.error('Error creating reply:', error)
        })
    }

    const handleUpdateNote = (noteData, noteItem) => {
      api
        .put(`/api/Notes/${noteItem.id}`, noteData)
        .then((response) => {
          Object.assign(noteItem, response.data)
          noteItem.mode = 'view'
        })
        .catch((error) => {
          console.error('Error updating note:', error)
        })
    }

    const handleUpdateReply = (noteData, replyItem) => {
      api
        .put(`/api/Notes/${replyItem.id}`, noteData)
        .then((response) => {
          Object.assign(replyItem, response.data)
          replyItem.mode = 'view'
        })
        .catch((error) => {
          console.error('Error updating reply:', error)
        })
    }

    watch(
      () => route.params.id,
      (newId) => {
        // Reload the note and replies when route changes
        note.value = null
        replies.value = []
        page.value = 1
        noMoreReplies.value = false
        lastNoteCreatedAt.value = new Date().toISOString()
        fetchNote(newId).then(() => {
          if (note.value.replyCount > 0) {
            loadReplies()
          }
        })
      },
      { immediate: true }
    )

    useInfiniteScroll(window, loadReplies, {
      distance: 100,
      immediate: false,
    })

    return {
      note,
      replies,
      loading,
      formatTime,
      handleDropdownCommand,
      handleReplyClick,
      handleChatClick,
      handleTimeClick,
      handleCreateNote,
      handleUpdateNote,
      handleUpdateReply,
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
  padding-top: 80px; /* Adjust according to header height */
}

.n-icon {
  font-size: 24px;
  color: var(--text-color);
}

.replies-text {
  font-size: 24px;
  font-weight: bold;
  margin-top: 20px;
}
</style>
