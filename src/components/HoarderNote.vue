<!-- ./src/components/HoarderNote.vue -->

<template>
  <div
    :class="['note', { 'selected-note': isSelected }]"
    @click="handleClick"
    @contextmenu.prevent="showContextMenu"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    :style="{
      cursor: selectionMode
        ? selectionAction === 'select'
          ? 'copy'
          : 'alias'
        : 'default',
    }"
  >
    <div v-if="note.parentId" class="reply-preview-in-note">
      <router-link :to="`/note/${note.parentId}`">{{
        parentNoteTextShort
      }}</router-link>
    </div>
    <div class="note-text">{{ note.text }}</div>
    <div v-if="hasTags" class="note-tags">
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
      <div class="note-buttons">
        <img
          src="https://www.svgrepo.com/download/514218/reply.svg"
          alt="Reply Icon"
          class="reply-icon w-5 h-5 cursor-pointer icon-filter"
          @click.stop="replyToNote"
        />
        <span v-if="replyCount > 0" class="reply-count">{{ replyCount }}</span>
      </div>
      <div class="note-time" :title="formattedFullDate">
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
      selectionAction: null,
      startX: 0,
      startY: 0,
      selectionDragActive: false,
      mouseDownTimeout: null,
      isTextSelecting: false,
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
    handleClick(event) {
      if (this.selectionMode) {
        if (this.selectionDragActive) {
          // Если было активное перетаскивание, предотвращаем действие по клику
          this.selectionDragActive = false
          this.selectionAction = null
          event.preventDefault()
          return
        }
        this.toggleSelection()
        event.preventDefault()
      }
    },
    toggleSelection() {
      if (this.isSelected) {
        this.setSelectedNotes(
          this.selectedNotes.filter((n) => n.id !== this.note.id)
        )
      } else {
        this.setSelectedNotes([...this.selectedNotes, this.note])
      }
      this.isSelected = !this.isSelected
    },
    showContextMenu(event) {
      this.$emit('showContextMenu', {
        note: this.note,
        x: event.pageX,
        y: event.pageY,
      })
    },
    replyToNote() {
      this.$emit('replyNote', this.note)
    },
    handleMouseDown(event) {
      if (event.button !== 0) return // Обрабатываем только левую кнопку мыши
      this.isMouseDown = true
      this.startX = event.clientX
      this.startY = event.clientY
      this.selectionDragActive = false
      this.isTextSelecting = false

      // Проверяем, началось ли выделение текста
      const selection = window.getSelection()
      if (selection && selection.type === 'Range') {
        this.isTextSelecting = true
      }

      this.mouseDownTimeout = setTimeout(() => {
        if (!this.isTextSelecting) {
          this.enterSelectionMode()

          if (this.isSelected) {
            this.selectionAction = 'deselect'
          } else {
            this.selectionAction = 'select'
          }
          this.applySelectionAction()
        }
      }, 200) // Таймаут для определения долгого нажатия
    },
    handleMouseMove(event) {
      if (this.isMouseDown) {
        const deltaX = Math.abs(event.clientX - this.startX)
        const deltaY = Math.abs(event.clientY - this.startY)
        if (deltaX > 5 || deltaY > 5) {
          this.selectionDragActive = true
        }

        if (this.isTextSelecting) {
          // Проверяем, перешла ли мышь на другую заметку
          const elementUnderCursor = document.elementFromPoint(
            event.clientX,
            event.clientY
          )
          if (elementUnderCursor) {
            const noteElement = elementUnderCursor.closest('.note')
            if (noteElement && noteElement !== this.$el) {
              // Переходим в режим мультивыделения
              this.isTextSelecting = false
              this.enterSelectionMode()
              // Сбрасываем выделение текста
              window.getSelection().removeAllRanges()
              // Применяем действие выделения
              if (this.isSelected) {
                this.selectionAction = 'deselect'
              } else {
                this.selectionAction = 'select'
              }
              this.applySelectionAction()
              this.selectionAction = 'select' // Начинаем выделять новые заметки
            }
          }
        } else if (this.selectionMode && this.selectionAction) {
          // Выделение или снятие выделения заметок при перетаскивании
          const elementUnderCursor = document.elementFromPoint(
            event.clientX,
            event.clientY
          )
          if (elementUnderCursor) {
            const noteElement = elementUnderCursor.closest('.note')
            if (
              noteElement &&
              noteElement.__vue__ &&
              noteElement.__vue__ !== this
            ) {
              noteElement.__vue__.applySelectionActionFromOutside(
                this.selectionAction
              )
            }
          }
          // Предотвращаем выделение текста во время перетаскивания
          event.preventDefault()
        }
      }
    },
    handleMouseUp(event) {
      if (event.button !== 0) return
      this.isMouseDown = false
      clearTimeout(this.mouseDownTimeout)

      // Не переключаем выделение при клике, если было активное перетаскивание
      if (this.selectionMode && this.selectionDragActive) {
        this.selectionDragActive = false
        this.selectionAction = null
        event.preventDefault()
        return
      }

      this.selectionAction = null
    },
    applySelectionAction() {
      if (this.selectionAction === 'select') {
        if (!this.isSelected) {
          this.setSelectedNotes([...this.selectedNotes, this.note])
          this.isSelected = true
        }
      } else if (this.selectionAction === 'deselect') {
        if (this.isSelected) {
          this.setSelectedNotes(
            this.selectedNotes.filter((n) => n.id !== this.note.id)
          )
          this.isSelected = false
        }
      }
    },
    applySelectionActionFromOutside(action) {
      this.selectionAction = action
      this.applySelectionAction()
    },
    enterSelectionMode() {
      if (!this.selectionMode) {
        this.setSelectionMode(true)
        this.setSelectedNotes([this.note])
        this.isSelected = true
        // Сбрасываем выделение текста
        window.getSelection().removeAllRanges()
      }
    },
    handleGlobalMouseUp() {
      this.isMouseDown = false
      clearTimeout(this.mouseDownTimeout)
      this.selectionAction = null
      this.selectionDragActive = false
      this.isTextSelecting = false
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

/* Добавляем стиль для отключения выделения текста при режиме выделения */
.disable-text-selection {
  user-select: none;
}
</style>
