<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getQuestionsByCategory, type Question } from '@/utils/questionLoader'
import { markdownToHtml } from '@/utils/markdown'
import { useQuizProgressStore } from '@/stores/quizProgress'
import { useFavoritesStore } from '@/stores/favorites'
import { useUIStore } from '@/stores/ui'

const props = defineProps<{ category: string }>()
const router = useRouter()
const route = useRoute()
const quizProgress = useQuizProgressStore()
const favoritesStore = useFavoritesStore()
const ui = useUIStore()

const normalizedCategory = computed(() => props.category || 'html')
const questions = computed<Question[]>(() => getQuestionsByCategory(normalizedCategory.value))

const currentIndex = ref<number | null>(null)
const showAnswer = ref(false)
const sidebarExpanded = ref(false)

const currentQuestion = computed<Question | null>(() => {
  if (currentIndex.value === null) return null
  return questions.value[currentIndex.value] ?? null
})

const isCurrentFavorite = computed(() => {
  if (currentIndex.value === null) return false
  return favoritesStore.isFavorite(normalizedCategory.value, currentIndex.value)
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

// 刷题进度与统计（按当前刷到的最大题目下标粗略统计）
const totalCount = computed(() => questions.value.length)
const doneCount = computed(() => {
  if (!totalCount.value) return 0
  if (currentIndex.value === null) return 0
  return Math.min(currentIndex.value + 1, totalCount.value)
})
const remainingCount = computed(() => Math.max(totalCount.value - doneCount.value, 0))
const favoriteCount = computed(
  () => favoritesStore.getFavorites(normalizedCategory.value).length
)
const progressPercent = computed(() => {
  if (!totalCount.value) return 0
  return Math.round((doneCount.value / totalCount.value) * 100)
})

function syncIndexFromRouteOrProgress() {
  showAnswer.value = false
  if (!questions.value.length) {
    currentIndex.value = null
    return
  }

  const rawIndex = route.query.index
  let idxFromQuery: number | null = null
  if (typeof rawIndex === 'string') {
    const parsed = Number.parseInt(rawIndex, 10)
    if (Number.isInteger(parsed) && parsed >= 0 && parsed < questions.value.length) {
      idxFromQuery = parsed
    }
  }

  const baseIndex = idxFromQuery ?? quizProgress.getIndex(normalizedCategory.value)
  const clamped = Math.min(baseIndex, questions.value.length - 1)
  currentIndex.value = clamped
}

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

function toggleFavoriteCurrent() {
  if (currentIndex.value === null) return
  favoritesStore.toggleFavorite(normalizedCategory.value, currentIndex.value)
}

function askAiAboutCurrent() {
  if (!currentQuestion.value) return
  const q = currentQuestion.value
  const context = [
    `请基于下面这道前端面试题，帮助我解答或扩展说明：`,
    '',
    `【题目标题】${q.title}`,
    '',
    '【题目内容】',
    q.question,
    '',
  ].join('\n')

  ui.setAiPrefill(context)
  ui.openAiPanel()
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
  const target = e.target as HTMLElement | null
  const tag = target?.tagName

  // 避免在输入框 / 文本域中误触快捷键
  if (tag === 'INPUT' || tag === 'TEXTAREA') return

  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
    e.preventDefault()
    nextQuestion()
  } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
    e.preventDefault()
    prevQuestion()
  } else if (e.code === 'Space' || e.key === ' ') {
    // 空格键：切换解题思路显示 / 收起
    e.preventDefault()
    toggleAnswer()
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
    syncIndexFromRouteOrProgress()
  },
  { immediate: true }
)

