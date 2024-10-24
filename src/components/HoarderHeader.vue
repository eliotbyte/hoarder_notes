<template>
  <n-layout-header :class="['header', { 'header--hidden': !isHeaderVisible }]">
    <div class="header-container">
      <div class="header-left">
        <h1 class="header-title">Hoarder Notes</h1>
      </div>
      <div class="header-right">
        <n-button text @click="handleToggleDark">
          <n-icon v-if="!isDark">
            <SunnyIcon />
          </n-icon>
          <n-icon v-else>
            <MoonIcon />
          </n-icon>
        </n-button>
      </div>
    </div>
  </n-layout-header>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { NLayoutHeader, NButton, NIcon } from 'naive-ui'
import {
  SunnyOutline as SunnyIcon,
  MoonOutline as MoonIcon,
} from '@vicons/ionicons5'
import { isDark, toggleDark } from '../composables'

export default {
  name: 'HoarderHeader',
  components: {
    NLayoutHeader,
    NButton,
    NIcon,
    SunnyIcon,
    MoonIcon,
  },
  setup() {
    const isHeaderVisible = ref(true)
    let lastScrollPosition =
      window.pageYOffset || document.documentElement.scrollTop

    const onScroll = () => {
      const currentScrollPosition =
        window.pageYOffset || document.documentElement.scrollTop

      if (currentScrollPosition > lastScrollPosition) {
        // Scrolling down
        isHeaderVisible.value = false
      } else {
        // Scrolling up
        isHeaderVisible.value = true
      }
      lastScrollPosition =
        currentScrollPosition <= 0 ? 0 : currentScrollPosition
    }

    onMounted(() => {
      window.addEventListener('scroll', onScroll)
    })

    onUnmounted(() => {
      window.removeEventListener('scroll', onScroll)
    })

    const darkMode = computed(() => isDark.value)

    const handleToggleDark = () => {
      toggleDark()
    }

    return {
      isHeaderVisible,
      isDark: darkMode,
      handleToggleDark,
    }
  },
}
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: var(--bg-color);
  border-bottom: 1px solid #ccc;
  z-index: 100;
  transition: transform 0.3s ease;
}

.header--hidden {
  transform: translateY(-100%);
}

.header-container {
  width: 1169px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
}

.header-title {
  font-size: 24px;
  color: var(--text-color);
}

.n-icon {
  font-size: 24px;
  color: var(--text-color);
}
</style>
