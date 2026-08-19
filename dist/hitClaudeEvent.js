const ENABLE_MOUSE = '\x1b[?1000h\x1b[?1006h';
const DISABLE_MOUSE = '\x1b[?1000l\x1b[?1006l';
export function runClaudeCommand(prompt) {
    return new Promise((resolve, reject) => {
        console.log(`\n[Claude] Processando: "${prompt}"...`);
    });
}
