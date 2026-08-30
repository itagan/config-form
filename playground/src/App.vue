<script setup lang="ts">
// 同站部署时复用统一站点基址，本地开发默认跳转 VitePress 文档端口。
const docsSiteUrl = import.meta.env.VITE_DOCS_SITE_URL
  || import.meta.env.VITE_SITE_BASE
  || 'http://localhost:5174/'
</script>

<template>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="brand">ConfigForm</div>
      <div class="subtitle">Vue 2.7 + Element UI</div>
      <a class="docs-link" :href="docsSiteUrl">← 返回文档</a>
      <router-link to="/">基础与联动</router-link>
      <router-link to="/options">选项与映射</router-link>
      <router-link to="/dynamic">动态字段与增删</router-link>
      <router-link to="/schema">JSON Schema 驱动</router-link>
      <router-link to="/adorn">字段左右插槽（评估）</router-link>
      <router-link to="/extensions">扩展与复合字段</router-link>
      <router-link to="/readonly">详情与只读</router-link>
      <router-link to="/interaction">校验聚焦与键盘导航</router-link>
      <router-link to="/hints">提示与 Tooltip 单例</router-link>
    </aside>
    <main class="content"><router-view /></main>
  </div>
</template>

<style>
* { box-sizing: border-box; }
body { margin: 0; color: #303133; background: #f5f7fa; font-family: Inter, "PingFang SC", sans-serif; }
.app-shell { display: flex; min-height: 100vh; }
.sidebar { position: fixed; width: 240px; height: 100vh; padding: 28px 20px; background: #fff; border-right: 1px solid #ebeef5; }
.brand { font-size: 24px; font-weight: 700; color: #409eff; }
.subtitle { margin: 4px 0 28px; color: #909399; font-size: 13px; }
.docs-link { margin-bottom: 16px; padding: 10px 12px; border: 1px solid #ebeef5; border-radius: 6px; color: #047857 !important; font-size: 13px; background: #f0fdf4; }
.sidebar a { display: block; margin: 5px 0; padding: 10px 12px; border-radius: 6px; color: #606266; text-decoration: none; }
.sidebar a.router-link-exact-active { color: #409eff; background: #ecf5ff; }
.content { width: calc(100% - 240px); margin-left: 240px; padding: 36px; }
.demo-page { max-width: 960px; margin: 0 auto; }
.demo-page h1 { margin-top: 0; }
.demo-card { padding: 24px; background: #fff; border: 1px solid #ebeef5; border-radius: 8px; }
.demo-actions { padding-left: 96px; }
.model-preview { margin-top: 20px; padding: 16px; overflow: auto; color: #606266; background: #f5f7fa; border-radius: 6px; }
@media (max-width: 760px) { .sidebar { position: static; width: 100%; height: auto; } .app-shell { display: block; } .content { width: 100%; margin: 0; padding: 20px; } }
</style>
