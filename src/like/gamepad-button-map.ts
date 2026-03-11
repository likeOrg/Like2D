// Button name to index mapping using physical layout
export const GAMEPAD_BUTTON_MAP: Record<string, number> = {
  // Face buttons - physical positions (not labels)
  'ButtonBottom': 0,
  'ButtonRight': 1,
  'ButtonLeft': 2,
  'ButtonTop': 3,

  // Bumpers and triggers
  'LB': 4,
  'L1': 4,
  'RB': 5,
  'R1': 5,
  'LT': 6,
  'L2': 6,
  'RT': 7,
  'R2': 7,

  // Menu buttons
  'Back': 8,
  'Select': 8,
  'Start': 9,

  // Stick presses
  'LS': 10,
  'L3': 10,
  'RS': 11,
  'R3': 11,

  // D-Pad
  'DPadUp': 12,
  'DPadDown': 13,
  'DPadLeft': 14,
  'DPadRight': 15,
};

// Reverse mapping: index to primary name
export const GAMEPAD_BUTTON_NAMES: Record<number, string> = {
  0: 'ButtonBottom',
  1: 'ButtonRight',
  2: 'ButtonLeft',
  3: 'ButtonTop',
  4: 'LB',
  5: 'RB',
  6: 'LT',
  7: 'RT',
  8: 'Back',
  9: 'Start',
  10: 'LS',
  11: 'RS',
  12: 'DPadUp',
  13: 'DPadDown',
  14: 'DPadLeft',
  15: 'DPadRight',
};

export function getButtonName(buttonIndex: number): string {
  return GAMEPAD_BUTTON_NAMES[buttonIndex] ?? `Button${buttonIndex}`;
}

export function getButtonIndex(buttonName: string): number | undefined {
  return GAMEPAD_BUTTON_MAP[buttonName];
}
