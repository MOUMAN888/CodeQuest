<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getQuestionsByCategory, type Question } from '@/utils/questionLoader'
import { markdownToHtml } from '@/utils/markdown'
import { useQuizProgressStore } from '@/stores/quizProgress'

const props = defineProps<{ category: string }>()
const router = useRouter()
const quizProgress = useQuizProgressStore()

const normalizedCategory = computed(() => props.category || 'html')
const questions = computed<Question[]>(() => getQuestionsByCategory(normalizedCategory.value))

const currentIndex = ref<number | null>(null)
const showAnswer = ref(false)
const sidebarExpanded = ref(false)

const currentQuestion = computed<Question | null>(() => {
  if (currentIndex.value === null) return null
  return questions.value[currentIndex.value] ?? null
})

const topicTag = computed(() => {
  if (!currentQuestion.value || currentIndex.value === null) return 'TOPIC_ID: UNKNOWN'
  const cat = normalizedCategory.value.toUpperCase()
  const idx = currentIndex.value + 1
  const idxStr = idx.toString().padStart(2, '0')
  return `TOPIC_ID: ${cat}_${idxStr}`
})

const titleText = computed(
  () => currentQuestion.value?.title || '请在左侧选择一个挑战题目...'
)
const descText = computed(
  () => currentQuestion.value?.question || '通过侧边栏点击题目，揭晓详细内容。'
)

function selectQuestion(index: number) {
  if (!questions.value.length) return
  currentIndex.value = index
  showAnswer.value = false
  quizProgress.setIndex(normalizedCategory.value, index)
}

function toggleAnswer() {
  if (!currentQuestion.value) return
  showAnswer.value = !showAnswer.value
}

function nextQuestion() {
  if (!questions.value.length) return
  const total = questions.value.length
  const next = currentIndex.value === null ? 0 : (currentIndex.value + 1) % total
  selectQuestion(next)
}

function prevQuestion() {
  if (!questions.value.length) return
  const total = questions.value.length
  const prev = currentIndex.value === null ? 0 : (currentIndex.value - 1 + total) % total
  selectQuestion(prev)
}

function goHome() {
  router.push({ name: 'home' })
}

function toggleSidebar() {
  sidebarExpanded.value = !sidebarExpanded.value
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
    e.preventDefault()
    nextQuestion()
  } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
    e.preventDefault()
    prevQuestion()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

watch(
  () => normalizedCategory.value,
  () => {
    showAnswer.value = false
    if (!questions.value.length) {
      currentIndex.value = null
      return
    }
    const saved = quizProgress.getIndex(normalizedCategory.value)
    const clamped = Math.min(saved, questions.value.length - 1)
    currentIndex.value = clamped
  },
  { immediate: true }
)
</script>

<template>
  <div class="quiz-view">
    <aside class="sidebar" :class="{ expanded: sidebarExpanded }">
      <div class="sidebar-header">
        <span>[Q]</span>
        <button type="button" class="sidebar-toggle" @click="toggleSidebar">
          {{ sidebarExpanded ? '‹' : '›' }}
        </button>
      </div>
      <div class="sidebar-list">
        <button
          v-for="(q, index) in questions"
          :key="index"
          type="button"
          :class="['q-item', { active: index === currentIndex }]"
          @click="selectQuestion(index)"
        >
          <span class="q-icon" aria-hidden="true">{{ index + 1 }}.</span>
          <span class="q-title-hidden">{{ q.title }}</span>
        </button>
        <p v-if="!questions.length" class="q-empty">当前分类暂无题目</p>
      </div>
      <button type="button" class="sidebar-home" @click="goHome">
        <span class="home-icon" aria-hidden="true">🏠</span>
      </button>
    </aside>

    <main class="main-content">
      <transition name="flip-card" mode="out-in">
        <div class="content-card" :key="currentIndex ?? 'empty'">
          <div class="tag">{{ topicTag }}</div>
          <h2 class="title">{{ titleText }}</h2>
          <div class="desc">
            {{ descText }}
          </div>

          <div v-if="currentQuestion" class="ans-area" :style="{ display: showAnswer ? 'block' : 'none' }">
            <h3 class="ans-section-title">💡 解题思路</h3>
            <div class="ans-md" v-html="markdownToHtml(currentQuestion.thinking)" />
            <h3 class="ans-section-title">✅ 面试回答（示例）</h3>
            <div class="ans-md" v-html="markdownToHtml(currentQuestion.answer)" />
          </div>

          <div v-if="questions.length" class="action-btns">
            <button type="button" class="btn btn-primary" @click="toggleAnswer">
              {{ showAnswer ? '收起解题思路' : '查看解题思路' }}
            </button>
            <button type="button" class="btn btn-ghost" @click="prevQuestion">
              上一题
            </button>
            <button type="button" class="btn btn-ghost" @click="nextQuestion">
              下一题
            </button>
            <p class="keyboard-hint">可使用 ← → 或 ↑ ↓ 切换题目</p>
          </div>
        </div>
      </transition>
    </main>
  </div>
</template>

<style scoped>
.quiz-view {
  display: grid;
  grid-template-columns: auto 1fr;
  min-height: 100vh;
}

.sidebar {
  width: 72px;
  background: var(--sidebar);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  z-index: 100;
}

.sidebar.expanded {
  width: 300px;
}

