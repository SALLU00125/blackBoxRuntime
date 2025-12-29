import { BUILD_CONFIG } from './src/LICENSE_O_S/config.variables';

// vite.lock.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import path from 'path';

const projectRoot = path.resolve(__dirname);
const srcRoot = path.resolve(projectRoot, 'src');
const componentsRoot = path.resolve(srcRoot, BUILD_CONFIG.COMPONENTS_FOLDER);
const entryFile = path.resolve(srcRoot,  BUILD_CONFIG.BARREL_FILE_PATH);

const LK_Comp = BUILD_CONFIG.LK_COMP;
const LK_CompFileName = BUILD_CONFIG.LK_COMP_FILENAME;

const normalize = (p: string) => path.normalize(p).split(path.sep).join('/');

export default defineConfig({
    resolve: {
        alias: {
            '@': srcRoot,
        },
    },
    plugins: [
        react(),
        dts({
            insertTypesEntry: true,
            rollupTypes: true,
            outDir: `src/${LK_Comp}`,

            // Critical fixes for the absolute path error
            tsconfigPath: path.resolve(projectRoot, 'tsconfig.app.json'),
            entryRoot: srcRoot,

            // Exclude config files that cause issues
            exclude: [
                'vite.config.ts',
                'vite.lock.config.ts',
                '**/*.test.tsx',
                '**/*.spec.tsx',
                'node_modules/**'
            ],

            // Only include necessary paths
            include: [
                'src/Components/**/*',
                'src/BarrelFile/**/*',
                'src/LICENSE_O_S/**/*'
            ],

            // Additional compiler options
            compilerOptions: {
                declarationMap: false,
                composite: false,
            },

            // This prevents the "not an absolute path" error
            staticImport: true,
            skipDiagnostics: false,
            logDiagnostics: true,
        }),
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
                if (isEntry) return false;
                if (path.resolve(source) === path.resolve(entryFile)) return false;

                if (!source.startsWith('.') && !source.startsWith('/') && !source.startsWith('@')) {
                    return true;
                }

                let absolutePath = source;
                if (importer && source.startsWith('.')) {
                    absolutePath = path.resolve(path.dirname(importer), source);
                } else if (source.startsWith('@/')) {
                    absolutePath = path.resolve(srcRoot, source.slice(2));
                }

                const cleanPath = normalize(absolutePath);
                const cleanComponentsRoot = normalize(componentsRoot);

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