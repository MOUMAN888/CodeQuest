<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import BaseSelect from '@/components/BaseSelect.vue'
import { useFavoritesStore } from '@/stores/favorites'
import { getAllCategories, getQuestionsByCategory, type CategoryMeta, type Question } from '@/utils/questionLoader'

const favoritesStore = useFavoritesStore()
const router = useRouter()

const allCategoryMeta = computed<CategoryMeta[]>(() => getAllCategories())

const categoryMetaMap = computed<Record<string, CategoryMeta>>(() => {
  const map: Record<string, CategoryMeta> = {}
  for (const meta of allCategoryMeta.value) {
    map[meta.key] = meta
  }
  return map
})

const favoriteCategories = computed<string[]>(() => favoritesStore.getAllFavoriteCategories())

const activeCategory = ref<string>(favoriteCategories.value[0] ?? '')

watch(
  favoriteCategories,
  (list: string[]) => {
    if (!list.length) {
      activeCategory.value = ''
      return
    }
    if (!list.includes(activeCategory.value)) {
      const first = list[0]
      activeCategory.value = first ?? ''
    }
  },
  { immediate: true }
)

const selectedDifficulty = ref<'all' | 'easy' | 'medium' | 'hard'>('all')
const selectedTag = ref<'all' | string>('all')

const difficultyOptions = computed(() => [
  { label: '全部难度', value: 'all' },
  { label: 'easy', value: 'easy' },
  { label: 'medium', value: 'medium' },
  { label: 'hard', value: 'hard' },
])

const favoriteQuestions = computed<Question[]>(() => {
  const cat = activeCategory.value
  if (!cat) return []
  const all = getQuestionsByCategory(cat)
  const indexes = favoritesStore.getFavorites(cat)
  return indexes
    .map((i) => all[i])
    .filter((q): q is Question => Boolean(q))
})

const availableTags = computed<string[]>(() => {
  const set = new Set<string>()
  for (const q of favoriteQuestions.value) {
    q.tags?.forEach((t) => set.add(t))
  }
  return Array.from(set)
})

const tagOptions = computed(() => [
  { label: '全部标签', value: 'all' },
  ...availableTags.value.map((tag) => ({ label: tag, value: tag })),
])

const filteredQuestions = computed<Question[]>(() => {
  return favoriteQuestions.value.filter((q) => {
    if (selectedDifficulty.value !== 'all' && q.difficulty !== selectedDifficulty.value) {
      return false
    }
    if (selectedTag.value !== 'all' && !(q.tags || []).includes(selectedTag.value)) {
      return false
    }
    return true
  })
})

function getCategoryLabel(key: string): string {
  const meta = categoryMetaMap.value[key]
  return meta ? meta.label : key.toUpperCase()
}

function startRandomPractice() {
  if (!filteredQuestions.value.length || !activeCategory.value) return
  const list = filteredQuestions.value
  const randomIdx = Math.floor(Math.random() * list.length)
  const target = list[randomIdx]
  const all = getQuestionsByCategory(activeCategory.value)
  const realIndex = all.findIndex((q) => q.id === target?.id)
  if (realIndex === -1) return

  router.push({
    name: 'quiz',
    params: { category: activeCategory.value },
    query: { index: String(realIndex) },
  })
}

function goBack() {
  // 优先返回上一页，若不可用则回到首页
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push({ name: 'home' })
  }
}
</script>

