// Friendlier names for the buttons.

import type { Vector2 } from "../math/vector2";

/**
 * ref: https://www.w3.org/TR/gamepad/#dfn-standard-gamepad
 * note: `num` is only the corresponding number on standard mapping above.
 *
 * The point of the mapping system is to apply that _or_ non-standard mappings,
 * Which are exceedingly common.
 */
const buttonMap = [
  { like: "BBottom", num: 0 as number, name: "Bottom Face Button" },
  { like: "BRight", num: 1, name: "Right Face Button" },
  { like: "BLeft", num: 2, name: "Left Face Button" },
  { like: "BTop", num: 3, name: "Top Face Button" },

  { like: "L1", num: 4, name: "Left shoulder (front)" },
  { like: "R1", num: 5, name: "Right shoulder (front)" },
  { like: "L2", num: 6, name: "Left shoulder (rear)" },
  { like: "R2", num: 7, name: "Right shoulder (rear)" },

  { like: "MenuLeft", num: 8, name: "Left Menu Button" },
  { like: "MenuRight", num: 9, name: "Right Menu Button" },

  { like: "LeftStick", num: 10, name: "Left Stick Button" },
  { like: "RightStick", num: 11, name: "Right Stick Button" },

  { like: "Up", num: 12, name: "D-Pad Up" },
  { like: "Down", num: 13, name: "D-Pad Down" },
  { like: "Left", num: 14, name: "D-Pad Left" },
  { like: "Right", num: 15, name: "D-Pad right" },
] as const;

export const allButtons = new Set<string>(buttonMap.map(({like}) => like));
export const fullButtonName = new Map(buttonMap.map(({like, name}) => [like, name]));

export type LikeButton = (typeof buttonMap)[number]["like"] | `Unknown${number}`;

export type GamepadMapping = {
  buttons: ButtonMapping;
  sticks: StickMapping[];
};

export type ButtonMapping = Map<number, LikeButton>;
export const standardButtonMapping = (): Map<number, LikeButton> =>
  new Map(buttonMap.map(({ like, num }) => [num, like]));

export type StickMapping = [StickAxisMapping, StickAxisMapping];
export type StickAxisMapping = { index: number; invert: boolean };

export const defaultMapping = (stickCount: number): GamepadMapping => ({
  buttons: new Map(),
  sticks: Array(stickCount / 2)
    .fill(0)
    .map((_, i) => [
      { index: i * 2, invert: false },
      { index: i * 2 + 1, invert: false },
    ]),
});

export const mapStick = (gp: Gamepad, mapping: StickMapping): Vector2 => {
  return mapping.map(
    (axis: StickAxisMapping) =>
      (axis.invert ? -1 : 1) * (gp.axes[axis.index] ?? 0),
  ) as Vector2;
};