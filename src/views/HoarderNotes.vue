<template>
  <div class="common-layout">
    <n-layout>
      <HoarderHeader />
      <n-layout-content class="layout-content">
        <n-row :gutter="30">
          <n-col :span="6">
            <div class="grid-content">
              <!-- Spaces and Topics List -->
              <div class="spaces-list">
                <div v-for="space in spaces" :key="space.id" class="space-item">
                  <div
                    @click="selectSpace(space)"
                    :class="{ selected: space.id === spaceId }"
                    class="space-name"
                  >
                    {{ space.name }}
                  </div>
                  <div v-if="space.id === spaceId" class="topics-list">
                    <div
                      v-for="topic in space.topics"
                      :key="topic.id"
                      @click="selectTopic(space, topic)"
                      :class="{ selected: topic.id === topicId }"
                      class="topic-item"
                    >
                      {{ topic.name }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </n-col>
          <n-col :span="12">
            <div class="grid-content p-4 grid gap-6">
              <!-- Empty NoteItem for creating new note -->
              <NoteItem
                v-if="spaceId && topicId"
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
import { ref, onMounted, watch } from 'vue'
import { useInfiniteScroll } from '@vueuse/core'
import { useRouter, useRoute } from 'vue-router'
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
    const route = useRoute()
    const notes = ref([])
    const loading = ref(false)
    const noMoreNotes = ref(false)
    const page = ref(1)
    const pageSize = ref(10)
    const topicId = ref(null)
    const spaceId = ref(null)
    const spaces = ref([])
    const dialog = useDialog()

    const loadSpaces = async () => {
      try {
        const response = await api.get('/spaces')
        spaces.value = response.data

        // After spaces are loaded, check if route.query.spaceId and topicId are set
        if (route.query.spaceId) {
          const space = spaces.value.find((s) => s.id == route.query.spaceId)
          if (space) {
            spaceId.value = space.id
            if (route.query.topicId) {
              const topic = space.topics.find(
                (t) => t.id == route.query.topicId
              )
              if (topic) {
                topicId.value = topic.id
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading spaces:', error)
      }
    }

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
        await api.delete(`/notes/${note.id}`)
        notes.value = notes.value.map((n) =>
          n.id === note.id ? { ...n, deletedAt: new Date().toISOString() } : n
        )
      } catch (error) {
        console.error('Error deleting note:', error)
      }
    }

    const handleRestoreNote = async (note, index) => {
      try {
        await api.put(`/notes/${note.id}/restore`)
        notes.value[index] = { ...note, deletedAt: null, mode: 'view' }
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
      if (!spaceId.value) {
        loading.value = false
        return
      }
      loading.value = true

      try {
        const params = {
          page: page.value,
          pageSize: pageSize.value,
          spaceId: spaceId.value,
        }
        if (topicId.value) {
          params.topicId = topicId.value
        }

        const response = await api.get('/notes', { params })

        if (response.data.data.length < pageSize.value) {
          noMoreNotes.value = true
        }

        notes.value.push(
          ...response.data.data.map((note) => ({ ...note, mode: 'view' }))
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

    const handleCreateNote = (noteData, index) => {
      if (noteData.parentId) {
        // This is a reply note, get spaceId and topicId from the parent note
        const parentNote = notes.value.find((n) => n.id === noteData.parentId)
        if (parentNote) {
          noteData.spaceId = parentNote.spaceId
          noteData.topicId = parentNote.topicId
        } else {
          // Fallback to current spaceId and topicId
          noteData.spaceId = spaceId.value
          noteData.topicId = topicId.value
        }
      } else {
        noteData.spaceId = spaceId.value
        noteData.topicId = topicId.value
      }
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
      noteData.topicId = topicId.value
      noteData.spaceId = spaceId.value
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

    const selectSpace = (space) => {
      spaceId.value = space.id
      topicId.value = null
    }

    const selectTopic = (space, topic) => {
      spaceId.value = space.id
      topicId.value = topic.id
    }

    onMounted(() => {
      loadSpaces()
    })

    watch([spaceId, topicId], ([newSpaceId, newTopicId]) => {
      // Reset notes
      notes.value = []
      page.value = 1
      noMoreNotes.value = false
      // Update the route query parameters
      router.replace({
        query: {
          ...route.query,
          spaceId: newSpaceId,
          topicId: newTopicId,
        },
      })
      // Load notes
      loadMoreNotes()
    })

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
      spaces,
      spaceId,
      topicId,
      selectSpace,
      selectTopic,
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

.spaces-list {
  position: sticky;
  top: 0;
  max-height: calc(100vh - 80px);
  overflow-y: auto;
}

.space-item {
  margin-bottom: 8px;
}

.space-name {
  padding: 8px;
  cursor: pointer;
  font-weight: bold;
}

.topics-list {
  margin-left: 16px;
}

.topic-item {
  padding: 6px 8px;
  cursor: pointer;
}

.selected {
  background-color: var(--selected-bg-color);
  border-radius: 4px;
}
</style>
