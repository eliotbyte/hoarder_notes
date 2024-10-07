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
              <div
                class="note bg-white rounded-[15px] px-3 py-[10px] space-y-3"
              >
                <div class="note-text text-2xl">Note text</div>
                <div class="note-footer flex justify-between">
                  <div class="note-tags text-gray-600">tag1, tag2</div>
                  <div class="note-time text-gray-400">5 hours ago</div>
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
import { Moon, Sunny } from '@element-plus/icons-vue'

export default {
  name: 'HoarderNotes',
  components: {
    Sunny,
    Moon,
  },
  setup() {
    const darkMode = computed(() => isDark.value)

    const handleToggleDark = () => {
      console.log('Toggle dark mode clicked')
      toggleDark()
    }

    return {
      isDark: darkMode,
      handleToggleDark,
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
  padding-bottom: 10px;
  background-color: var(--block-color);
}

.note-text {
  font-size: 20px;
  color: var(--text-color);
}

.note-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
}

.note-tags {
  flex-grow: 1;
  color: var(--text-color);
}

.note-time {
  color: var(--text-color);
}
</style>
