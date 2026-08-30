<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{ route?: string }>(), { route: '/' })

// 地址由 docs/.vitepress/config.mts 在构建期注入：同站构建指向站内 /playground，
// 独立部署时指向 VITE_PLAYGROUND_URL（默认本地开发端口）并新开标签页。
declare const __PLAYGROUND_SITE_URL__: string
const playgroundUrl = __PLAYGROUND_SITE_URL__.replace(/\/$/, '')
const href = computed(() => `${playgroundUrl}/#${props.route}`)
const embedded = __PLAYGROUND_SITE_URL__.startsWith('/')
const target = embedded ? '_self' : '_blank'
const rel = embedded ? undefined : 'noreferrer'
</script>

<template>
  <a :href="href" :target="target" :rel="rel"><slot>在 Playground 中运行</slot></a>
</template>
