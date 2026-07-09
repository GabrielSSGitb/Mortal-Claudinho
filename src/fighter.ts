import * as p from '@clack/prompts';
import chalk from 'chalk';
import { spawn } from 'child_process';
export class fighter {
    public async initializeOptions() {
        console.log('\n');

        const choice = await p.select({
            message: 'Which hero do you want to unleash today?',
            options: [
                { value: 'run-Scorp', label: '🔥 🦂 Scorpion' },
                { value: 'run-subzero', label: '❄️ 🥶 Sub-Zero' },
                { value: 'exit', label: '❌ Exit' }
            ],
        });

        // 4. Act on the chosen option
  switch (choice) {
    case 'run-Scorp':
      p.outro(chalk.green('Starting Claude Code now... prepare for the ultimate fight!'));
      //startClaudeAgent();
      break;

    case 'run-subzero':
      p.outro(chalk.green('Starting Claude Code now... prepare for the ultimate fight!'));
      //startClaudeAgent();
      break;
    default:
        p.cancel('Operation cancelled. Exiting Mortal Claudinho.');
        process.exit(0);
  }
    }
}