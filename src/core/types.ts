export interface GameContext {
  ui: {
    printBanner: (text: string) => void;
    printMessage: (msg: string) => void;
    printWarning: (msg: string) => void;
    printError: (msg: string) => void;
    printSuccess: (msg: string) => void;
    clearInteractive: () => void;
  };
  state: {
    getXP: () => number;
    getUnlockedGames: () => string[];
  };
  updateXP: (points: number) => void;
  unlockGame: (gameId: string) => void;
  saveProgress: () => Promise<void>;
}

export interface GameModule {
  id: string;
  name: string;
  description: string;
  version: string;
  start: (context: GameContext) => Promise<void>;
}
