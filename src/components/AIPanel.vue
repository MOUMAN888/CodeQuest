<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useUIStore } from '@/stores/ui'
import { sendChatMessage } from '@/api/chat'
import { markdownToHtml } from '@/utils/markdown'

const ui = useUIStore()

const MIN_WIDTH = 280
const MAX_WIDTH = 600
const DEFAULT_WIDTH = 350

const panelWidth = ref(DEFAULT_WIDTH)
const isResizing = ref(false)
let startX = 0
let startWidth = 0

function onResizeStart(e: MouseEvent) {
  if (!ui.aiPanelVisible) return
  e.preventDefault()
  isResizing.value = true
  startX = e.clientX
  startWidth = panelWidth.value
  document.body.style.userSelect = 'none'
  document.body.style.cursor = 'col-resize'
}

function onResizeMove(e: MouseEvent) {
  if (!isResizing.value) return
  const delta = startX - e.clientX
  const next = startWidth + delta
  panelWidth.value = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, next))
}

function onResizeEnd() {
  isResizing.value = false
  document.body.style.userSelect = ''
  document.body.style.cursor = ''
}

onMounted(() => {
  scrollToBottom()
  document.addEventListener('mousemove', onResizeMove)
  document.addEventListener('mouseup', onResizeEnd)
})

type ChatMessage =
  | { type: 'user'; text: string }
  | { type: 'ai'; text: string; displayedLength?: number }
  | { type: 'loading' }

const chatBoxRef = ref<HTMLDivElement | null>(null)
const inputValue = ref('')
const loading = ref(false)
const messages = ref<ChatMessage[]>([
  {
    type: 'ai',
    text: '嗨！我是能为前端开发者答疑解惑的助手，可提供全领域技术解答和工程化方案。如有任何问题，请随时告诉我。',
  },
])

const TYPING_INTERVAL_MS = 16
const TYPING_CHUNK = 2
let typingTimer: ReturnType<typeof setInterval> | null = null

function stopTypingEffect() {
  if (typingTimer !== null) {
    clearInterval(typingTimer)
    typingTimer = null
  }
}

function runTypingEffect() {
  stopTypingEffect()
  const list = messages.value
  const last = list[list.length - 1]
  if (last?.type !== 'ai' || last.displayedLength === undefined) return
  if (last.displayedLength >= last.text.length) return

  typingTimer = setInterval(() => {
    const list = messages.value
    const lastIdx = list.length - 1
    const lastMsg = list[lastIdx]
    if (lastMsg?.type !== 'ai' || lastMsg.displayedLength === undefined) {
      stopTypingEffect()
      return
    }
    const next = Math.min(lastMsg.displayedLength + TYPING_CHUNK, lastMsg.text.length)
    messages.value = list.map((m, i) =>
      i === lastIdx && m.type === 'ai'
        ? { ...m, displayedLength: next }
        : m
    )
    scrollToBottom()
    if (next >= lastMsg.text.length) stopTypingEffect()
  }, TYPING_INTERVAL_MS)
}

function scrollToBottom() {
  nextTick(() => {
    const box = chatBoxRef.value
    if (!box) return
    box.scrollTop = box.scrollHeight
  })
}

function addMessage(msg: ChatMessage) {
  messages.value.push(msg)
  scrollToBottom()
}

function removeLoading() {
  const idx = messages.value.findIndex((m) => m.type === 'loading')
  if (idx !== -1) messages.value.splice(idx, 1)
}

function renderMd(text: string): string {
  return markdownToHtml(text)
}

function getDisplayedAiText(msg: ChatMessage): string {
  if (msg.type !== 'ai') return ''
  const len = msg.displayedLength ?? msg.text.length
  return msg.text.slice(0, len)
}

function isTyping(msg: ChatMessage): boolean {
  return msg.type === 'ai' && msg.displayedLength !== undefined && msg.displayedLength < msg.text.length
}

