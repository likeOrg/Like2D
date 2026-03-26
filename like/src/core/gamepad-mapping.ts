/**
 * @module GamepadMapping
 * 
 * A database, generated on module load,
 * which uses SDL's database to coerce
 * browser APIs into physical gamepad button
 * mappings.
 * 
 * Browser API shortcomings:
 *  - No standard way of exposing vendor and product
 *  - Almost nothing is standard
 *  - Vendor and product alone doesn't suffice for GUID -- Different controllers have the same.
 *  - D-pads either get mapped to an axis (last pair of axes in Chromium) or buttons (Firefox).
 *  - Analog axes get mapped differently in Firefox and Chromium.
 * 
 * How we overcome them:
 *  - We parse out vendor and product based on currently known formats.
 *  - We go with best-match and always fall back on manual mapping.
 */

// @ts-ignore
import gamecontrollerdb from "../gamecontrollerdb.txt?raw";

import type { Vector2 } from "../math/vector2";

/**
 * ref: https://www.w3.org/TR/gamepad/#dfn-standard-gamepad
 * note: `num` is only the corresponding number on standard mapping above.
 *
 * The point of the mapping system is to apply that _or_ non-standard mappings,
 * Which are exceedingly common.
 */
const buttonMap = [
  { sdl: 'a', like: "BBottom", num: 0 as number, name: "Bottom Face Button" },
  { sdl: 'b', like: "BRight", num: 1, name: "Right Face Button" },
  { sdl: 'x', like: "BLeft", num: 2, name: "Left Face Button" },
  { sdl: 'y', like: "BTop", num: 3, name: "Top Face Button" },

  { sdl: 'leftshoulder', like: "L1", num: 4, name: "Left shoulder (front)" },
  { sdl: 'rightshoulder', like: "R1", num: 5, name: "Right shoulder (front)" },
  { sdl: 'lefttrigger', like: "L2", num: 6, name: "Left shoulder (rear)" },
  { sdl: 'righttrigger', like: "R2", num: 7, name: "Right shoulder (rear)" },

  { sdl: 'back', like: "MenuLeft", num: 8, name: "Left Menu Button" },
  { sdl: 'start', like: "MenuRight", num: 9, name: "Right Menu Button" },

  { sdl: 'leftstick', like: "LeftStick", num: 10, name: "Left Stick Button" },
  { sdl: 'rightstick', like: "RightStick", num: 11, name: "Right Stick Button" },

  { sdl: 'dpup', like: "Up", num: 12, name: "D-Pad Up" },
  { sdl: 'dpdown', like: "Down", num: 13, name: "D-Pad Down" },
  { sdl: 'dpleft', like: "Left", num: 14, name: "D-Pad Left" },
  { sdl: 'dpright', like: "Right", num: 15, name: "D-Pad right" },
] as const;

export const allButtons = new Set<string>(buttonMap.map(({like}) => like));
export const fullButtonName = new Map(buttonMap.map(({like, name}) => [like, name]));

export type LikeButton = (typeof buttonMap)[number]["like"] | `Button${number}` | `Axis${number}+` | `Axis${number}-`;

export type GamepadMappingEntry = {
  buttons: ButtonMapping;
  sticks: StickMapping[];
};

export type ButtonMapping = Map<number, LikeButton>;
export const standardButtonMapping = (): Map<number, LikeButton> =>
  new Map(buttonMap.map(({ like, num }) => [num, like]));

export type StickMapping = [StickAxisMapping, StickAxisMapping];
export type StickAxisMapping = { index: number; invert: boolean };

