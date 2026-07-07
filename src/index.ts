#!/usr/bin/env node
import { spawn } from 'child_process';
import chalk from 'chalk';
import boxen from 'boxen';

const titleText = chalk.white.bold('MORTAL CLAUDINHO\n\n') +
    chalk.gray('The ultimate whip for runaway AI agents.');

console.log(boxen(titleText, {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'red',
    title: chalk.red.bold(' ⚡ v1.0.0 '),
    titleAlignment: 'center',
    textAlignment: 'center'
}));

console.log(chalk.yellow('🔄 Starting Claude Code agent under surveillance...\n'));

const claudeProcess = spawn('claude', [], {
    stdio: 'inherit',
    shell: true
});

claudeProcess.on('close', (code) => {
    console.log(`\n${chalk.blue('Mortal Claudinho:')} Claude process exited with code ${code}`);
    process.exit(code ?? 0);
})