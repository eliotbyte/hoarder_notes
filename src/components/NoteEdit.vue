<template>
  <div class="note-edit">
    <div class="note-content">
      <!-- Reply Block -->
      <div v-if="reply" class="note-reply">
        <span class="note-reply-link" @click="handleReplyClick(reply)">
          {{ reply.textPreview }}
        </span>
        <n-icon
          size="20"
          class="note-reply-remove-icon"
          @click="handleRemoveReply"
        >
          <Close />
        </n-icon>
      </div>

      <!-- Note Text Input -->
      <n-input
        :value="text"
        type="textarea"
        placeholder="Enter text..."
        autosize
        :maxlength="CHARACTER_LIMIT"
        class="note-text-input"
        @update:value="updateText"
        @input="emitInput"
      />

      <!-- Character Count -->
      <div v-if="showCharacterCount" class="character-count">
        {{ text.length }} / {{ CHARACTER_LIMIT }}
      </div>

      <!-- Tags Input -->
      <div class="note-tags">
        <div class="tags-input">
          <div v-for="(tag, index) in tags" :key="index" class="tag">
            <span class="tag-text" @click="editTag(index)">{{ tag }}</span>
            <n-icon size="16" class="tag-remove-icon" @click="removeTag(index)">
              <Close />
            </n-icon>
          </div>
          <input
            v-model="tagInput"
            @keydown.space.prevent="addTag"
            @input="emitInput"
            placeholder="Enter tags..."
            class="tag-input-field"
          />
        </div>
      </div>

      <!-- Create and Cancel Buttons -->
      <div class="note-footer">
        <n-button
          type="primary"
          :disabled="text.length > CHARACTER_LIMIT"
          @click="handleCreate"
        >
          {{ editing ? 'Update' : 'Create' }}
        </n-button>
        <n-button @click="handleCancel">Cancel</n-button>
      </div>
    </div>
  </div>
</template>

<script>
import { NButton, NInput, NIcon, useDialog } from 'naive-ui'
import { Close } from '@vicons/ionicons5'
import { CHARACTER_LIMIT } from '@/constants/limits' // Import from constants file

export default {
  name: 'NoteEdit',
  components: {
    NButton,
    NInput,
    NIcon,
    Close,
  },
  props: {
    note: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['create', 'input', 'cancel'],
  data() {
    return {
      text: this.note?.text || '',
      tags: this.note?.tags ? [...this.note.tags] : [],
      tagInput: '',
      reply: this.note?.parentId
        ? {
            id: this.note.parentId,
            textPreview: this.note.parentTextPreview,
          }
        : null,
      editing: !!this.note?.id,
      CHARACTER_LIMIT, // Use the constant
    }
  },
  computed: {
    showCharacterCount() {
      return this.text.length >= CHARACTER_LIMIT * 0.8
    },
  },
  methods: {
    handleRemoveReply() {
      const dialog = useDialog()
      dialog.warning({
        title: 'Confirm Deletion',
        content: 'Are you sure you want to delete the reply?',
        positiveText: 'Yes',
        negativeText: 'No',
        onPositiveClick: () => {
          this.reply = null
          this.emitInput()
        },
      })
    },
    addTag() {
      if (this.tagInput.trim()) {
        this.tags.push(this.tagInput.trim())
        this.tagInput = ''
        this.emitInput()
      }
    },
    removeTag(index) {
      this.tags.splice(index, 1)
      this.emitInput()
    },
    editTag(index) {
      this.tagInput = this.tags[index]
      this.tags.splice(index, 1)
      this.emitInput()
    },
    handleCreate() {
      this.$emit('create', {
        text: this.text,
        tags: this.tags,
        parentId: this.reply ? this.reply.id : null,
      })
    },
    handleCancel() {
      this.$emit('cancel')
    },
    handleReplyClick() {
      // Implement if needed
    },
    emitInput() {
      this.$emit('input')
    },
    updateText(value) {
      this.text = value
      this.emitInput()
    },
  },
  watch: {
    note: {
      handler(newNote) {
        this.text = newNote?.text || ''
        this.tags = newNote?.tags ? [...newNote.tags] : []
        this.tagInput = ''
        this.reply = newNote?.parentId
          ? {
              id: newNote.parentId,
              textPreview: newNote.parentTextPreview,
            }
          : null
        this.editing = !!newNote?.id
      },
      immediate: true,
      deep: true,
    },
    text() {
      this.emitInput()
    },
  },
}
</script>

<style scoped>
.note-edit {
  position: relative;
  border-radius: 15px;
  padding: 8px 12px;
  background-color: var(--block-color);
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.05);
  width: 537.5px;
}

.note-content {
  /* No changes needed here */
}

.note-text-input {
  width: 100%;
  margin-top: 10px;
  font-size: 20px;
  border-radius: 10px;
}

.character-count {
  text-align: right;
  margin-top: 5px;
  font-size: 14px;
  color: var(--faded-text-color);
}

.tags-input {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-top: 10px;
  padding: 8px;
  background-color: var(--overlay-bg-color);
  border-radius: 10px;
}

.tag {
  display: flex;
  align-items: center;
  background-color: var(--tag-bg-color);
  border-radius: 10px;
  padding: 4px 8px;
  margin-right: 5px;
  margin-bottom: 5px;
}

.tag-text {
  color: var(--text-color);
  cursor: pointer;
}

.tag-remove-icon {
  margin-left: 4px;
  cursor: pointer;
}

.tag-input-field {
  border: none;
  outline: none;
  background: transparent;
  color: var(--text-color);
  flex: 1;
  min-width: 100px;
}

.note-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.note-footer n-button:first-child {
  margin-right: 8px;
}

.note-reply {
  background-color: var(--overlay-bg-color);
  border-radius: 10px;
  padding: 8px;
  font-size: 14px;
  color: var(--faded-text-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.note-reply-link {
  color: inherit;
  cursor: pointer;
  flex: 1;
}

.note-reply-remove-icon {
  cursor: pointer;
  color: var(--faded-text-color);
  margin-left: 8px;
}
</style>
