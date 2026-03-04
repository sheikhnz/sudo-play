import { select } from '@inquirer/prompts';
import { GameModule } from './types.js';

export async function showMainMenu(games: GameModule[], unlockedGames: string[]): Promise<string | null> {
  const choices = games.map((g) => {
    const isUnlocked = unlockedGames.includes(g.id);
    return {
      name: isUnlocked ? g.name : `[LOCKED] ${g.name}`,
      value: g.id,
      disabled: !isUnlocked ? '(Requires unlock)' : false
    };
  });

  choices.push({ name: 'Exit', value: 'exit', disabled: false });

  const answer = await select({
    message: 'Select a game to play:',
    choices: choices
  });

  return answer === 'exit' ? null : answer;
}
