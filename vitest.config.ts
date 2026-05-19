import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/helpers/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['miniprogram/services/**', 'miniprogram/utils/**', 'cloudfunctions/**/*.ts']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'miniprogram'),
      'wx-server-sdk': path.resolve(__dirname, 'node_modules/wx-server-sdk')
    }
  }
})
