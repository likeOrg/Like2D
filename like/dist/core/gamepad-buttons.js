// Gamepad button constants
// Use these constants instead of magic numbers
export var GP;
(function (GP) {
    // Face buttons (physical positions)
    GP.Bottom = 0; // A on Xbox, X on PlayStation, B on Nintendo
    GP.Right = 1; // B on Xbox, O on PlayStation, A on Nintendo
    GP.Left = 2; // X on Xbox, □ on PlayStation, Y on Nintendo
    GP.Top = 3; // Y on Xbox, △ on PlayStation, X on Nintendo
    // Bumpers and triggers
    GP.LB = 4; // Left bumper (L1)
    GP.RB = 5; // Right bumper (R1)
    GP.LT = 6; // Left trigger (L2)
    GP.RT = 7; // Right trigger (R2)
    // Menu buttons
    GP.Back = 8; // Select/Back/Minus
    GP.Start = 9; // Start/Plus
    GP.Guide = 10; // Home/Guide button
    // Stick presses
    GP.LS = 11; // Left stick press (L3)
    GP.RS = 12; // Right stick press (R3)
    // D-Pad
    GP.DUp = 13;
    GP.DDown = 14;
    GP.DLeft = 15;
    GP.DRight = 16;
})(GP || (GP = {}));
// Build reverse mappings programmatically
const GP_ENTRIES = Object.entries(GP);
// Map button index to name (for debugging/display)
export const GP_NAMES = Object.fromEntries(GP_ENTRIES.map(([name, index]) => [index, name]));
// Map name to button index (for action system parsing)
export const GP_NAME_MAP = Object.fromEntries(GP_ENTRIES);
export function getGPName(buttonIndex) {
    return GP_NAMES[buttonIndex] ?? `Button${buttonIndex}`;
}
