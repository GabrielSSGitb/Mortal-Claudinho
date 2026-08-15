import readline from 'readline';

const ENABLE_MOUSE = '\x1b[?1000h\x1b[?1006h';
const DISABLE_MOUSE = '\x1b[?1000l\x1b[?1006l';

export interface RightClickEvent {
    action: 'press' | 'release';
    x: number;
    y: number;
}

function parseRightClickEvent(data: string): RightClickEvent | null {
    const match = data.match(/^\x1b\[<(\d+);(\d+);(\d+)([Mm])/);

    if (!match) return null;

    const buttonCode = parseInt(match[1], 10) & 3;

    const x = parseInt(match[2], 10);
    const y = parseInt(match[3], 10);
    const state = match[4]; // 'M' = press, 'm' = release

  // Button code 2 represents Right-Click
  if (buttonCode !== 2) return null;

  return {
    action: state === 'M' ? 'press' : 'release',
    x,
    y
  };
}