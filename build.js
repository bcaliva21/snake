// build.js
import * as esbuild from 'esbuild'

await esbuild.build({
    entryPoints: ['public/src/index.ts', 'public/src/viewer.ts'],
    bundle: true,
    platform: 'node',
    target: ['node10.4'],
    outdir: 'public/dist'
})
