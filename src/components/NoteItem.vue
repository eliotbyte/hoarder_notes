<template>
  <div class="note bg-white rounded-[15px] space-y-3">
    <div v-if="note.parentId" class="note-reply p-2 rounded-[10px]">
      <span class="note-reply-link" @click="handleReplyClick(note)">
        {{ note.parentTextPreview }}
      </span>
    </div>
    <div class="note-text text-2xl break-words">
      {{ note.text }}
    </div>
    <div v-if="note.tags" class="note-tags text-gray-600 space-x-1 mb-[5px]">
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
    <div class="note-footer flex justify-between items-center mt-1">
      <div class="note-time clickable-link" @click="handleTimeClick(note)">
        {{ formatTime(note.createdAt) }}
      </div>
      <div class="note-stats flex items-center text-gray-600 space-x-2">
        <el-button
          type="text"
          class="inline-flex items-center faded-text"
          @click="handleChatClick(note)"
        >
          <el-icon class="icon-margin faded-text">
            <ChatRound />
          </el-icon>
          <span v-if="note.replyCount > 0" class="faded-text">
            {{ note.replyCount }}
          </span>
        </el-button>
        <el-button type="text" class="inline-flex items-center faded-text">
          <el-dropdown
            placement="right-start"
            :popper-options="{
              modifiers: [{ name: 'offset', options: { offset: [-10, 12] } }],
            }"
            trigger="click"
            class="custom-dropdown faded-text"
            @command="handleDropdownCommand"
          >
            <span class="el-dropdown-link">
              <el-icon><More /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="reply">Reply</el-dropdown-item>
                <el-dropdown-item command="edit">Edit</el-dropdown-item>
                <el-dropdown-item command="delete">Delete</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { ChatRound, More } from '@element-plus/icons-vue'

export default {
  name: 'NoteItem',
  components: {
    ChatRound,
    More,
  },
  props: {
    note: {
      type: Object,
      required: true,
    },
    formatTime: {
      type: Function,
      required: true,
    },
  },
  emits: ['reply-click', 'chat-click', 'time-click', 'dropdown-command'],
  methods: {
    handleReplyClick(note) {
      this.$emit('reply-click', note)
    },
    handleChatClick(note) {
      this.$emit('chat-click', note)
    },
    handleTimeClick(note) {
      this.$emit('time-click', note)
    },
    handleDropdownCommand(command) {
      this.$emit('dropdown-command', command, this.note)
    },
  },
}
</script>

<style scoped>
.note {
  border-radius: 15px;
  padding: 10px 12px 5px 12px;
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

.faded-text {
  color: var(--faded-text-color);
}
</style>
