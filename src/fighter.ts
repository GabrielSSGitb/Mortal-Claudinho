import * as p from '@clack/prompts';
import chalk from 'chalk';
import { spawn } from 'child_process';
export class fighter {
    public initializeOptions() {
        console.log('\n');

        const choice = p.select({
            message: 'Which hero do you want to unleash today?',
            options: [
                { value: 'run-Scorp', label: '🔥 🦂 Scorpion' },
                { value: 'run-subzero', label: '❄️ 🥶 Sub-Zero' },
                { value: 'exit', label: '❌ Exit' }
            ],
        });
    }
}