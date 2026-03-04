import { loadState, saveState, AppStateData } from './storage.js';

export class AppState {
  private data: AppStateData = { xp: 0, unlockedGames: [] };

  async init() {
    this.data = await loadState();
  }

  getXP(): number {
    return this.data.xp;
  }

  getUnlockedGames(): string[] {
    return [...this.data.unlockedGames];
  }

  updateXP(points: number): void {
    this.data.xp += points;
  }

  unlockGame(gameId: string): void {
    if (!this.data.unlockedGames.includes(gameId)) {
      this.data.unlockedGames.push(gameId);
    }
  }

  async save(): Promise<void> {
    await saveState(this.data);
  }
}

// Export a singleton instance
export const globalState = new AppState();
