// Gamepad button constants
// Use these constants instead of magic numbers

export namespace GP {
  // Face buttons (physical positions)
  export const Bottom = 0;  // A on Xbox, X on PlayStation, B on Nintendo
  export const Right = 1;   // B on Xbox, O on PlayStation, A on Nintendo
  export const Left = 2;    // X on Xbox, □ on PlayStation, Y on Nintendo
  export const Top = 3;     // Y on Xbox, △ on PlayStation, X on Nintendo

  // Bumpers and triggers
  export const LB = 4;      // Left bumper (L1)
  export const RB = 5;      // Right bumper (R1)
  export const LT = 6;      // Left trigger (L2)
  export const RT = 7;      // Right trigger (R2)

  // Menu buttons
  export const Back = 8;    // Select/Back/Minus
  export const Start = 9;   // Start/Plus
  export const Guide = 10;  // Home/Guide button

  // Stick presses
  export const LS = 11;     // Left stick press (L3)
  export const RS = 12;     // Right stick press (R3)

  // D-Pad
  export const DUp = 13;
  export const DDown = 14;
  export const DLeft = 15;
  export const DRight = 16;
}

// Build reverse mappings programmatically
const GP_ENTRIES = Object.entries(GP) as [string, number][];

// Map button index to name (for debugging/display)
export const GP_NAMES: Record<number, string> = Object.fromEntries(
  GP_ENTRIES.map(([name, index]) => [index, name])
);

// Map name to button index (for action system parsing)
export const GP_NAME_MAP: Record<string, number> = Object.fromEntries(GP_ENTRIES);

export function getGPName(buttonIndex: number): string {
  return GP_NAMES[buttonIndex] ?? `Button${buttonIndex}`;
}
