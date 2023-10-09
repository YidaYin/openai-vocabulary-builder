import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { CRX_OUTDIR } from './globalConfig'

// https://vitejs.dev/config/
export default defineConfig({
  build:{
    outDir: CRX_OUTDIR,
    rollupOptions:{
      input: {
        popup: path.resolve(__dirname, 'src/popup/popup.html'),
        sidepanel: path.resolve(__dirname, 'src/sidepanel/sidepanel.html'),
      },
      output: {
        chunkFileNames: 'static/js/[name]-[hash].js',
        entryFileNames: 'static/js/[name]-[hash].js',
        assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
      }
    }
  },
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    }
  },
})
