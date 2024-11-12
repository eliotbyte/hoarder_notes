<template>
  <div class="note-tags">
    <div class="tags-input">
      <div v-for="(tag, index) in tags" :key="index" class="tag">
        <span class="tag-text" @click="editTag(index)">{{ tag }}</span>
        <n-icon size="16" class="tag-remove-icon" @click="removeTag(index)">
          <CloseIcon />
        </n-icon>
      </div>
      <input
        v-model="tagInput"
        @keydown.space.prevent="addTag"
        placeholder="Enter tags..."
        class="tag-input-field"
      />
    </div>
  </div>
</template>

<script>
import { NIcon } from 'naive-ui'
import { Close as CloseIcon } from '@vicons/ionicons5'

export default {
  name: 'TagInput',
  components: {
    NIcon,
    CloseIcon,
  },
  props: {
    modelValue: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      tags: [...this.modelValue],
      tagInput: '',
    }
  },
  watch: {
    modelValue(newValue) {
      this.tags = [...newValue]
    },
  },
  methods: {
    addTag() {
      if (this.tagInput.trim()) {
        this.tags.push(this.tagInput.trim())
        this.tagInput = ''
        this.updateValue()
      }
    },
    removeTag(index) {
      this.tags.splice(index, 1)
      this.updateValue()
    },
    editTag(index) {
      this.tagInput = this.tags[index]
      this.tags.splice(index, 1)
      this.updateValue()
    },
    updateValue() {
      this.$emit('update:modelValue', this.tags)
    },
  },
}
</script>

<style scoped>
.note-tags {
  font-size: 16px;
  color: var(--text-color);
  margin-bottom: 5px;
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
</style>
