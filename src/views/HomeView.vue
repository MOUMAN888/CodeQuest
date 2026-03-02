<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import CodeRainCanvas from '@/components/CodeRainCanvas.vue'
import { getAllCategories, type CategoryMeta } from '@/utils/questionLoader'

const router = useRouter()

const categories = computed<CategoryMeta[]>(() => getAllCategories())

function start(category: string) {
  router.push({ name: 'quiz', params: { category } })
}
</script>

<template>
  <CodeRainCanvas />

  <!-- 首页 -->
  <div class="home-view">
    <div class="hero-section">
      <h1 class="hero-text">CodeQuest</h1>
      <p>解构代码逻辑，重塑思维边界</p>
    </div>
    <div class="cat-grid">
      <div
        v-for="cat in categories"
        :key="cat.key"
        class="cat-card"
        role="button"
        tabindex="0"
        @click="start(cat.key)"
        @keydown.enter="start(cat.key)"
      >
        <i :class="cat.iconClass" aria-hidden="true" />
        <h3>{{ cat.label }}</h3>
        <p class="card-desc">{{ cat.description }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.hero-section {
  text-align: center;
  margin-bottom: 50px;
  z-index: 1;
}

.hero-section .hero-text {
  font-size: 3.5rem;
  letter-spacing: -2px;
  margin-bottom: 10px;
}

.hero-section p {
  color: var(--text-dim);
  font-size: 1.1rem;
}

.cat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
  width: 100%;
  max-width: 1000px;
  z-index: 1;
}

.cat-card {
  background: var(--card);
  backdrop-filter: blur(15px);
  padding: 40px;
  border-radius: 24px;
  border: 1px solid var(--border);
  cursor: pointer;
  text-align: center;
  position: relative;
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
}

.cat-card:hover {
  border-color: var(--accent);
  box-shadow: 0 0 30px var(--accent);
  transform: translateY(-5px);
}

.card-icon {
  font-size: 2.5rem;
  margin-bottom: 20px;
  display: block;
}

.card-icon--js {
  color: #f7df1e;
}

.card-icon--html {
  color: #e34f26;
}

.card-icon--css {
  color: #1572b6;
}

.card-icon--vue {
  color: #42b883;
}

.card-icon--react {
  color: #61dafb;
}

.card-desc {
  font-size: 0.9rem;
  color: var(--text-dim);
  margin-top: 10px;
}
</style>
