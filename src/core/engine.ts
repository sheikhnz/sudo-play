import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { globalState } from './state.js';
import { Router } from './router.js';
import { GameModule } from './types.js';

export async function bootstrap(gamesDir: string) {
  await globalState.init();

  // Give new users access to "dummy" game
  if (globalState.getUnlockedGames().length === 0) {
    globalState.unlockGame('dummy');
    await globalState.save();
  }

  const loadedGames: GameModule[] = [];

  try {
    const entries = await fs.readdir(gamesDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        let gameIndexPath = path.join(gamesDir, entry.name, 'index.ts');
        let exists = false;
        
        try {
          await fs.access(gameIndexPath);
          exists = true;
        } catch {
          try {
            gameIndexPath = path.join(gamesDir, entry.name, 'index.js');
            await fs.access(gameIndexPath);
            exists = true;
          } catch {}
        }

        if (exists) {
          try {
            // Dynamically import the module. pathToFileURL is essential on Windows, but good practice everywhere
            const moduleUrl = pathToFileURL(gameIndexPath).href;
            const gameModule = await import(moduleUrl);
            
            if (gameModule.default && gameModule.default.id) {
              loadedGames.push(gameModule.default as GameModule);
            } else {
              console.warn(`Game in ${entry.name} does not export a valid GameModule as default.`);
            }
          } catch (err) {
            console.warn(`Could not load game ${entry.name}: ${err}`);
          }
        }
      }
    }
  } catch (err) {
    console.error(`Failed to read games directory at ${gamesDir}`, err);
  }

  const router = new Router(loadedGames);
  await router.start();
}
