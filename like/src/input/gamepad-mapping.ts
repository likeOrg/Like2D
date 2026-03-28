/**
 * @module GamepadMapping
 *
 * A database, generated on module load,
 * which uses SDL's database to coerce
 * browser APIs into physical gamepad button
 * mappings.
 * 
 *
 * Browser API shortcomings:
 *  - [No standard way of exposing vendor/product, Safari doesn't even do it.](https://github.com/w3c/gamepad/issues/199)
 *  - Vendor and product alone doesn't suffice for GUID -- Different controllers have the same, it's good-enough.
 *  - D-pads either get mapped to an axis (last pair of axes in Chromium) or buttons (Firefox).
 *  - Analog axes get mapped differently in Firefox and Chromium.
 *
 * How we overcome them:
 *  - We parse out vendor and product based on currently known formats.
 *  - We go with best-match and always fall back on manual mapping.
 */

import type { Vector2 } from "../math";

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

const detectedOs = ((s: string) => ([
  ["Android", "Android"],
  ["iPhone", "iOS"],
  ["iPad", "iOS"],
  ["Win", "Windows"],
  ["Mac", "Mac OS X"],
] as const).find(([ss]) => s.includes(ss))?.[1] ?? "Linux")(navigator.userAgent);

export type LikeButton =
  | (typeof buttonMap)[number]["like"]
  | `Button${number}`
  | `Axis${number}+`
  | `Axis${number}-`;

//// ************* General Gamepad Mapping Functions ******************* ////

export type GamepadMapping = {
  buttons: ButtonMapping;
  sticks: StickMapping[];
};

export type ButtonMapping = Record<number, LikeButton>;
export type StickMapping = [StickAxisMapping, StickAxisMapping];
export type StickAxisMapping = { index: number; invert: boolean };

export const defaultMapping = (stickCount: number): GamepadMapping => ({
  buttons: {},
  sticks: Array(stickCount)
    .fill(0)
    .map((_, i) => [
      { index: i * 2, invert: false },
      { index: i * 2 + 1, invert: false },
    ]),
});

export const standardButtonMapping = (): ButtonMapping =>
  Object.fromEntries(buttonMap.map(({ like, num }) => [num, like]));
export const allButtons = new Set<string>(buttonMap.map(({ like }) => like));
export const fullButtonName = new Map(
  buttonMap.map(({ like, name }) => [like, name]),
);

export const mapStick = (gp: Gamepad, mapping: StickMapping): Vector2 => {
  return mapping.map(
    (axis: StickAxisMapping) =>
      (axis.invert ? -1 : 1) * (gp.axes[axis.index] ?? 0),
  ) as Vector2;
};

//// ************* SDL Gamepad auto-binding system ******************* ////

import mappingDbRaw from "./controllerdb.json" with { type: 'json' };

const mappingDb: Map<number, SdlMapping> = new Map(
  Object.entries(mappingDbRaw[detectedOs]).map(([k, v]) => [
    Number(k),
    {
      ...v,
      mapping: Object.fromEntries(
        Object.entries(v.mapping).map(([k, v]) => [Number(k), v as LikeButton]),
      ),
    },
  ]),
);

type SdlMapping = {
  vendor: number;
  product: number;
  name: string;
  mapping: Record<number, LikeButton>;
  browserName?: string;
  id?: string;
};

export function getSdlMapping(gamepad: Gamepad): SdlMapping | undefined {
  const parsed = trySplitId(gamepad.id);

  if (parsed) {
    const [vendorStr, productStr, nameStr] = parsed;
    const vendor = parseInt(vendorStr, 16);
    const product = parseInt(productStr, 16);
    const name = nameStr.trim();
    const mapping = mappingDb.get(vendor * 0x10000 + product);
    if (mapping) {
      console.log(`[Gamepad] Found SDL db mapping for '${name}'`);
      return {
        ...mapping,
        browserName: name,
        id: gamepad.id,
      };
    } else {
      console.log(`[Gamepad] No SDL db mapping found for '${gamepad.id}.`);
    }
  } else {
    console.log(
      `[Gamepad] Failed to parse id: ${gamepad.id}. Please report this bug with the name of your web browser.`,
    );
  }
}

function trySplitId(id: string): [string, string, string] | undefined {
  const infoC = id.match(/^([^(]+)\(Vendor: ([0-9a-f]+) Product: ([0-9a-f]+)/i);
  if (infoC) {
    // chrome pattern: Name(Vendor: VEND Product: PROD)
    const [, name, vendor, product] = infoC;
    return [vendor, product, name.trim()];
  } else {
    // firefox pattern: VEND-PROD-Name
    const infoF = id.split("-");
    if (infoF.length == 3) {
      return infoF as [string, string, string];
    }
  }
}