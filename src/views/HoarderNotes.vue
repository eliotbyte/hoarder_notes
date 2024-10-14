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
              <div
                v-for="note in notes"
                :key="note.id"
                class="note bg-white rounded-[15px] space-y-3"
              >
                <!-- Note Reply Section acting as a clickable link -->
                <div v-if="note.parentId" class="note-reply p-2 rounded-[10px]">
                  <span class="note-reply-link" @click="handleReplyClick(note)">
                    {{ note.parentTextPreview }}
                  </span>
                </div>
                <!-- Note Text -->
                <div class="note-text text-2xl break-words">
                  {{ note.text }}
                </div>
                <!-- Note Tags as Buttons -->
                <div
                  v-if="note.tags"
                  class="note-tags text-gray-600 space-x-1 mb-[5px]"
                >
                  <el-button
                    v-for="tag in note.tags"
                    :key="tag"
                    size="small"
                    round
                    class="custom-tag"
                  >
                    {{ tag }}
                  </el-button>
                </div>
                <div class="note-footer flex justify-between items-center mt-3">
                  <div
                    class="note-time clickable-link"
                    @click="handleTimeClick(note)"
                  >
                    {{ formatTime(note.createdAt) }}
                  </div>
                  <div
                    class="note-stats flex items-center text-gray-600 space-x-3"
                  >
                    <el-button
                      type="text"
                      class="inline-flex items-center"
                      @click="handleChatClick(note)"
                    >
                      <el-icon class="icon-margin">
                        <ChatRound />
                      </el-icon>
                    </el-button>
                    <el-button
                      v-if="note.replyCount > 0"
                      @click="handleReplyCountClick(note)"
                    >
                      <span>
                        {{ note.replyCount }}
                      </span>
                    </el-button>
                    <div
                      class="note-options cursor-pointer mr-2 translate-y-[3px]"
                    >
                      <el-dropdown
                        placement="right-start"
                        :popper-options="{
                          modifiers: [
                            { name: 'offset', options: { offset: [-10, 12] } },
                          ],
                        }"
                        trigger="click"
                        class="custom-dropdown"
                        @command="handleDropdownCommand"
                      >
                        <span class="el-dropdown-link">
                          <el-icon><MoreFilled /></el-icon>
                        </span>
                        <template #dropdown>
                          <el-dropdown-menu>
                            <el-dropdown-item command="reply">
                              Reply
                            </el-dropdown-item>
                            <el-dropdown-item command="edit">
                              Edit
                            </el-dropdown-item>
                            <el-dropdown-item command="delete">
                              Delete
                            </el-dropdown-item>
                          </el-dropdown-menu>
                        </template>
                      </el-dropdown>
                    </div>
                  </div>
                </div>
              </div>
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
import { Moon, Sunny, ChatRound, MoreFilled } from '@element-plus/icons-vue'
import { useInfiniteScroll } from '@vueuse/core'

export default {
  name: 'HoarderNotes',
  components: {
    Sunny,
    Moon,
    ChatRound,
    MoreFilled,
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

    const handleDropdownCommand = (command) => {
      if (command === 'reply') {
        console.log('Reply clicked')
        // Logic for reply
      } else if (command === 'edit') {
        console.log('Edit clicked')
        // Logic for edit
      } else if (command === 'delete') {
        console.log('Delete clicked')
        // Logic for delete
      }
    }

    const handleReplyClick = (note) => {
      console.log('Reply clicked', note)
      // Logic for handling reply click
    }

    const handleChatClick = (note) => {
      console.log('Chat clicked', note)
      // Logic for chat
    }

    const handleReplyCountClick = (note) => {
      console.log('Reply count clicked', note)
      // Logic for handling reply count click
    }

    const handleTimeClick = (note) => {
      console.log('Time clicked', note)
      // Logic for time click
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
      handleReplyCountClick,
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

.el-row {
  margin-bottom: 20px;
}

.el-row:last-child {
  margin-bottom: 0;
}

.el-col {
  border-radius: 4px;
}

.grid-content {
  border-radius: 4px;
  min-height: 36px;
}

.note {
  border-radius: 15px;
  padding-left: 12px;
  padding-right: 12px;
  padding-top: 10px;
  padding-bottom: 5px;
  background-color: var(--block-color);
  position: relative;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.05);
}

.note-reply {
  background-color: var(--overlay-bg-color);
  border-radius: 10px;
  padding: 8px;
  font-size: 14px;
  color: var(--faded-text-color);
  cursor: pointer;
}

.note-reply-link {
  color: inherit;
  cursor: pointer;
}

.note-text {
  font-size: 20px;
  color: var(--text-color);
  word-break: break-word;
}

.note-tags {
  font-size: 16px;
  color: var(--text-color);
}

.note-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.note-stats {
  display: flex;
  align-items: center;
}

.note-options {
  cursor: pointer;
}

.note-options .el-icon {
  font-size: 20px;
}

.note-stats .el-icon {
  margin-right: 2px;
}

.note-stats span {
  color: var(--text-color);
}

.note-time {
  color: var(--faded-text-color);
}

.clickable-link {
  cursor: pointer;
}

.custom-tag {
  background-color: var(--tag-bg-color);
  color: var(--faded-text-color);
  border: none;
}

.custom-tag:hover {
  color: var(--text-color);
}

.custom-dropdown >>> .el-dropdown-menu {
  background-color: var(--dropdown-bg-color) !important;
  border: 1px solid var(--dropdown-bg-color) !important;
}

.custom-dropdown >>> .el-dropdown-item {
  color: var(--text-color);
}

.custom-dropdown >>> .el-dropdown-item:hover {
  background-color: var(--note-bright-color);
  color: var(--text-color) !important;
}

.note-options:hover,
.note-options:focus {
  border: none;
  outline: none;
}
</style>
