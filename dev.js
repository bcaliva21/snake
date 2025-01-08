import * as esbuild from 'esbuild'

let ctx = await esbuild.context({
    entryPoints: ['public/src/index.ts'],
    outdir: 'public/dist',
    bundle: true,
})

let {
    host,
    port
} = await ctx.serve({
    servedir: 'public',
})

console.log(`serving dev environment on ${host}:${port}`)
