<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{ route?: string }>(), { route: '/' })
const playgroundUrl = (import.meta.env.VITE_PLAYGROUND_URL || 'http://localhost:5173').replace(/\/$/, '')
const href = computed(() => `${playgroundUrl}/#${props.route}`)
</script>

<template>
  <a :href="href" target="_blank" rel="noreferrer"><slot>在 Playground 中运行</slot></a>
</template>
