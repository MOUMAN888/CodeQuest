<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'
import TopControls from '@/components/TopControls.vue'
import AIPanel from '@/components/AIPanel.vue'

useThemeStore()
</script>

<template>
  <div class="app-wrap">
    <TopControls />
    <RouterView />
    <AIPanel />
  </div>
</template>

<style scoped>
.app-wrap {
  height: 100vh;
  overflow-y: auto;
  /* 隐藏页面整体滚动条 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}

.app-wrap::-webkit-scrollbar {
  width: 0;
  height: 0;
}
</style>
