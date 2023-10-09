import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { CRX_BACKGROUND_OUTDIR } from './globalConfig'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: CRX_BACKGROUND_OUTDIR,
    lib: {
      entry: [path.resolve(__dirname, 'src/background/service-worker.js')],
      formats: ['cjs'],
      fileName:  () => {
        // change the file extension from .cjs to .js
        return 'service-worker.js'
      },
    },
  },
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    }
  },
  define: {
    'process.env.NODE_ENV': null,
  }
})