async function send() {
  const text = inputValue.value.trim()
  if (!text || loading.value) return

  inputValue.value = ''
  addMessage({ type: 'user', text })
  addMessage({ type: 'loading' })
  loading.value = true

  try {
    const data = await sendChatMessage(text)
    removeLoading()
    if (data.success && data.reply) {
      addMessage({ type: 'ai', text: data.reply, displayedLength: 0 })
      nextTick(runTypingEffect)
    } else {
      addMessage({ type: 'ai', text: '抱歉，没有收到有效回复，请稍后再试。', displayedLength: 0 })
      nextTick(runTypingEffect)
    }
  } catch (e) {
    removeLoading()
    const errMsg =
      e && typeof e === 'object' && 'message' in e
        ? String((e as Error).message)
        : '请求失败'
    addMessage({
      type: 'ai',
      text: `网络错误：${errMsg}。请确认后端服务已启动（如 http://localhost:8000）。`,
      displayedLength: 0,
    })
    nextTick(runTypingEffect)
  } finally {
    loading.value = false
    scrollToBottom()
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault()
    send()
  }
}

function close() {
  ui.closeAiPanel()
}

onUnmounted(() => {
  stopTypingEffect()
  document.removeEventListener('mousemove', onResizeMove)
  document.removeEventListener('mouseup', onResizeEnd)
  document.body.style.userSelect = ''
  document.body.style.cursor = ''
})

watch(
  () => ui.aiPanelVisible,
  (visible) => {
    if (visible) scrollToBottom()
  }
)
</script>

<template>
  <div
    class="ai-panel"
    :class="{ active: ui.aiPanelVisible, resizing: isResizing }"
    :style="{
      width: panelWidth + 'px',
      right: ui.aiPanelVisible ? '20px' : -(panelWidth + 80) + 'px'
    }"
  >
    <div
      v-if="ui.aiPanelVisible"
      class="resize-handle"
      title="拖动调整宽度"
      @mousedown="onResizeStart"
    />
    <div class="ai-panel-inner">
    <div class="ai-panel-header">
      <h3>
        <span class="ai-icon" aria-hidden="true">🤖</span>
        <span>CodeQuest AI</span>
      </h3>
      <button class="ai-panel-close" type="button" title="关闭" @click="close">
        <span aria-hidden="true">×</span>
      </button>
    </div>

    <div ref="chatBoxRef" class="chat-box">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        :class="['chat-bubble', msg.type]"
      >
        <template v-if="msg.type === 'loading'">
          <span class="loading-label">AI 正在思考</span>
          <span class="loading-dots">
            <span class="dot" />
            <span class="dot" />
            <span class="dot" />
          </span>
        </template>
        <template v-else-if="msg.type === 'user'">
          <!-- <span class="bubble-label">你</span> -->
          <div class="bubble-content">{{ msg.text }}</div>
        </template>
        <template v-else>
          <!-- <span class="bubble-label">AI</span> -->
          <div class="bubble-content md-body">
            <span v-html="renderMd(getDisplayedAiText(msg))" />
            <span v-if="isTyping(msg)" class="typing-cursor" aria-hidden="true">|</span>
          </div>
        </template>
      </div>
    </div>

    <div class="chat-input-wrap">
      <input
        v-model="inputValue"
        type="text"
        placeholder="输入问题..."
        class="chat-input"
        :disabled="loading"
        @keydown="handleKeydown"
      />
      <button
        type="button"
        class="chat-send-btn"
        :disabled="loading"
        title="发送"
        @click="send"
      >
        发送
      </button>
    </div>
    </div>
  </div>
</template>

<style scoped>
.ai-panel {
  position: fixed;
  right: -400px;
  top: 20px;
  bottom: 20px;
  width: 350px;
  min-width: 280px;
  max-width: 600px;
  background: var(--card);
  backdrop-filter: blur(25px);
  border: 1px solid var(--border);
  border-radius: 24px;
  z-index: 1200;
  transition: 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  padding: 0;
}

.ai-panel.resizing {
  transition: none;
}

.resize-handle {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 8px;
  cursor: col-resize;
  z-index: 10;
}

.resize-handle:hover {
  background: rgba(16, 185, 129, 0.2);
}

.resize-handle::after {
  content: '';
  position: absolute;
  left: 3px;
  top: 50%;
  transform: translateY(-50%);
  width: 2px;
  height: 40px;
  border-radius: 1px;
  background: var(--border);
  opacity: 0;
  transition: opacity 0.2s;
}

.resize-handle:hover::after {
  opacity: 1;
}

.ai-panel-inner {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  padding-left: 24px;
  min-width: 0;
  min-height: 0;
}

