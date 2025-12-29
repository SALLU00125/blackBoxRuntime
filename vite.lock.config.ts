import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import path from 'path';

const projectRoot = path.resolve(__dirname);
const srcRoot = path.resolve(projectRoot, 'src');
const componentsRoot = path.resolve(srcRoot, 'Components');
const entryFile = path.resolve(srcRoot, 'BarrelFile/ComponentsToBeLocked.tsx');

console.log(
`projectRoot   : ${projectRoot}
srcRoot       : ${srcRoot}
componentsRoot: ${componentsRoot}
entryFile     : ${entryFile}`
);
//Outputs Vars
const LK_Comp = 'Core';
const LK_CompFileName = 'core-ui-runtime';

// Improved Normalization
const normalize = (p: string) => path.normalize(p).split(path.sep).join('/');

export default defineConfig({
    resolve: {
        alias: {
            '@': srcRoot,
        },
    },
    plugins: [
        react(),
        // dts({
        //     insertTypesEntry: true,
        //     rollupTypes: true,
        //     outDir: `src/${LK_Comp}`,
        //
        // }),
    ],
    build: {
        minify: false,
        lib: {
            entry: entryFile,
            name: LK_Comp,
            fileName: format => `${LK_CompFileName}.${format}.js`,
            formats: ['es'],
        },
        outDir: `src/${LK_Comp}`,
        emptyOutDir: true,

        rollupOptions: {
            external: (source, importer, isEntry) => {
                // FIX 1: Explicitly allow the entry point
                if (isEntry) return false;

                // FIX 2: If the source matches the entry file path exactly
                if (path.resolve(source) === path.resolve(entryFile)) return false;

                // Standard Node Modules
                if (!source.startsWith('.') && !source.startsWith('/') && !source.startsWith('@')) {
                    return true;
                }

                // Resolve the actual path of the import
                let absolutePath = source;
                if (importer && source.startsWith('.')) {
                    absolutePath = path.resolve(path.dirname(importer), source);
                } else if (source.startsWith('@/')) {
                    absolutePath = path.resolve(srcRoot, source.slice(2));
                }

                const cleanPath = normalize(absolutePath);
                const cleanComponentsRoot = normalize(componentsRoot);

                // Bundle if it's in src/Components, otherwise externalize
                if (cleanPath.startsWith(cleanComponentsRoot)) {
                    return false;
                }

                return true;
            },

            output: {
                paths: (id) => {
                    if (path.isAbsolute(id) && id.startsWith(srcRoot)) {
                        const relPath = path.relative(path.resolve(srcRoot, LK_Comp), id);
                        return relPath.split(path.sep).join('/');
                    }
                    return id;
                },
            },
        },
    },
});