export const defaultMapping = (stickCount: number): GamepadMappingEntry => ({
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

const identityMap = new Map(buttonMap.map(({num, like}) => [num, like]));

type MapEntry = {
  name: string,
  mapping: Map<number, LikeButton>,
}

const sdlButtonSet = new Set<string>(buttonMap.map(({ sdl }) => sdl));
const sdlToLikeMap = new Map<string, LikeButton>(
  buttonMap.map(({ sdl, like }) => [sdl, like]),
);

function getVpNumber(vendor: number, product: number) {
  return vendor * 0x10000 + product;
}

const mappingDb = generateMappingDb(gamecontrollerdb);

function generateMappingDb(db: string): Map<number, MapEntry> {
  const dbEntries = db
    .split("\n")
    .map((l) => l.trim())
    .filter((line) => line !== "" && !line.startsWith("#"))
    .map(parseDbLine);

  console.log(`[Gamepad] Parsed ${dbEntries.length} entries from DB`);
  const mappingDb = new Map(dbEntries);
  console.log(`[Gamepad] Final entry count: ${mappingDb.size}`);
  return mappingDb;
}

function parseDbLine(line: string): [number, MapEntry] {
  const [guid, name, ...mappings] = line.split(',');
  mappings.pop();

  const vpNum =
    0x1 * parseInt(guid.substring(16, 18), 16) +
    0x100 * parseInt(guid.substring(18, 20), 16) +
    0x10000 * parseInt(guid.substring(8, 10), 16) +
    0x1000000 * parseInt(guid.substring(10, 12), 16);

  const mapping = new Map(
    mappings
      .map((s) => {
        const [sdl, bname] = s.split(":");
        const browserIndex = sdlRawButtonToBrowser(bname);
        return browserIndex !== undefined && sdlButtonSet.has(sdl)
          && [browserIndex, sdlToLikeMap.get(sdl)]
      })
      .filter((v) => !!v) as [number, LikeButton][],
  );

  return [vpNum, {name, mapping}]
}

function sdlRawButtonToBrowser(btn: string): number | undefined {
  return btn.startsWith("b")
    ? Number(btn.substring(1))
    : btn.startsWith("h")
    ? {1: 12, 2: 13, 4: 14, 8: 15}[Number(btn.substring(3))]
    : undefined;
}

export class SdlGamepadMapping {
  vendor: number = 0x0000;
  product: number = 0x0000;
  name: string = "Unknown";
  sdlName: string = "Unknown";
  mapping: Map<number, LikeButton> = identityMap;

  constructor(info: Gamepad) {
    const parsed = SdlGamepadMapping.tryParseId(info.id);

    if (parsed) {
      const [vendor, product, name] = parsed;
      this.vendor = parseInt(vendor, 16);
      this.product = parseInt(product, 16);
      this.name = name.trim();
      const mapping = mappingDb.get(getVpNumber(this.vendor, this.product));
      if (mapping) {
        console.log(`[Gamepad] Found mapping for '${this.name}'`);
        this.sdlName = mapping.name;
        this.mapping = mapping.mapping;
      } else {
        console.log(`[Gamepad] No mapping found
    id string: '${info.id}'
    parsed: ${JSON.stringify({ vendor: this.vendor.toString(16), product: this.product.toString(16), name: this.name })}`);
      }
    } else {
      console.log(`[Gamepad] Failed to parse id: ${info.id}`);
    }

    if (info.mapping == "standard") {
      this.mapping = identityMap;
      console.log("[Gamepad] Overridden with standard mapping.");
    }
  }

  static tryParseId(id: string): [string, string, string] | undefined {
    const infoC = id.match(
      /^([^(]+)\(Vendor: ([0-9a-f]+) Product: ([0-9a-f]+)/i,
    );
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

  getMapping(): Map<number, LikeButton> {
    return this.mapping;
  }

  infoString(): string {
    return `
[Gamepad] Mapping info for '${this.name}' (sdl: ${this.sdlName})
  vendor: 0x${this.vendor.toString(16)}
  product: 0x${this.product.toString(16)}
  mapping: ${Array.from(this.mapping.entries()).map(([k,v]) => `\n    ${k}:${v}`)}
    `
  }
}

export function getMappingFromGamepad(gp: Gamepad): Map<number, LikeButton> {
  const mapper = new SdlGamepadMapping(gp);
  return mapper.getMapping();
}
