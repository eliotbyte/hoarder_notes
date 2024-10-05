<!-- ./src/components/HoarderNote.vue -->

<template>
  <div
    :class="['note', { 'selected-note': isSelected }]"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @contextmenu="handleContextMenu"
  >
    <div
      v-if="note.parentId"
      class="reply-preview-in-note"
      :class="{ 'disable-pointer-events': selectionMode }"
      @mousedown.stop
    >
      <router-link :to="`/note/${note.parentId}`">{{
        parentNoteTextShort
      }}</router-link>
    </div>
    <div class="note-text" :class="{ 'disable-text-selection': selectionMode }">
      <span>{{ note.text }}</span>
    </div>
    <div
      v-if="hasTags"
      class="note-tags"
      :class="{ 'disable-pointer-events': selectionMode }"
    >
      <a
        v-for="tag in filteredTags"
        :key="tag"
        href="#"
        class="note-tag"
        @click.prevent
      >
        {{ tag }}
      </a>
    </div>
    <div class="note-bottom">
      <div
        class="note-buttons"
        :class="{ 'disable-pointer-events': selectionMode }"
      >
        <img
          src="https://www.svgrepo.com/download/514218/reply.svg"
          alt="Reply Icon"
          class="reply-icon w-5 h-5 cursor-pointer icon-filter"
          @click.stop="replyToNote"
        />
        <span v-if="replyCount > 0" class="reply-count">{{ replyCount }}</span>
      </div>
      <div
        class="note-time"
        :title="formattedFullDate"
        :class="{ 'disable-pointer-events': selectionMode }"
      >
        <router-link :to="`/note/${note.id}`">{{ formattedDate }}</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import moment from 'moment'

export default {
  props: {
    note: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      isSelected: false,
      isMouseDown: false,
      isDragging: false,
      selectionAction: null, // 'select' or 'deselect'
      startX: 0,
      startY: 0,
      mouseDownTimeout: null,
      hasExitedNote: false,
      isSelectingText: false,
    }
  },
  computed: {
    ...mapState(['selectedNotes', 'notes', 'selectionMode']),
    replyCount() {
      return this.notes.filter((n) => n.parentId === this.note.id).length
    },
    formattedDate() {
      const createdAt = moment(this.note.createdAt)
      const now = moment()
      const diff = now.diff(createdAt, 'minutes')

      if (diff < 1) return 'Now'
      if (diff < 5) return `${diff} minutes ago`
      if (diff < 60) return `${Math.floor(diff / 5) * 5} minutes ago`
      if (diff < 12 * 60) return `${now.diff(createdAt, 'hours')} hours ago`
      if (now.isSame(createdAt, 'day'))
        return `Today at ${createdAt.format('H:mm')}`
      if (now.subtract(1, 'day').isSame(createdAt, 'day'))
        return `Yesterday at ${createdAt.format('H:mm')}`
      if (now.isSame(createdAt, 'year'))
        return createdAt.format('MMMM D at H:mm')
      return createdAt.format('YYYY MMMM D')
    },
    formattedFullDate() {
      return moment(this.note.createdAt).format('DD-MM-YYYY H:mm')
    },
    parentNoteText() {
      const parentNote = this.notes.find((n) => n.id === this.note.parentId)
      return parentNote ? parentNote.text : ''
    },
    parentNoteTextShort() {
      const text = this.parentNoteText
      return text.length > 100 ? text.substring(0, 100) + '...' : text
    },
    filteredTags() {
      return (this.note.tags || []).filter((tag) => tag && tag.trim())
    },
    hasTags() {
      return this.filteredTags.length > 0
    },
  },
  watch: {
    selectedNotes(newVal) {
      this.isSelected = newVal.some((n) => n.id === this.note.id)
    },
    selectionMode(newVal) {
      if (!newVal) {
        this.isSelected = false
      }
    },
  },
  methods: {
    ...mapMutations(['setSelectedNotes', 'setSelectionMode']),
    handleMouseDown(event) {
      if (event.button !== 0) return // Only handle left-click

      // Ignore mousedown events originating from note-text
      if (event.target.closest('.note-text')) {
        return
      }

      this.isMouseDown = true
      this.startX = event.clientX
      this.startY = event.clientY
      this.isDragging = false
      this.hasExitedNote = false
      this.isSelectingText = false

      // Start a timer for long press
      if (this.selectionMode) {
        // In selection mode, toggle selection immediately
        if (this.isSelected) {
          this.selectionAction = 'deselect'
          this.toggleSelection()
        } else {
          this.selectionAction = 'select'
          this.toggleSelection()
        }
      } else {
        this.mouseDownTimeout = setTimeout(() => {
          if (
            !this.isDragging &&
            !this.hasExitedNote &&
            !this.isSelectingText
          ) {
            this.enterSelectionMode()
            // Set selection action based on current selection state
            if (this.isSelected) {
              this.selectionAction = 'deselect'
            } else {
              this.selectionAction = 'select'
            }
          }
        }, 500) // 0.5 seconds
      }
    },
    handleMouseMove(event) {
      if (!this.isMouseDown) return

      const deltaX = Math.abs(event.clientX - this.startX)
      const deltaY = Math.abs(event.clientY - this.startY)

      if (deltaX > 5 || deltaY > 5) {
        this.isDragging = true
        // Prevent text selection while dragging
        window.getSelection().removeAllRanges()
        event.preventDefault()
      }
    },
    handleMouseUp(event) {
      if (event.button !== 0) return
      this.isMouseDown = false
      clearTimeout(this.mouseDownTimeout)
      this.selectionAction = null
      this.isDragging = false
      this.hasExitedNote = false
      this.isSelectingText = false
    },
    handleGlobalMouseUp() {
      this.isMouseDown = false
      clearTimeout(this.mouseDownTimeout)
      this.selectionAction = null
      this.isDragging = false
      this.hasExitedNote = false
      this.isSelectingText = false
    },
    handleMouseEnter() {
      if (this.isMouseDown && this.selectionMode && this.selectionAction) {
        if (this.selectionAction === 'select' && !this.isSelected) {
          this.toggleSelection()
        } else if (this.selectionAction === 'deselect' && this.isSelected) {
          this.toggleSelection()
        }
      }
    },
    handleMouseLeave() {
      if (this.isMouseDown && !this.selectionMode) {
        clearTimeout(this.mouseDownTimeout)
        this.hasExitedNote = true

        this.enterSelectionMode()
        // Set selection action based on current selection state
        if (this.isSelected) {
          this.selectionAction = 'deselect'
        } else {
          this.selectionAction = 'select'
        }
        this.toggleSelection() // Apply action to the initial note
      }
    },
    handleContextMenu(event) {
      event.preventDefault() // Disable the standard context menu
      const { pageX: x, pageY: y } = event

      // Call the method to show the context menu
      this.$emit('showContextMenu', { note: this.note, x, y })
    },
    toggleSelection() {
      if (this.isSelected) {
        this.setSelectedNotes(
          this.selectedNotes.filter((n) => n.id !== this.note.id)
        )
      } else {
        this.setSelectedNotes([...this.selectedNotes, this.note])
      }
    },
    enterSelectionMode() {
      if (!this.selectionMode) {
        this.setSelectionMode(true)
        this.setSelectedNotes([this.note])
      }
    },
    replyToNote() {
      this.$emit('replyNote', this.note)
    },
  },
  mounted() {
    document.addEventListener('mouseup', this.handleGlobalMouseUp)
  },
  beforeUnmount() {
    document.removeEventListener('mouseup', this.handleGlobalMouseUp)
  },
}
</script>

