#!/usr/bin/env node
import chalk from 'chalk';
import boxen from 'boxen';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import * as readline from 'node:readline';

const ENABLE_MOUSE = '\x1b[?1000h\x1b[?1006h';
const DISABLE_MOUSE = '\x1b[?1000l\x1b[?1006l';

export interface RightClickEvent {
    action: 'press' | 'release';
    x: number;
    y: number;
}

let claudeSession: ChildProcessWithoutNullStreams | null = null;

// Initialize a single persistent Claude session
function startClaudeSession(): ChildProcessWithoutNullStreams {
    const claude = spawn('claude', ['--dangerously-skip-permissions'], {
        shell: process.platform === 'win32',
        env: { ...process.env }
    });

    claude.stdout.on('data', (data) => {
        // Pipe real-time streaming updates from Claude to terminal output
        process.stdout.write(chalk.green(data.toString()));
    });

    claude.stderr.on('data', (data) => {
        process.stderr.write(chalk.red(data.toString()));
    });

    claude.on('close', (code) => {
        console.log(chalk.red(`\n[Claude Session Closed] Exit code: ${code}`));
    });

    return claude;
}

// Send input directly into the persistent session's stdin
function sendToClaudeSession(prompt: string): void {
    if (!claudeSession || claudeSession.killed) {
        console.error(chalk.red('Claude session is not running.'));
        return;
    }

    console.log(chalk.yellow(`\n[Sending to Active Session]: "${prompt}"`));
    claudeSession.stdin.write(`${prompt}\n`);
}

function parseRightClick(data: string): { x: number; y: number } | null {
    const match = data.match(/^\x1b\[<(\d+);(\d+);(\d+)([Mm])/);
    if (!match) return null;

    const buttonCode = parseInt(match[1], 10) & 3;
    const x = parseInt(match[2], 10);
    const y = parseInt(match[3], 10);
    const action = match[4];

    if (buttonCode === 2 && action === 'M') {
        return { x, y };
    }

    return null;
}

export function initListener() {
    const { stdin, stdout } = process;

    if (!stdin.isTTY) {
        console.error('Este terminal não suporta TTY');
        process.exit(1);
    }

    // 1. Start the background Claude process
    claudeSession = startClaudeSession();

    // 2. Enable mouse tracking on terminal input
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    stdout.write(ENABLE_MOUSE);

    let isProcessing = false;

    const promptUser = (query: string): Promise<string> => {
        stdout.write(DISABLE_MOUSE);
        stdin.setRawMode(false);

        const rl = readline.createInterface({
            input: stdin,
            output: stdout
        });

        return new Promise((resolve) => {
            rl.question(query, (answer) => {
                rl.close();
                stdin.setRawMode(true);
                stdin.resume();
                stdout.write(ENABLE_MOUSE);
                resolve(answer);
            });
        });
    };

    const handleData = async (data: string) => {
        if (data === '\x03') { // Ctrl+C
            cleanup();
            process.exit();
        }

        const event = parseRightClick(data);

        if (event && !isProcessing) {
            isProcessing = true;
            console.log(chalk.magenta(`\n[Mouse] Right click detected at X:${event.x}, Y:${event.y}`));

            try {
                const userPrompt = await promptUser(chalk.bold.cyan('\nDigite a instrução para o Claude: '));

                if (userPrompt.trim()) {
                    sendToClaudeSession(userPrompt);
                } else {
                    console.log(chalk.gray('Nenhum comando digitado. Operação cancelada.'));
                }
            } catch (err) {
                console.error('Erro no evento de clique:', err);
            } finally {
                isProcessing = false;
                console.log(chalk.gray('\nAguardando próximo clique com o botão direito...'));
            }
        }
    };

    const cleanup = () => {
        if (claudeSession) {
            claudeSession.kill();
        }
        stdout.write(DISABLE_MOUSE);
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeListener('data', handleData);
    };

    stdin.on('data', handleData);
    process.on('SIGINT', cleanup);
    process.on('exit', cleanup);

    console.log('Ouvindo cliques com o botão direito...\n');
}

// Banner setup
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

initListener();