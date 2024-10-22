<template>
  <div class="note">
    <!-- Note content -->
    <div :class="['note-content', { blurred: note.deleted }]">
      <div v-if="note.parentId" class="note-reply">
        <span class="note-reply-link" @click="handleReplyClick(note)">
          {{ note.parentTextPreview }}
        </span>
      </div>
      <div class="note-text">
        {{ note.text }}
      </div>
      <div v-if="note.tags" class="note-tags">
        <n-button
          v-for="tag in note.tags"
          :key="tag"
          size="small"
          round
          class="custom-tag"
        >
          {{ tag }}
        </n-button>
      </div>
      <div class="note-footer">
        <div class="note-time clickable-link" @click="handleTimeClick(note)">
          {{ formatTime(note.createdAt) }}
        </div>
        <div class="note-stats">
          <n-button
            v-if="note.replyCount > 0"
            text
            class="inline-flex items-center faded-text"
            @click="handleChatClick(note)"
          >
            <n-icon class="icon-margin faded-text">
              <Reply />
            </n-icon>
            <span class="faded-text">
              {{ note.replyCount }}
            </span>
          </n-button>
          <n-dropdown
            trigger="click"
            placement="bottom-end"
            :options="dropdownOptions"
            @select="handleDropdownCommand"
          >
            <n-button text class="inline-flex items-center faded-text">
              <n-icon><More /></n-icon>
            </n-button>
          </n-dropdown>
        </div>
      </div>
    </div>

    <!-- Overlay for deleted note -->
    <div v-if="note.deleted" class="note-overlay">
      <div class="note-overlay-content">
        <div class="note-deleted-text">Note was deleted</div>
        <n-button
          size="small"
          class="note-deleted-cancel"
          @click="handleCancelClick"
          >Cancel</n-button
        >
      </div>
    </div>
  </div>
</template>

<script>
import { NButton, NIcon, NDropdown } from 'naive-ui'
import {
  ArrowUndoOutline as Reply,
  EllipsisVerticalOutline as More,
} from '@vicons/ionicons5'

export default {
  name: 'NoteItem',
  components: {
    NButton,
    NIcon,
    NDropdown,
    Reply,
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
  data() {
    return {
      dropdownOptions: [
        { label: 'Reply', key: 'reply' },
        { label: 'Edit', key: 'edit' },
        { label: 'Delete', key: 'delete' },
      ],
    }
  },
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
    handleDropdownCommand(key) {
      this.$emit('dropdown-command', key, this.note)
    },
    handleCancelClick() {
      // Implement undo delete functionality if needed
    },
  },
}
</script>

<style scoped>
.note {
  position: relative;
  border-radius: 15px;
  padding: 8px 12px;
  background-color: var(--block-color);
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden; /* Ensure child elements are clipped to border radius */
}

.note-content {
  /* No changes needed here */
}

.blurred {
  filter: blur(2px);
}

.note-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(var(--block-color-rgb), 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  border-radius: inherit; /* Inherit border radius from parent */
  z-index: 1; /* Ensure it sits above the content */
}

.note-overlay-content {
  text-align: center;
}

.note-deleted-text {
  font-size: 20px;
  color: var(--text-color);
  font-weight: normal;
}

.note-deleted-cancel {
  margin-top: 8px;
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
  margin-bottom: 5px;
}

.note-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
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

.faded-text {
  color: var(--faded-text-color);
}
</style>
