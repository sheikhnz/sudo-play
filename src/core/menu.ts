/**
 * menu.ts — Interactive Main Menu
 *
 * Renders the top-level game-selection prompt using @inquirer/prompts.
 * Locked games are shown but disabled so players can see what's available
 * to unlock, without being able to accidentally select them.
 */

import { select } from '@inquirer/prompts';
import { GameModule } from './types.js';

/**
 * showMainMenu — renders the game list and waits for the player to choose.
 *
 * @param games         All loaded GameModules (locked or unlocked).
 * @param unlockedGames Array of game IDs the player currently has access to.
 * @returns             The selected game's `id`, or `null` if the player
 *                      chose "Exit".
 */
export async function showMainMenu(games: GameModule[], unlockedGames: string[]): Promise<string | null> {
  // Build a choice list from the available games. Locked games are still
  // listed but are rendered as disabled so players know they exist.
  const choices = games.map((g) => {
    const isUnlocked = unlockedGames.includes(g.id);
    return {
      name: isUnlocked ? g.name : `[LOCKED] ${g.name}`,  // prefix locked games visually
      value: g.id,
      disabled: !isUnlocked ? '(Requires unlock)' : false // inquirer hides disabled choices from selection
    };
  });

  // Always append a quit option at the bottom of the list.
  choices.push({ name: 'Exit', value: 'exit', disabled: false });

  // `select` blocks until the user makes a choice (arrow keys + Enter).
  const answer = await select({
    message: 'Select a game to play:',
    choices: choices
  });

  // Return null to signal "the player wants to exit" rather than a game id.
  return answer === 'exit' ? null : answer;
}
