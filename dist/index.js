#!/usr/bin/env node
import chalk from 'chalk';
import boxen from 'boxen';
import { fighter } from './fighter.js';
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
const fighterInstance = new fighter();
fighterInstance.initializeOptions();
