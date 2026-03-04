import { GameModule, GameContext } from './types.js';
import { showMainMenu } from './menu.js';
import { globalState } from './state.js';
import { clearInteractive, printBanner, printMessage, printError, printSuccess, printWarning } from './ui.js';

export class Router {
  private games: Map<string, GameModule> = new Map();

  constructor(gamesList: GameModule[]) {
    for (const game of gamesList) {
      this.games.set(game.id, game);
    }
  }

  async start() {
    while (true) {
      clearInteractive();
      printBanner(`sudo-play | XP: ${globalState.getXP()}`);
      
      const unlocked = globalState.getUnlockedGames();
      const availableGames = Array.from(this.games.values());

      if (availableGames.length === 0) {
        printWarning('No games found in the /games directory.');
        break;
      }

      const selectedId = await showMainMenu(availableGames, unlocked);

      if (!selectedId) {
        printMessage('Thanks for playing! Goodbye.');
        break;
      }

      const game = this.games.get(selectedId);
      if (game) {
        clearInteractive();
        printBanner(`Starting ${game.name}...`);
        
        const context: GameContext = {
          ui: {
            printBanner,
            printMessage,
            printWarning,
            printError,
            printSuccess,
            clearInteractive
          },
          state: {
            getXP: () => globalState.getXP(),
            getUnlockedGames: () => globalState.getUnlockedGames()
          },
          updateXP: (points) => {
             globalState.updateXP(points);
          },
          unlockGame: (id) => globalState.unlockGame(id),
          saveProgress: async () => await globalState.save()
        };

        try {
          await game.start(context);
        } catch (err: any) {
          printError(`Game crashed: ${err.message}`);
        }
        
        // Auto-save after game ends
        printMessage('Saving progress...');
        await globalState.save();
      }
    }
  }
}
