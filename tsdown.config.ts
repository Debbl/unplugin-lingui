import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/vite.ts',
    'src/esbuild.ts',
    'src/form.ts',
    'src/rolldown.ts',
    'src/rollup.ts',
    'src/rspack.ts',
    'src/webpack.ts',
  ],
  sourcemap: true,
  dts: { sourcemap: true },
  exports: true,
})
