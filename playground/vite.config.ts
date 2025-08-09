import react from '@vitejs/plugin-react-swc'
import Lingui from 'unplugin-lingui/vite'
import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      plugins: [['@lingui/swc-plugin', {}]],
    }),
    Inspect(),
    Lingui(),
  ],
})
