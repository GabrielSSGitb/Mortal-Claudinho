const ENABLE_MOUSE = '\x1b[?1000h\x1b[?1006h';
const DISABLE_MOUSE = '\x1b[?1000l\x1b[?1006l';
function parseRightClickEvent(data) {
    const match = data.match(/^\x1b\[<(\d+);(\d+);(\d+)([Mm])/);
    if (!match)
        return null;
    const buttonCode = parseInt(match[1], 10) & 3;
    const x = parseInt(match[2], 10);
    const y = parseInt(match[3], 10);
    const state = match[4]; // 'M' = press, 'm' = release
    // Button code 2 represents Right-Click
    if (buttonCode !== 2)
        return null;
    return {
        action: state === 'M' ? 'press' : 'release',
        x,
        y
    };
}
export function listenForRightClickEvents(onRightClick) {
    const { stdin, stdout } = process;
    if (!stdin.isTTY) {
        throw new Error('Terminal does not support TTY or mouse tracking.');
    }
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    stdout.write(ENABLE_MOUSE);
    const handleData = (data) => {
        // Handle Ctrl+C exit in raw mode
        if (data === '\x03') {
            cleanup();
            process.exit();
        }
        const rightClick = parseRightClickEvent(data);
        if (rightClick) {
            onRightClick(rightClick);
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
    return cleanup;
}
export function activateRightClickListener() {
    console.log('Listening ONLY for right clicks... (Press Ctrl+C to exit)');
    listenForRightClickEvents((event) => {
        console.log(`Right-Click ${event.action.toUpperCase()} at Column: ${event.x}, Row: ${event.y}`);
    });
}
