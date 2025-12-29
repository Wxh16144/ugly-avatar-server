import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['./src/app.ts'],
  format: 'cjs',
  clean: true,
  outDir: 'dist',
  platform: 'node',
  bundle: true,
  external: ['sharp'],
  define: {
    'process.env.NODE_ENV': '"production"',
  },
});
