<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useUIStore } from '@/stores/ui'

const themeStore = useThemeStore()
const ui = useUIStore()
const router = useRouter()

const themeIcon = computed(() =>
  themeStore.theme === 'dark' ? '🌙' : '☀️'
)

function toggleTheme() {
  themeStore.toggleTheme()
}

function toggleAI() {
  ui.toggleAiPanel()
}

function goFavorites() {
  router.push({ name: 'favorites' })
}
</script>

<template>
  <div class="top-controls">
    <button
      class="control-btn"
      type="button"
      title="切换主题"
      @click="toggleTheme"
    >
      <span class="theme-icon" aria-hidden="true">{{ themeIcon }}</span>
    </button>
    <button
      class="control-btn"
      type="button"
      title="AI 助手"
      @click="toggleAI"
    >
      <span class="ai-icon" aria-hidden="true">🤖</span>
    </button>
    <button
      class="control-btn"
      type="button"
      title="收藏夹"
      @click="goFavorites"
    >
      <span aria-hidden="true">★</span>
    </button>
  </div>
</template>

<style scoped>
.top-controls {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 15px;
  z-index: 1100;
}

.theme-icon {
  font-size: 1.25rem;
}

.control-btn {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: var(--card);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border);
  color: var(--text);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, border-color 0.2s;
}

.control-btn:hover {
  transform: rotate(15deg) scale(1.1);
  border-color: var(--accent);
}
</style>

