import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

export type Theme = 'dark' | 'light'

const THEME_KEY = 'codequest-theme'

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function loadStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  const stored = localStorage.getItem(THEME_KEY) as Theme | null
  if (stored === 'dark' || stored === 'light') return stored
  // 默认主题固定为暗色系
  return 'dark'
}

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return
  document.body.setAttribute('data-theme', theme)
}

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<Theme>(loadStoredTheme())

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  function setTheme(value: Theme) {
    theme.value = value
  }

  watch(
    theme,
    (val) => {
      applyTheme(val)
      if (typeof localStorage !== 'undefined') localStorage.setItem(THEME_KEY, val)
    },
    { immediate: true }
  )

  const isDark = () => theme.value === 'dark'
  const isLight = () => theme.value === 'light'

  return { theme, toggleTheme, setTheme, isDark, isLight }
})
