#!/usr/bin/env node
import path from 'node:path';
import url from 'node:url';
import { bootstrap } from '../src/core/engine.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDist = __dirname.includes('dist');
const packageRoot = path.resolve(__dirname, '..');
const resolvedGamesDir = path.join(packageRoot, 'src', 'games');

bootstrap(resolvedGamesDir).catch((err) => {
  console.error("Fatal error loading sudo-play:", err);
  process.exit(1);
});
