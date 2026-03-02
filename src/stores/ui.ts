import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
  const aiPanelVisible = ref(false)

  function openAiPanel() {
    aiPanelVisible.value = true
  }

  function closeAiPanel() {
    aiPanelVisible.value = false
  }

  function toggleAiPanel() {
    aiPanelVisible.value = !aiPanelVisible.value
  }

  return { aiPanelVisible, openAiPanel, closeAiPanel, toggleAiPanel }
})

