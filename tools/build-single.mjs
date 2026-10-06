// Bundles the Vite/React/TS project into ONE self-contained HTML file
// (used for the hosted preview; `npm run build` is the normal Vite path).
import { createRequire } from 'module';
import { execSync } from 'child_process';
import fs from 'fs';
const require = createRequire(import.meta.url);
const G = '/home/claude/.npm-global/lib/node_modules';
const esbuild = require(`${G}/tsx/node_modules/esbuild`);

await esbuild.build({
  entryPoints: ['src/main.tsx'], bundle: true, minify: true, format: 'iife', target: 'es2019',
  outfile: 'dist/app.js', jsx: 'automatic', nodePaths: [G], loader: { '.css': 'empty' },
  define: { 'process.env.NODE_ENV': '"production"' }, logLevel: 'warning',
});
const TW = `${G}/@mermaid-js/mermaid-cli/node_modules/tailwindcss/lib/cli.js`;
execSync(`node ${TW} -c tailwind.config.cjs -i src/index.css -o dist/app.css --minify`, { stdio: 'inherit' });
const css = fs.readFileSync('dist/app.css', 'utf8');
const js = fs.readFileSync('dist/app.js', 'utf8').replace(/<\/script/g, '<\\/script');
const html = `<!doctype html>
<html lang="en"><head><meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>CareerTown</title>
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="CareerTown" />
<meta name="theme-color" content="#7FD3F7" />
<link rel="manifest" href="manifest.webmanifest" />
<link rel="apple-touch-icon" href="apple-touch-icon.png" />
<link rel="icon" type="image/png" href="icon-192.png" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Grandstander:wght@600;800&family=Lexend:wght@400;600&display=swap" rel="stylesheet" />
<style>${css}</style></head>
<body><div id="root"></div><script>${js}</script></body></html>`;
fs.writeFileSync('dist/careertown.html', html);
console.log('built', (html.length / 1024).toFixed(0) + ' KB');
