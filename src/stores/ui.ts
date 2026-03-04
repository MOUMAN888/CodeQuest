import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
  const aiPanelVisible = ref(false)
  const aiPrefill = ref<string>('')

  function openAiPanel() {
    aiPanelVisible.value = true
  }

  function closeAiPanel() {
    aiPanelVisible.value = false
  }

  function toggleAiPanel() {
    aiPanelVisible.value = !aiPanelVisible.value
  }

  function setAiPrefill(text: string) {
    aiPrefill.value = text
  }

  function clearAiPrefill() {
    aiPrefill.value = ''
  }

  return { aiPanelVisible, aiPrefill, openAiPanel, closeAiPanel, toggleAiPanel, setAiPrefill, clearAiPrefill }
})

