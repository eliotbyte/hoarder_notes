<template>
  <div class="common-layout">
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <h1 class="header-title">Hoarder Notes</h1>
        </div>
        <div class="header-right">
          <el-button type="text" @click="handleToggleDark">
            <el-icon v-if="!isDark">
              <Sunny />
            </el-icon>
            <el-icon v-else>
              <Moon />
            </el-icon>
          </el-button>
        </div>
      </el-header>
      <el-main>
        <el-row :gutter="30">
          <el-col :span="6">
            <div class="grid-content" />
          </el-col>
          <el-col :span="12">
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
          </el-col>
          <el-col :span="6">
            <div class="grid-content" />
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import api from '@/utils/api.js'
import { computed, ref } from 'vue'
import { isDark, toggleDark } from '../composables'
import { Moon, Sunny } from '@element-plus/icons-vue'
import { useInfiniteScroll } from '@vueuse/core'
import NoteItem from '@/components/NoteItem.vue'

export default {
  name: 'HoarderNotes',
  components: {
    Sunny,
    Moon,
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
      console.log('Toggle dark mode clicked')
      toggleDark()
    }

    const handleDropdownCommand = (command, note) => {
      if (command === 'reply') {
        console.log('Reply clicked', note)
      } else if (command === 'edit') {
        console.log('Edit clicked', note)
      } else if (command === 'delete') {
        console.log('Delete clicked', note)
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

.el-icon {
  font-size: 24px;
  color: var(--text-color);
}
</style>
