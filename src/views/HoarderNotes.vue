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
            <div class="grid-content p-4">
              <div class="note bg-white rounded-[15px] space-y-3">
                <!-- Note Reply Section acting as a clickable link -->
                <div class="note-reply p-2 rounded-[10px]">
                  <span class="note-reply-link" @click="handleReplyClick">{{
                    replyText
                  }}</span>
                </div>
                <!-- Note Text -->
                <div class="note-text text-2xl break-words">
                  Note text that is sufficiently long to demonstrate text
                  wrapping within the note component without overflowing its
                  boundaries.
                </div>
                <!-- Note Tags as Buttons -->
                <div class="note-tags text-gray-600 space-x-1 mb-[5px]">
                  <el-button size="small" round class="custom-tag">
                    Tag1
                  </el-button>
                  <el-button size="small" round class="custom-tag">
                    Tag2
                  </el-button>
                </div>
                <div class="note-footer flex justify-between items-center mt-3">
                  <div
                    class="note-time clickable-link"
                    @click="handleTimeClick"
                  >
                    5 hours ago
                  </div>
                  <div
                    class="note-stats flex items-center text-gray-600 space-x-3"
                  >
                    <el-button
                      type="text"
                      @click="handleChatClick"
                      class="inline-flex items-center"
                    >
                      <el-icon class="icon-margin">
                        <ChatRound />
                      </el-icon>
                      <span>5</span>
                    </el-button>
                    <div
                      class="note-options cursor-pointer mr-2 translate-y-[3px]"
                    >
                      <el-dropdown
                        placement="right-start"
                        @command="handleDropdownCommand"
                        trigger="click"
                        :popper-options="{
                          modifiers: [
                            { name: 'offset', options: { offset: [-10, 12] } },
                          ],
                        }"
                        class="custom-dropdown"
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
import { computed } from 'vue'
import { isDark, toggleDark } from '../composables'
import { Moon, Sunny, ChatRound, MoreFilled } from '@element-plus/icons-vue'

export default {
  name: 'HoarderNotes',
  components: {
    Sunny,
    Moon,
    ChatRound,
    MoreFilled,
  },
  setup() {
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

    const handleReplyClick = () => {
      console.log('Reply clicked but does nothing')
    }

    const handleChatClick = () => {
      console.log('Chat clicked')
      // Logic for chat
    }

    const handleTimeClick = () => {
      console.log('Time clicked')
      // Placeholder logic for time click
    }

    const replyText =
      'This is a sample reply text that is limited to 100 characters.'

    return {
      isDark: darkMode,
      handleToggleDark,
      handleDropdownCommand,
      handleReplyClick,
      handleChatClick,
      handleTimeClick,
      replyText,
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
  /* Added classes to reduce space between tags and margin-bottom */
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
  /* Ensures it looks like a link without changing its appearance */
}

/* Custom Styles for Tags */
.custom-tag {
  background-color: var(--tag-bg-color);
  color: var(--faded-text-color);
  border: none;
}

.custom-tag:hover {
  color: var(--text-color); /* Highlight text on hover similar to menu items */
}

/* Custom Styles for Dropdown Menu */
.custom-dropdown >>> .el-dropdown-menu {
  background-color: var(--dropdown-bg-color) !important;
  border: 1px solid var(--dropdown-bg-color) !important; /* Match border to menu color */
}

.custom-dropdown >>> .el-dropdown-item {
  color: var(--text-color);
}

.custom-dropdown >>> .el-dropdown-item:hover {
  background-color: var(--note-bright-color);
  color: var(--text-color) !important;
}

/* Remove white border on hover for note-options */
.note-options:hover,
.note-options:focus {
  border: none;
  outline: none;
}
</style>
