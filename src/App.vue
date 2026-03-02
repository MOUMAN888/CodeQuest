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
  min-height: 100vh;
}
</style>
