<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'

type Option = {
  label: string
  value: string
}

const props = defineProps<{
  modelValue: string
  options: Option[]
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const open = ref(false)

const currentLabel = computed(() => {
  const found = props.options.find((opt) => opt.value === props.modelValue)
  return found?.label ?? props.placeholder ?? '请选择'
})

function toggleOpen() {
  open.value = !open.value
}

function onSelect(option: Option) {
  emit('update:modelValue', option.value)
  open.value = false
}

function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement | null
  if (!target) return
  const root = (document.querySelector('.base-select-root') as HTMLElement | null)
  if (root && !root.contains(target)) {
    open.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="base-select-root">
    <button
      type="button"
      class="base-select-trigger"
      :aria-expanded="open"
      @click.stop="toggleOpen"
    >
      <span class="base-select-label">{{ currentLabel }}</span>
      <span class="base-select-arrow" aria-hidden="true">▾</span>
    </button>
    <transition name="base-select-fade">
      <ul v-if="open" class="base-select-menu">
        <li
          v-for="opt in props.options"
          :key="opt.value"
          class="base-select-item"
          :class="{ active: opt.value === props.modelValue }"
          @click.stop="onSelect(opt)"
        >
          {{ opt.label }}
        </li>
      </ul>
    </transition>
  </div>
</template>

<style scoped>
.base-select-root {
  position: relative;
  min-width: 140px;
}

.base-select-trigger {
  width: 100%;
  padding: 6px 28px 6px 12px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: rgba(0, 0, 0, 0.35);
  color: var(--text);
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.base-select-trigger:hover,
.base-select-trigger[aria-expanded="true"] {
  border-color: var(--accent);
}

.base-select-arrow {
  margin-left: 8px;
  font-size: 1rem;
  opacity: 0.8;
}

.base-select-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 20;
  padding: 6px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--card);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
  max-height: 220px;
  overflow-y: auto;
  padding-right: 4px;
  scrollbar-width: thin; /* Firefox */
  scrollbar-color: var(--border) transparent;
}

.base-select-menu::-webkit-scrollbar {
  width: 6px;
}

.base-select-menu::-webkit-scrollbar-track {
  background: transparent;
}

.base-select-menu::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 999px;
}

.base-select-item {
  padding: 6px 8px;
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
}

.base-select-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.base-select-item.active {
  background: var(--q-item-active-bg);
  color: var(--accent);
}

.base-select-fade-enter-active,
.base-select-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.base-select-fade-enter-from,
.base-select-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>

