import { defineConfig } from 'tsup';

export default defineConfig({
    entry: {
        index: 'src/index.ts',
    },
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    minify: true,
    bundle: true,        
    skipNodeModulesBundle: true,
    target: 'es2022',
});