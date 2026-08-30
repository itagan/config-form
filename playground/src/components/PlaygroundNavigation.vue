<script setup lang="ts">
import { computed, ref } from 'vue'
import { exampleGroups, levelLabels } from '../exampleCatalog'

defineProps<{
  activePath: string
  docsSiteUrl: string
}>()

const emit = defineEmits<{
  (event: 'navigate'): void
  (event: 'close'): void
}>()

const searchQuery = ref('')
const normalizedQuery = computed(() => searchQuery.value.trim().toLocaleLowerCase())
const filteredGroups = computed(() => {
  if (!normalizedQuery.value) return exampleGroups

  return exampleGroups
    .map(group => ({
      ...group,
      examples: group.examples.filter(example => (
        [example.title, example.description, ...example.tags]
          .join(' ')
          .toLocaleLowerCase()
          .includes(normalizedQuery.value)
      ))
    }))
    .filter(group => group.examples.length > 0)
})

const handleNavigation = () => {
  searchQuery.value = ''
  emit('navigate')
}
</script>

<template>
  <div class="navigation-panel">
    <header class="navigation-header">
      <router-link class="brand-link" to="/" @click.native="handleNavigation">
        <span class="brand-mark">CF</span>
        <span>
          <strong>ConfigForm</strong>
          <small>Playground</small>
        </span>
      </router-link>
      <button class="close-navigation" type="button" aria-label="关闭示例菜单" @click="emit('close')">
        <i class="el-icon-close" aria-hidden="true" />
      </button>
    </header>

    <div class="navigation-search">
      <el-input
        v-model="searchQuery"
        size="small"
        clearable
        prefix-icon="el-icon-search"
        aria-label="搜索示例"
        placeholder="搜索标题、能力或 API"
      />
    </div>

    <nav class="example-navigation" aria-label="示例导航">
      <section v-for="group in filteredGroups" :key="group.id" class="navigation-group">
        <h2>{{ group.title }}</h2>
        <router-link
          v-for="example in group.examples"
          :key="example.path"
          :to="example.path"
          class="example-link"
          :class="{ 'is-active': activePath === example.path }"
          :aria-current="activePath === example.path ? 'page' : undefined"
          @click.native="handleNavigation"
        >
          <span>{{ example.title }}</span>
          <small>{{ levelLabels[example.level] }}</small>
        </router-link>
      </section>

      <p v-if="filteredGroups.length === 0" class="empty-search">
        没有匹配的示例，换个关键词试试。
      </p>
    </nav>

    <footer class="navigation-footer">
      <a class="docs-site-link" :href="docsSiteUrl">
        <i class="el-icon-document" aria-hidden="true" />
        文档总站
      </a>
      <router-link to="/" @click.native="handleNavigation">
        <i class="el-icon-menu" aria-hidden="true" />
        示例概览
      </router-link>
    </footer>
  </div>
</template>

<style scoped>
.navigation-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  color: #dbe5f3;
  background: #111827;
}

.navigation-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 72px;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 11px;
}

.brand-mark {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  color: #ffffff;
  background: #2563eb;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.brand-link strong,
.brand-link small {
  display: block;
}

.brand-link strong {
  color: #ffffff;
  font-size: 15px;
  line-height: 1.25;
}

.brand-link small {
  margin-top: 2px;
  color: #94a3b8;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.close-navigation {
  display: none;
  padding: 7px;
  color: #cbd5e1;
  background: transparent;
  border: 0;
  border-radius: 6px;
  cursor: pointer;
}

.close-navigation:hover {
  color: #ffffff;
  background: rgba(148, 163, 184, 0.14);
}

.navigation-search {
  padding: 14px 14px 10px;
}

.navigation-search :deep(.el-input__inner) {
  color: #e5edf8;
  background: rgba(15, 23, 42, 0.72);
  border-color: #334155;
}

.example-navigation {
  flex: 1;
  overflow-y: auto;
  padding: 4px 10px 18px;
}

.navigation-group h2 {
  margin: 18px 10px 8px;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.example-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 2px;
  padding: 9px 12px;
  color: #cbd5e1;
  border-radius: 8px;
  font-size: 13px;
  text-decoration: none;
  transition: background 0.15s ease, color 0.15s ease;
}

.example-link:hover {
  color: #ffffff;
  background: rgba(148, 163, 184, 0.12);
}

.example-link.is-active {
  color: #ffffff;
  background: #2563eb;
}

.example-link small {
  flex: none;
  color: #94a3b8;
  font-size: 11px;
}

.example-link.is-active small {
  color: rgba(255, 255, 255, 0.78);
}

.empty-search {
  margin: 18px 10px;
  color: #94a3b8;
  font-size: 12px;
}

.navigation-footer {
  display: flex;
  gap: 6px;
  padding: 12px 14px;
  border-top: 1px solid rgba(148, 163, 184, 0.18);
}

.navigation-footer a {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 6px;
  color: #cbd5e1;
  border-radius: 8px;
  font-size: 12px;
  text-decoration: none;
}

.navigation-footer a:hover {
  color: #ffffff;
  background: rgba(148, 163, 184, 0.12);
}

@media (max-width: 960px) {
  .close-navigation {
    display: block;
  }
}
</style>
