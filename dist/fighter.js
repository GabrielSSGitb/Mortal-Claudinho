import * as p from '@clack/prompts';
export class fighter {
    initializeOptions() {
        console.log('\n');
        const choice = p.select({
            message: 'Which hero do you want to unleash today?',
            options: [
                { value: 'run-Scorp', label: '🔥 🦂 Scorpion' },
                { value: 'sound-test', label: '❄️ 🥶 Sub-Zero' },
                { value: 'exit', label: '❌ Exit' }
            ],
        });
    }
}
