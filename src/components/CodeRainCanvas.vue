<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useThemeStore } from '@/stores/theme'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const themeStore = useThemeStore()

const CHARACTERS = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ<>[]{}&*%#@$'
const FONT_SIZE = 16
let width = 0
let height = 0
let columns = 0
let drops: number[] = []
let timer: ReturnType<typeof setInterval> | null = null

function initCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  width = canvas.width = window.innerWidth
  height = canvas.height = window.innerHeight
  columns = Math.floor(width / FONT_SIZE)
  drops = Array(columns).fill(1)
}

function drawRain() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const isLight = themeStore.theme === 'light'
  ctx.fillStyle = isLight ? 'rgba(248, 250, 252, 0.07)' : 'rgba(0, 0, 0, 0.05)'
  ctx.fillRect(0, 0, width, height)

  const rainColor = getComputedStyle(document.documentElement).getPropertyValue('--rain-color').trim()
  ctx.fillStyle = rainColor || (isLight ? '#1e40af' : '#0F0')
  ctx.font = `${FONT_SIZE}px monospace`

  for (let i = 0; i < drops.length; i++) {
    // 兼容 noUncheckedIndexedAccess，确保索引结果不是 undefined
    const current = drops[i] ?? 1
    const text = CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length))
    ctx.fillText(text, i * FONT_SIZE, current * FONT_SIZE)
    let next = current + 1
    if (current * FONT_SIZE > height && Math.random() > 0.975) next = 0
    drops[i] = next
  }
}

function startRain() {
  if (timer) return
  initCanvas()
  timer = setInterval(drawRain, 50)
}

function stopRain() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

onMounted(() => {
  startRain()
  window.addEventListener('resize', initCanvas)
})

onUnmounted(() => {
  stopRain()
  window.removeEventListener('resize', initCanvas)
})

watch(() => themeStore.theme, () => {
  drawRain()
})
</script>

<template>
  <canvas
    ref="canvasRef"
    class="bg-canvas"
    aria-hidden="true"
  />
</template>

<style scoped>
.bg-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  opacity: var(--rain-opacity, 0.15);
}
</style>
