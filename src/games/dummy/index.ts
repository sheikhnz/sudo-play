import { GameModule, GameContext } from '../../core/types.js';
import { confirm } from '@inquirer/prompts';

const dummyGame: GameModule = {
  id: 'dummy',
  name: 'Dummy Game',
  description: 'A simple example game to demonstrate the plugin system.',
  version: '1.0.0',
  start: async (context: GameContext) => {
    context.ui.printBanner('Welcome to the Dummy Game!');
    context.ui.printMessage('This is a test to show how games interact with the core engine.');
    
    context.ui.printMessage(`Your current XP is: ${context.state.getXP()}`);
    
    const play = await confirm({ message: 'Do you want to play a round and earn 25 XP?' });
    
    if (play) {
      context.ui.clearInteractive();
      context.ui.printSuccess('You played the dummy game amazingly well!');
      context.updateXP(25);
      context.ui.printMessage(`You earned 25 XP! New total: ${context.state.getXP()}`);
    } else {
      context.ui.clearInteractive();
      context.ui.printMessage('Maybe next time!');
    }
    
    await confirm({ message: 'Press enter to return to the main menu' });
  }
};

export default dummyGame;
