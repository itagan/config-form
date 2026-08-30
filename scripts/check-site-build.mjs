import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const repositoryRoot = process.cwd()
const siteDist = path.join(repositoryRoot, 'docs/.vitepress/dist')
const playgroundDist = path.join(siteDist, 'playground')
const rawSiteBase = process.env.VITE_SITE_BASE || '/'
const sitePath = rawSiteBase.replace(/^\/+|\/+$/g, '')
const siteBase = sitePath ? `/${sitePath}/` : '/'
const playgroundBase = `${siteBase}playground/`
const duplicatedSiteBase = siteBase === '/'
  ? null
  : `${siteBase}${siteBase.replace(/^\/+/, '')}`
const errors = []

function requireFile(file, description) {
  if (!fs.existsSync(file)) errors.push(`${description}不存在：${path.relative(repositoryRoot, file)}`)
}

function collectTextFiles(directory) {
  const files = []
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...collectTextFiles(target))
    else if (/\.(?:html|js|css|json)$/.test(entry.name)) files.push(target)
  }
  return files
}

requireFile(path.join(siteDist, 'index.html'), '文档首页')
requireFile(path.join(playgroundDist, 'index.html'), 'Playground 首页')

if (fs.existsSync(siteDist)) {
  for (const file of collectTextFiles(siteDist)) {
    const source = fs.readFileSync(file, 'utf8')
    if (source.includes('localhost:5173')) {
      errors.push(`生产站点仍包含 localhost:5173：${path.relative(repositoryRoot, file)}`)
    }
    if (duplicatedSiteBase && path.extname(file) === '.html' && source.includes(duplicatedSiteBase)) {
      errors.push(`生产站点包含重复基址 ${duplicatedSiteBase}：${path.relative(repositoryRoot, file)}`)
    }
    if (path.extname(file) === '.html') {
      const playgroundLinks = (source.match(/<a\b[^>]*>/g) || [])
        .filter(tag => /href="[^"]*\/playground(?:\/|")/.test(tag))
      if (playgroundLinks.some(tag => (
        !tag.includes(`href="${playgroundBase}`)
        || !tag.includes('target="_self"')
      ))) {
        errors.push(
          `文档中的 Playground 链接基址错误或可能被 VitePress 路由拦截：${path.relative(repositoryRoot, file)}`
        )
      }
    }
  }
}

if (fs.existsSync(path.join(siteDist, 'index.html'))) {
  const docsEntry = fs.readFileSync(path.join(siteDist, 'index.html'), 'utf8')
  if (!docsEntry.includes(`href="${playgroundBase}"`)) {
    errors.push(`文档首页缺少 ${playgroundBase} 入口。`)
  }
  if (siteBase !== '/' && !docsEntry.includes(`${siteBase}assets/`)) {
    errors.push(`文档资源没有使用 ${siteBase} 基址。`)
  }
}

if (fs.existsSync(path.join(playgroundDist, 'index.html'))) {
  const playgroundEntry = fs.readFileSync(path.join(playgroundDist, 'index.html'), 'utf8')
  if (!playgroundEntry.includes(`${playgroundBase}assets/`)) {
    errors.push(`Playground 资源没有使用 ${playgroundBase} 基址。`)
  }
}

const playgroundAssets = path.join(playgroundDist, 'assets')
if (fs.existsSync(playgroundAssets)) {
  // esbuild 会把非 ASCII 文本转义成 \uXXXX，这里用稳定的 docs-link 类名定位入口脚本。
  const docsLinkBundle = fs.readdirSync(playgroundAssets).find(file => {
    if (!/\.js$/.test(file)) return false
    return fs.readFileSync(path.join(playgroundAssets, file), 'utf8').includes('docs-link')
  })
  if (!docsLinkBundle) {
    errors.push('Playground 缺少返回文档入口的现代浏览器脚本。')
  } else {
    const docsLinkSource = fs.readFileSync(path.join(playgroundAssets, docsLinkBundle), 'utf8')
    if (!docsLinkSource.includes(JSON.stringify(siteBase))) {
      errors.push(`Playground 返回文档的地址没有使用 ${siteBase} 基址。`)
    }
  }
}

if (errors.length > 0) {
  console.error(`同站构建检查失败（${errors.length} 项）：`)
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log(`同站构建检查通过：文档首页与 Playground 入口均使用 ${playgroundBase} 基址。`)
