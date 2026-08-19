import { spawn } from "child_process";
import chalk from "chalk";
import * as readline from "node:readline";
const ENABLE_MOUSE = '\x1b[?1000h\x1b[?1006h';
const DISABLE_MOUSE = '\x1b[?1000l\x1b[?1006l';
function runClaudeCommand(prompt) {
    return new Promise((resolve, reject) => {
        console.log(`\n[Claude] Processando: "${prompt}"...`);
        const claude = spawn('claude', [
            '-p', prompt,
            '--bare',
            '--dangerously-skip-permissions' // Evita que o Claude trave esperando confirmações interativas
        ], {
            stdio: ['pipe', 'pipe', 'pipe'], // Mudamos para 'pipe' no stdin para controlá-lo manualmente
            shell: process.platform === 'win32',
            env: {
                ...process.env,
                CI: 'true', // Força modo não-interativo
                NONINTERACTIVE: '1'
            }
        });
        // FECHA O STDIN IMEDIATAMENTE
        // Isso avisa ao Claude no nível de sistema que a entrada de dados acabou
        claude.stdin.end();
        let output = '';
        let errorOutput = '';
        claude.stdout.on('data', data => {
            output += data.toString();
        });
        claude.stderr.on('data', data => {
            errorOutput += data.toString();
        });
        claude.on('close', (code) => {
            if (code === 0) {
                resolve(output.trim());
            }
            else {
                reject("Error occurred while processing claude" + errorOutput);
            }
        });
    });
}
function parseRightClick(data) {
    const match = data.match(/^\x1b\[<(\d+);(\d+);(\d+)([Mm])/);
    if (!match)
        return null;
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
    // Ativa o modo RAW para ler eventos de mouse
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    stdout.write(ENABLE_MOUSE);
    let isProcessing = false;
    const promptUser = (query) => {
        // Desativa temporariamente o modo raw e o rastreamento do mouse para capturar digitação normal
        stdout.write(DISABLE_MOUSE);
        stdin.setRawMode(false);
        const rl = readline.createInterface({
            input: stdin,
            output: stdout
        });
        return new Promise((resolve) => {
            rl.question(query, (answer) => {
                rl.close();
                // Reativa o modo raw e rastreamento do mouse após a digitação
                stdin.setRawMode(true);
                stdin.resume();
                stdout.write(ENABLE_MOUSE);
                resolve(answer);
            });
        });
    };
    const handleData = async (data) => {
        if (data === '\x03') { // Ctrl+C
            cleanup();
            process.exit();
        }
        const event = parseRightClick(data);
        if (event && !isProcessing) {
            isProcessing = true;
            console.log(`\n[Mouse] Clique direito detectado em X:${event.x}, Y:${event.y}`);
            try {
                // Solicita o prompt ao usuário dinamicamente
                const userPrompt = await promptUser(chalk.bold.cyan('\nDigite o comando para o Claude: '));
                if (userPrompt.trim()) {
                    const response = await runClaudeCommand(userPrompt);
                    console.log(`\n--- Resposta do Claude ---\n${response}\n-------------------------`);
                }
                else {
                    console.log(chalk.gray('Nenhum prompt digitado. Operação cancelada.'));
                }
            }
            catch (err) {
                console.error('Erro ao processar comando do Claude:', err);
            }
            finally {
                isProcessing = false;
                console.log('\nAguardando próximo clique com o botão direito...');
            }
        }
    };
    const cleanup = () => {
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
