import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    // This ensures your build goes to 'dist', which you'll load into Chrome
    outDir: 'dist',
    rollupOptions: {
      // Extensions often have multiple entry points
      input: {
        popup: resolve(__dirname, 'src/popup.html'),
        // background: resolve(__dirname, 'src/background.ts'), // Uncomment if needed
      },
      output: {
        // Keeps filenames simple so manifest.json doesn't break
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`
      }
    }
  },
  // This ensures the public folder (with your manifest) is copied
  publicDir: 'public' 
});