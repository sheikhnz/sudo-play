import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const STATE_FILE_PATH = path.join(os.homedir(), '.sudo-play-state.json');

export interface AppStateData {
  xp: number;
  unlockedGames: string[];
}

const DEFAULT_STATE: AppStateData = {
  xp: 0,
  unlockedGames: [],
};

export async function loadState(): Promise<AppStateData> {
  try {
    const data = await fs.readFile(STATE_FILE_PATH, 'utf-8');
    return { ...DEFAULT_STATE, ...JSON.parse(data) };
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return { ...DEFAULT_STATE };
    }
    console.error(`Error loading state from ${STATE_FILE_PATH}:`, error);
    return { ...DEFAULT_STATE };
  }
}

export async function saveState(state: AppStateData): Promise<void> {
  try {
    await fs.writeFile(STATE_FILE_PATH, JSON.stringify(state, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error saving state to ${STATE_FILE_PATH}:`, error);
  }
}