.sidebar-header {
  padding: 25px;
  color: var(--accent);
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar-toggle {
  border: none;
  background: transparent;
  color: var(--text-dim);
  cursor: pointer;
  font-size: 1rem;
}

.sidebar-list {
  display: flex;
  flex-direction: column;
}

.q-item {
  padding: 20px;
  white-space: nowrap;
  overflow: hidden;
  cursor: pointer;
  border: none;
  background: transparent;
  border-left: 4px solid transparent;
  color: var(--text-dim);
  text-align: left;
  display: flex;
  align-items: center;
  gap: 10px;
}

.q-item:hover {
  background: rgba(128, 128, 128, 0.1);
  color: var(--text);
}

.q-item.active {
  border-left-color: var(--accent);
  background: var(--q-item-active-bg);
  color: var(--accent);
}

.q-icon {
  font-size: 0.8rem;
}

.q-title-hidden {
  opacity: 0;
  transition: 0.3s;
}

.sidebar.expanded .q-title-hidden {
  opacity: 1;
}

.q-empty {
  padding: 16px 20px;
  font-size: 0.85rem;
  color: var(--text-dim);
}

.sidebar-home {
  margin-top: auto;
  padding: 25px;
  cursor: pointer;
  border: none;
  background: transparent;
  color: var(--text);
}

.sidebar-home:hover {
  color: var(--accent);
}

.home-icon {
  font-size: 1.1rem;
}

.main-content {
  padding: 60px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  perspective: 1200px;
}

.content-card {
  width: 100%;
  max-width: 850px;
  background: var(--card);
  backdrop-filter: blur(20px);
  padding: 50px;
  border-radius: 30px;
  border: 1px solid var(--border);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
}

.tag {
  color: var(--accent);
  font-size: 0.8rem;
  margin-bottom: 15px;
}

.title {
  margin-bottom: 25px;
}

.desc {
  color: var(--text-dim);
  margin-bottom: 30px;
}

.ans-area {
  margin-top: 30px;
  padding: 30px;
  background: var(--ans-area-bg);
  border-radius: 15px;
  border: 1px solid var(--accent);
  line-height: 1.8;
  animation: fadeIn 0.4s;
}

.ans-section-title {
  margin: 16px 0 8px;
  font-size: 1rem;
}

.ans-section-title:first-child {
  margin-top: 0;
}

/* Markdown 内容：标题、表格、代码块等 */
.ans-area .ans-md :deep(h1),
.ans-area .ans-md :deep(h2),
.ans-area .ans-md :deep(h3),
.ans-area .ans-md :deep(h4) {
  margin: 12px 0 6px;
  font-weight: 600;
  color: var(--text);
}
.ans-area .ans-md :deep(h1) { font-size: 1.1rem; }
.ans-area .ans-md :deep(h2) { font-size: 1rem; }
.ans-area .ans-md :deep(h3),
.ans-area .ans-md :deep(h4) { font-size: 0.95rem; }
.ans-area .ans-md :deep(p) { margin: 6px 0; }
.ans-area .ans-md :deep(ul),
.ans-area .ans-md :deep(ol) { margin: 8px 0; padding-left: 1.2em; }
.ans-area .ans-md :deep(li) { margin: 2px 0; }
.ans-area .ans-md :deep(hr) { border: none; border-top: 1px solid var(--border); margin: 12px 0; }
.ans-area .ans-md :deep(table) {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  margin: 10px 0;
}
.ans-area .ans-md :deep(th),
.ans-area .ans-md :deep(td) {
  border: 1px solid var(--border);
  padding: 8px 12px;
  text-align: left;
}
.ans-area .ans-md :deep(th) { background: rgba(0,0,0,0.2); font-weight: 600; }
.ans-area .ans-md :deep(code) {
  background: rgba(0,0,0,0.25);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
}
.ans-area .ans-md :deep(pre) {
  background: rgba(0,0,0,0.3);
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 10px 0;
}
.ans-area .ans-md :deep(pre code) {
  background: none;
  padding: 0;
}
.ans-area .ans-md :deep(strong) { font-weight: 600; color: var(--text); }

.action-btns {
  margin-top: 30px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.keyboard-hint {
  width: 100%;
  margin: 8px 0 0;
  font-size: 0.75rem;
  color: var(--text-dim);
  opacity: 0.7;
}

.btn {
  padding: 12px 25px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font-weight: 600;
}

.btn-primary {
  background: var(--accent);
  color: white;
}

.btn-ghost {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text);
}

.flip-card-enter-active,
.flip-card-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.flip-card-enter-from {
  opacity: 0;
  transform: translateX(24px) rotateY(8deg);
}

.flip-card-leave-to {
  opacity: 0;
  transform: translateX(-24px) rotateY(-8deg);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .quiz-view {
    grid-template-columns: 1fr;
  }

  .sidebar {
    width: 72px;
    flex-direction: row;
    align-items: center;
  }

  .sidebar.expanded {
    width: 100%;
  }

  .sidebar-list {
    flex: 1;
    display: flex;
    flex-direction: row;
    overflow-x: auto;
  }

  .q-item {
    flex-direction: column;
    align-items: flex-start;
    min-width: 160px;
  }

  .sidebar-home {
    padding-inline: 16px;
  }

  .main-content {
    padding: 24px;
  }
}
</style>