<style scoped>
.note {
  width: 569px;
  padding: 16px;
  padding-bottom: 8px;
  display: flex;
  flex-direction: column;
  background-color: var(--note-background-color);
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25);
  margin-bottom: 24px;
}

.note.selected-note {
  background-color: var(--selected-note-background);
}

.note-text {
  font-size: 20px;
  color: var(--text-color);
  word-break: break-word;
  white-space: pre-wrap;
  display: inline-block;
  cursor: default;
}

.note-text.disable-text-selection {
  user-select: none;
  cursor: default;
}

.disable-text-selection {
  user-select: none;
}

.disable-pointer-events {
  pointer-events: none;
}

.note-tags {
  font-size: 16px;
  color: var(--text-color);
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
}

.note-tag {
  background-color: var(--tag-background-color);
  color: var(--tag-text-color);
  padding: 4px 8px;
  border-radius: 6px;
  margin-right: 4px;
  margin-bottom: 4px;
  font-size: 14px;
  text-decoration: none;
}

.note-tag:hover {
  background-color: var(--tag-hover-background-color);
}

.note-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.note-buttons {
  display: flex;
  align-items: center;
  flex-grow: 1;
}

.reply-count {
  font-size: 14px;
  color: var(--text-color);
  margin-left: 4px;
}

.note-time {
  font-size: 12px;
  color: var(--text-color);
}

.reply-preview-in-note {
  background-color: var(--reply-preview-background);
  color: var(--text-color);
  border-radius: 8px;
  padding: 8px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  text-decoration: none;
}

.reply-preview-in-note:hover {
  background-color: var(--hover-background-color);
}

.reply-preview-in-note span {
  user-select: text;
}

.icon-filter {
  filter: var(--icon-filter);
}
</style>
