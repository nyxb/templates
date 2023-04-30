import { defineConfig } from 'tsup'

export default defineConfig(options => ({
  entry: ['src/cli.ts'],
  format: ['esm'],
  clean: true,
  minify: true,
  ...options,
}))
