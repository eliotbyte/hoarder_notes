<template>
  <n-config-provider :theme="theme">
    <n-message-provider>
      <router-view></router-view>
    </n-message-provider>
  </n-config-provider>
</template>

<script>
import { defineComponent, computed } from 'vue'
import { darkTheme } from 'naive-ui'
import { isDark } from './composables'

export default defineComponent({
  name: 'App',
  setup() {
    const theme = computed(() => (isDark.value ? darkTheme : null))
    return { theme }
  },
})
</script>

<style>
/* Styles */
</style>