<template>
  <div class="favorites-view">
    <header class="fav-header">
      <div class="fav-header-main">
        <div class="fav-header-row">
          <button type="button" class="fav-back-btn" @click="goBack">
            ← 返回
          </button>
          <h1>收藏夹</h1>
        </div>
        <p>集中复习你标记过的重点题目，可按难度/标签筛选，并支持随机练习。</p>
      </div>
    </header>

    <section v-if="favoriteCategories.length" class="fav-main">
      <aside class="fav-cats">
        <button
          v-for="cat in favoriteCategories"
          :key="cat"
          type="button"
          :class="['fav-cat-btn', { active: cat === activeCategory }]"
          @click="activeCategory = cat"
        >
          <span class="fav-cat-label">{{ getCategoryLabel(cat) }}</span>
          <span class="fav-cat-count">{{ favoritesStore.getFavorites(cat).length }} 题</span>
        </button>
      </aside>

      <main class="fav-content">
        <div class="fav-toolbar">
          <div class="fav-filters">
            <BaseSelect
              v-model="selectedDifficulty"
              :options="difficultyOptions"
            />

            <BaseSelect
              v-model="selectedTag"
              :options="tagOptions"
            />
          </div>

          <button
            type="button"
            class="fav-random-btn"
            :disabled="!filteredQuestions.length"
            @click="startRandomPractice"
          >
            随机练习一题
          </button>
        </div>

        <div v-if="filteredQuestions.length" class="fav-list">
          <article
            v-for="(q, idx) in filteredQuestions"
            :key="q.id"
            class="fav-item"
          >
            <header class="fav-item-header">
              <span class="fav-item-index">
                {{ String(idx + 1).padStart(2, '0') }}
              </span>
              <h2 class="fav-item-title">{{ q.title }}</h2>
              <span class="fav-item-badge">{{ q.difficulty }}</span>
            </header>
            <p class="fav-item-desc">
              {{ q.question }}
            </p>
            <footer v-if="q.tags?.length" class="fav-item-tags">
              <span
                v-for="tag in q.tags"
                :key="tag"
                class="fav-tag"
              >
                #{{ tag }}
              </span>
            </footer>
          </article>
        </div>

        <p v-else class="fav-empty-state">
          当前筛选条件下暂无收藏题目，可以尝试切换分类或调整筛选条件。
        </p>
      </main>
    </section>

    <p v-else class="fav-empty">
      还没有收藏任何题目，可以在刷题页面点击题目右上角的星标，将题目加入收藏夹。
    </p>
  </div>
</template>

<style scoped>
.favorites-view {
  min-height: 100vh;
  padding: 20px 40px 40px;
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 24px;
}

.fav-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.fav-header-main h1 {
  font-size: 2rem;
  margin-bottom: 8px;
}

.fav-header-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.fav-header-main p {
  color: var(--text-dim);
  font-size: 0.95rem;
}

.fav-back-btn {
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-dim);
  font-size: 0.85rem;
  cursor: pointer;
}

.fav-back-btn:hover {
  color: var(--accent);
  border-color: var(--accent);
}

.fav-main {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 24px;
}

.fav-cats {
  padding: 18px 16px;
  border-radius: 18px;
  border: 1px solid var(--border);
  background: var(--card);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fav-cat-btn {
  width: 100%;
  border: none;
  background: transparent;
  padding: 10px 12px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  color: var(--text-dim);
  font-size: 0.9rem;
}

.fav-cat-btn.active {
  background: var(--q-item-active-bg);
  color: var(--accent);
}

.fav-cat-label {
  font-weight: 600;
}

.fav-cat-count {
  font-size: 0.8rem;
}

.fav-content {
  padding: 18px 20px;
  border-radius: 20px;
  border: 1px solid var(--border);
  background: var(--card);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.fav-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.fav-filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.fav-select {
  min-width: 120px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: rgba(0, 0, 0, 0.3);
  color: var(--text);
  font-size: 0.85rem;
}

.fav-random-btn {
  padding: 8px 16px;
  border-radius: 999px;
  border: none;
  background: var(--accent);
  color: #fff;
  font-size: 0.85rem;
  cursor: pointer;
}

.fav-random-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.fav-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: calc(100vh - 260px);
  overflow-y: auto;
  padding-right: 4px;
  scrollbar-width: thin; /* Firefox */
  scrollbar-color: var(--border) transparent;
}

.fav-list::-webkit-scrollbar {
  width: 6px;
}

.fav-list::-webkit-scrollbar-track {
  background: transparent;
}

.fav-list::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 999px;
}

.fav-item {
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: rgba(0, 0, 0, 0.35);
}

.fav-item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.fav-item-index {
  font-variant-numeric: tabular-nums;
  font-size: 0.8rem;
  padding: 2px 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-dim);
}

.fav-item-title {
  font-size: 1rem;
  margin: 0;
  flex: 1;
}

.fav-item-badge {
  font-size: 0.75rem;
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  text-transform: uppercase;
}

.fav-item-desc {
  font-size: 0.9rem;
  color: var(--text-dim);
}

.fav-item-tags {
  margin-top: 6px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.fav-tag {
  font-size: 0.78rem;
  padding: 2px 6px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.4);
}

.fav-empty {
  margin-top: 40px;
  text-align: center;
  color: var(--text-dim);
}

.fav-empty-state {
  margin-top: 12px;
  font-size: 0.9rem;
  color: var(--text-dim);
}

@media (max-width: 900px) {
  .favorites-view {
    padding: 70px 20px 24px;
  }

  .fav-main {
    grid-template-columns: 1fr;
  }
}
</style>