.ai-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-shrink: 0;
}

.ai-panel-header h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.ai-icon {
  font-size: 1.25em;
}

.ai-panel-close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-dim);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.ai-panel-close:hover {
  color: var(--text);
  border-color: var(--accent);
  background: rgba(16, 185, 129, 0.1);
}

.chat-box {
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow-y: auto;
  font-size: 0.9rem;
  color: var(--text-dim);
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.chat-box::-webkit-scrollbar {
  display: none;
}

.chat-bubble {
  margin-bottom: 12px;
  padding: 10px 14px;
  border-radius: 14px;
  max-width: 100%;
  min-width: 0;
  overflow-wrap: break-word;
}

.chat-bubble.user {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  margin-left: 24px;
  margin-right: 0;
}

.chat-bubble.ai {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border);
  margin-left: 0;
  margin-right: 24px;
}

.chat-bubble.loading {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border);
  margin-left: 0;
  margin-right: 24px;
}

.bubble-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--accent);
  margin-bottom: 4px;
}

.chat-bubble.ai .bubble-label {
  color: var(--text-dim);
}

.bubble-content {
  font-size: 0.9rem;
  line-height: 1.55;
  word-break: break-word;
  max-width: 100%;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.bubble-content::-webkit-scrollbar {
  display: none;
}

/* Markdown 内容样式（AI 气泡内） */
.bubble-content.md-body :deep(h1),
.bubble-content.md-body :deep(h2),
.bubble-content.md-body :deep(h3),
.bubble-content.md-body :deep(h4) {
  margin: 12px 0 6px;
  font-weight: 600;
  color: var(--text);
}
.bubble-content.md-body :deep(h1) { font-size: 1.1rem; }
.bubble-content.md-body :deep(h2) { font-size: 1rem; }
.bubble-content.md-body :deep(h3),
.bubble-content.md-body :deep(h4) { font-size: 0.95rem; }
.bubble-content.md-body :deep(p) { margin: 6px 0; }
.bubble-content.md-body :deep(ul),
.bubble-content.md-body :deep(ol) { margin: 8px 0; padding-left: 1.2em; }
.bubble-content.md-body :deep(li) { margin: 2px 0; }
.bubble-content.md-body :deep(hr) { border: none; border-top: 1px solid var(--border); margin: 12px 0; }
.bubble-content.md-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  margin: 10px 0;
}
.bubble-content.md-body :deep(th),
.bubble-content.md-body :deep(td) {
  border: 1px solid var(--border);
  padding: 6px 10px;
  text-align: left;
}
.bubble-content.md-body :deep(th) { background: rgba(0,0,0,0.2); font-weight: 600; }
.bubble-content.md-body :deep(code) {
  background: rgba(0,0,0,0.25);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.85em;
}
.bubble-content.md-body :deep(pre) {
  background: rgba(0,0,0,0.3);
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 10px 0;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.bubble-content.md-body :deep(pre)::-webkit-scrollbar {
  display: none;
}
.bubble-content.md-body :deep(pre code) {
  background: none;
  padding: 0;
}
.bubble-content.md-body :deep(strong) { font-weight: 600; color: var(--text); }

.typing-cursor {
  display: inline-block;
  margin-left: 2px;
  color: var(--accent);
  animation: blink 0.8s step-end infinite;
}

@keyframes blink {
  50% { opacity: 0; }
}

.loading-label {
  color: var(--text-dim);
}

.loading-dots {
  display: inline-flex;
  gap: 4px;
  align-items: center;
}

.loading-dots .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  opacity: 0.6;
  animation: bounce 0.6s ease-in-out infinite;
}

.loading-dots .dot:nth-child(2) { animation-delay: 0.1s; }
.loading-dots .dot:nth-child(3) { animation-delay: 0.2s; }

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.chat-input-wrap {
  display: flex;
  gap: 8px;
  margin-top: 20px;
}

.chat-input {
  flex: 1;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: rgba(0, 0, 0, 0.1);
  color: var(--text);
  outline: none;
}

.chat-input:focus {
  border-color: var(--accent);
}

.chat-input:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.chat-send-btn {
  flex-shrink: 0;
  padding: 12px 18px;
  border-radius: 10px;
  border: none;
  background: var(--accent);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.chat-send-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.chat-send-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
