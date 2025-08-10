# unplugin-lingui

```bash
pnpm add unplugin-lingui
```

<details>
<summary>Vite</summary><br>

```ts
// vite.config.ts
import Lingui from 'unplugin-lingui/vite'

export default defineConfig({
  plugins: [Lingui()],
})
```

<br></details>

<details>
<summary>Rollup</summary><br>

```ts
// rollup.config.js
import Lingui from 'unplugin-lingui/rollup'

export default {
  plugins: [Lingui()],
}
```

<br></details>

<details>
<summary>Webpack</summary><br>

```ts
// webpack.config.js
module.exports = {
  /* ... */
  plugins: [require('unplugin-lingui/webpack')()],
}
```

<br></details>

<details>
<summary>Nuxt</summary><br>

```ts
// nuxt.config.js
export default defineNuxtConfig({
  modules: [
    [
      'unplugin-lingui/nuxt',
      {
        /* options */
      },
    ],
  ],
})
```

> This module works for both Nuxt 2 and [Nuxt Vite](https://github.com/nuxt/vite)

<br></details>

<details>
<summary>Vue CLI</summary><br>

```ts
// vue.config.js
module.exports = {
  configureWebpack: {
    plugins: [require('unplugin-lingui/webpack')()],
  },
}
```

<br></details>

<details>
<summary>esbuild</summary><br>

```ts
// esbuild.config.js
import { build } from 'esbuild'
import Lingui from 'unplugin-lingui/esbuild'

build({
  plugins: [Lingui()],
})
```

<br></details>
