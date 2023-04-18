import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import react from '@vitejs/plugin-react'
import viteTsconfigPaths from 'vite-tsconfig-paths'
import svgrPlugin from 'vite-plugin-svgr'
import path from 'path'
import redirectAll from 'vite-plugin-rewrite-all'

const env = process.env.APP_ENV
const isExtensionEnv = env === 'ext'

export default defineConfig({
  plugins: [
    react(),
    viteTsconfigPaths(),
    svgrPlugin(),
    nodePolyfills(),
    redirectAll(),
  ],

  resolve: {
    alias: [{ find: '@', replacement: path.resolve(__dirname, 'src') }],
  },

  build: !isExtensionEnv
    ? undefined
    : {
        rollupOptions: {
          input: {
            index: './index.html',
            main: 'src/index.tsx',
            background: 'src/chrome/background.ts',
            content: 'src/chrome/content.ts',
          },
          output: {
            format: 'es',
            dir: 'dist',
            entryFileNames: 'assets/[name].js',
          },
        },
      },
})
