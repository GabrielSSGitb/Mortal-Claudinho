const ENABLE_MOUSE = '\x1b[?1000h\x1b[?1006h';
const DISABLE_MOUSE = '\x1b[?1000l\x1b[?1006l';

export interface RightClickEvent {
    action: 'press' | 'release';
    x: number;
    y: number;
}

export function runClaudeCommand(prompt: string): Promise<String> {
    return new Promise((resolve, reject) => {
        console.log(`\n[Claude] Processando: "${prompt}"...`);
    });
}