watch(
  () => route.query.index,
  () => {
    syncIndexFromRouteOrProgress()
  }
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
        <button v-for="(q, index) in questions" :key="index" type="button"
          :class="['q-item', { active: index === currentIndex, favorite: favoritesStore.isFavorite(normalizedCategory, index) }]"
          @click="selectQuestion(index)">
          <span class="q-icon" aria-hidden="true">
            {{ index + 1 < 10 ? '0' + (index + 1) : index + 1 }}. <span
              v-if="favoritesStore.isFavorite(normalizedCategory, index)" class="q-fav-star">
              ★
          </span>
          </span>
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
          <div class="tag">
            <span> {{ topicTag }}</span>
            <span class="progress-chip">
              <span class="chip-label">进度</span>
              <span class="chip-main">
                {{ String(doneCount).padStart(2, '0') }}/{{ String(totalCount).padStart(2, '0') }}
              </span>
              <span class="chip-extra">
                · 已做 {{ doneCount }} · 未做 {{ remainingCount }} · 收藏 {{ favoriteCount }}
              </span>
            </span>
          </div>
          <div class="title-row">
            <h2 class="title">{{ titleText }}</h2>
            <button v-if="currentQuestion" type="button" class="fav-btn" :class="{ active: isCurrentFavorite }"
              @click="toggleFavoriteCurrent">
              <span aria-hidden="true">{{ isCurrentFavorite ? '★' : '☆' }}</span>
              <span class="sr-only">
                {{ isCurrentFavorite ? '取消收藏本题' : '收藏本题' }}
              </span>
            </button>
          </div>
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

            <button
              v-if="currentQuestion"
              type="button"
              class="btn btn-ghost"
              @click="askAiAboutCurrent"
            >
              就本题向AI提问
            </button>


            <p class="keyboard-hint">
              {{ showAnswer ? '按空格可收起解题思路，亦可使用 ← → 或 ↑ ↓ 切换题目' : '按空格可查看解题思路，亦可使用 ← → 或 ↑ ↓ 切换题目' }}
            </p>
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
  height: 100vh;
  /* 固定为视口高度，避免中间内容变高时整体被撑大 */
  overflow: hidden;
  /* 防止子元素撑出滚动条，交给内部区域自己滚动 */
}

.sidebar {
  width: 72px;
  background: var(--sidebar);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  min-height: 0;
  /* 允许在父级固定高度下收缩，避免整体一起滚动 */
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
  flex: 1 1 auto;
  /* 占据除顶部和底部按钮外的空间 */
  min-height: 0;
  /* 允许在 flex 容器中正确收缩 */
  overflow-y: auto;
  /* 题目过多时在列表内滚动，而不是把底部按钮挤下去 */
}

.sidebar-list::-webkit-scrollbar {
  display: none;
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

.q-fav-star {
  margin-left: 4px;
  color: var(--accent);
  font-size: 0.8rem;
}

.sidebar-home {
  margin-top: auto;
  /* 将按钮固定在侧边栏底部 */
  flex-shrink: 0;
  /* 不允许被压缩挤出可视区域 */
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.title {
  margin-bottom: 25px;
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 25px;
}

.fav-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--text-dim);
  font-size: 1.1rem;
  transition: color 0.2s, transform 0.2s;
}

.fav-btn:hover {
  color: var(--accent);
  transform: scale(1.1);
}

.fav-btn.active {
  color: var(--accent);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

.desc {
  color: var(--text-dim);
  margin-bottom: 30px;
}

.progress-chip {
  margin-left: auto;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: rgba(0, 0, 0, 0.18);
  font-size: 0.78rem;
  color: var(--text-dim);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.chip-label {
  padding: 2px 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: var(--accent);
  font-weight: 600;
}

.chip-main {
  font-variant-numeric: tabular-nums;
}

.chip-extra {
  opacity: 0.85;
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

.ans-area .ans-md :deep(h1) {
  font-size: 1.1rem;
}

.ans-area .ans-md :deep(h2) {
  font-size: 1rem;
}

.ans-area .ans-md :deep(h3),
.ans-area .ans-md :deep(h4) {
  font-size: 0.95rem;
}

.ans-area .ans-md :deep(p) {
  margin: 6px 0;
}

.ans-area .ans-md :deep(ul),
.ans-area .ans-md :deep(ol) {
  margin: 8px 0;
  padding-left: 1.2em;
}

.ans-area .ans-md :deep(li) {
  margin: 2px 0;
}

.ans-area .ans-md :deep(hr) {
  border: none;
  border-top: 1px solid var(--border);
  margin: 12px 0;
}

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

.ans-area .ans-md :deep(th) {
  background: rgba(0, 0, 0, 0.2);
  font-weight: 600;
}

.ans-area .ans-md :deep(code) {
  background: rgba(0, 0, 0, 0.25);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
}

.ans-area .ans-md :deep(pre) {
  background: rgba(0, 0, 0, 0.3);
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 10px 0;
}

.ans-area .ans-md :deep(pre code) {
  background: none;
  padding: 0;
}

.ans-area .ans-md :deep(strong) {
  font-weight: 600;
  color: var(--text);
}

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
