<script setup lang="ts">
import { exampleGroups, levelLabels } from '../exampleCatalog'

const docsSiteUrl = import.meta.env.VITE_DOCS_SITE_URL
  || import.meta.env.VITE_SITE_BASE
  || 'http://localhost:5174/'
const architectureUrl = `${docsSiteUrl.replace(/\/+$/, '')}/architecture/overview`
</script>

<template>
  <main class="playground-home">
    <section class="home-hero">
      <div>
        <p class="eyebrow">ConfigForm Playground</p>
        <h1>ConfigForm 示例中心</h1>
        <p class="hero-copy">
          按开发任务选择可运行示例：items 负责字段描述，model 由调用方维护，Element UI 负责组件行为。
        </p>
      </div>
      <div class="hero-actions">
        <router-link to="/basic-form">
          <el-button type="primary">打开基础示例</el-button>
        </router-link>
        <a :href="architectureUrl">
          <el-button>理解组件架构</el-button>
        </a>
      </div>
    </section>

    <section
      v-for="group in exampleGroups"
      :key="group.id"
      class="example-group"
    >
      <header class="group-heading">
        <h2>{{ group.title }}</h2>
        <p>{{ group.description }}</p>
      </header>
      <div class="example-grid">
        <router-link
          v-for="example in group.examples"
          :key="example.path"
          :to="example.path"
          class="example-card"
        >
          <div class="card-header">
            <h3>{{ example.title }}</h3>
            <el-tag :type="example.type" size="mini">{{ levelLabels[example.level] }}</el-tag>
          </div>
          <p>{{ example.description }}</p>
          <div class="tag-list">
            <span v-for="tag in example.tags" :key="tag">{{ tag }}</span>
          </div>
        </router-link>
      </div>
    </section>
  </main>
</template>

<style scoped>
.playground-home {
  max-width: 1120px;
  margin: 0 auto;
  padding: 8px 0 32px;
}

.home-hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 32px;
  margin: 0 0 24px;
  padding: 24px 0;
  border-bottom: 1px solid #d8dee9;
}

.eyebrow {
  margin: 0 0 8px;
  color: #2563eb;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  color: #111827;
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
}

.hero-copy {
  max-width: 680px;
  margin: 14px 0 0;
  color: #4b5563;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.example-group {
  margin: 30px auto 0;
}

.group-heading {
  margin-bottom: 14px;
}

.group-heading h2 {
  margin: 0;
  color: #111827;
  font-size: 22px;
}

.group-heading p {
  margin: 6px 0 0;
  color: #6b7280;
}

.example-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 14px;
}

.example-card {
  display: block;
  padding: 18px;
  color: inherit;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  text-decoration: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
}

.example-card:hover {
  border-color: #93c5fd;
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.1);
  transform: translateY(-1px);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.card-header h3 {
  margin: 0;
  color: #111827;
  font-size: 15px;
}

.example-card p {
  margin: 10px 0 0;
  color: #4b5563;
  font-size: 13px;
  line-height: 1.6;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 14px;
}

.tag-list span {
  padding: 3px 8px;
  color: #475569;
  background: #f1f5f9;
  border-radius: 999px;
  font-size: 11px;
}
</style>
