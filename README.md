# unplugin-lingui

```bash
pnpm add unplugin-lingui
```

## vite

> vite.config.ts

```ts
import react from '@vitejs/plugin-react-swc'
import Lingui from 'unplugin-lingui/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      plugins: [['@lingui/swc-plugin', {}]],
    }),
    Lingui(),
  ],
})
```
