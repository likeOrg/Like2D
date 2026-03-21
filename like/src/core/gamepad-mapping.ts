/**
 * @module GamepadMapping
 * 
 * A database, generated on module load,
 * which uses SDL's database to coerce our MEAGER
 * browser APIs into physical gamepad button
 * mappings.
 * 
 * Usage:
 * ```ts
 * const gp = new GamepadMapping(gamepad)
 * const likeButton = gp.applyMapping(buttonNumber);
 * ```
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
 *  - We go with best-match. Expect bugs, because the API is lacking.
 *  - If an axis isn't shown in the SDL db, we assume it's a dpad.
 *  - MOST controllers should work.
 *  - If yours doesn't work, file an issue.
 *  - A few controllers are vexing our software can't do anything. :(
 * 
 */

// @ts-ignore
import gamecontrollerdb from "../gamecontrollerdb.txt?raw";

// Single source of truth for mappings.
// https://www.w3.org/TR/gamepad/#dfn-standard-gamepad
const buttonMap = [
  { sdl: 'a', like: 'ButtonBottom', num: 0 as number },
  { sdl: 'b', like: 'ButtonRight', num: 1 },
  { sdl: 'x', like: 'ButtonLeft', num: 2 },
  { sdl: 'y', like: 'ButtonTop', num: 3 },

  { sdl: 'leftshoulder', like: 'ButtonL1', num: 4 },
  { sdl: 'rightshoulder', like: 'ButtonR1', num: 5 },
  { sdl: 'lefttrigger', like: 'ButtonL2', num: 6 },
  { sdl: 'righttrigger', like: 'ButtonR2', num: 7 },

  { sdl: 'back', like: 'ButtonMenuLeft', num: 8 },
  { sdl: 'start', like: 'ButtonMenuRight', num: 9 },
  { sdl: 'guide', like: 'ButtonMenuCenter', num: 16 },

  { sdl: 'leftstick', like: 'ButtonLeftStick', num: 10 },
  { sdl: 'rightstick', like: 'ButtonRightStick', num: 11 },

  { sdl: 'dpup', like: 'DpadUp', num: 12 },
  { sdl: 'dpdown', like: 'DpadDown', num: 13 },
  { sdl: 'dpleft', like: 'DpadLeft', num: 14 },
  { sdl: 'dpright', like: 'DpadRight', num: 15 },
] as const;

export const identityMap = new Map(buttonMap.map(({num, like}) => [num, like]));
export type LikeButton = typeof buttonMap[number]['like'];

/**
 * The parsed output of a gamepad ID string.
 */
export class GamepadMapping {
  vendor: number = 0x0000;
  product: number = 0x0000;
  name: string = "Unknown";
  sdlName: string = "Unknown";
  mapping: MapEntry["mapping"] = identityMap;

  constructor(info: Gamepad) {
    const parsed = GamepadMapping.tryParseId(info.id);

    if (parsed) {
      const [vendor, product, name] = parsed;
      this.vendor = parseInt(vendor, 16);
      this.product = parseInt(product, 16);
      this.name = name;
      const mapping = mappingDb.get(getVpNumber(this.vendor, this.product));
      console.log(getVpNumber(this.vendor, this.product).toString(16));
      if (mapping) {
        console.log(`[Gamepad] Found mapping`);
        this.sdlName = mapping.name;
        this.mapping = mapping.mapping;
        console.log(this.infoString());
      } else {
        console.log(`[Gamepad] No mapping found
    id string: '${info.id}'
    parsed :${JSON.stringify({ vendor, product, name })}`);
      }
    } else {
      console.log(`[Gamepad] Failed to parse id: ${info.id}`);
    }

    if (info.mapping == "standard") {
      this.mapping = identityMap;
      console.log("[Gamepad] Overridden with standard mapping.");
    }
  }

  /**
   * There is no standard way that browsers expose the 16-bit
   * vendor and product fields.
   *
   * If using the currently understood firefox/chromium format,
   * this will extract what we can.
   *
   * @returns [vendor, product, name]
   */
  static tryParseId(id: string): [string, string, string] | undefined {
    // Chrome: `Name (Vendor: XXXX, Product: YYYY)`
    const infoC = id.match(
      /^([^(]+)\(Vendor: ([0-9a-f]+) Product: ([0-9a-f]+)/i,
    );
    if (infoC) {
      const [, name, vendor, product] = infoC;
      return [vendor, product, name.trim()];
    } else {
      // Firefox: `VVVV-PPPP-name`
      const infoF = id.split("-");
      if (infoF.length == 3) {
        return infoF as any;
      }
    }
  }

  applyMapping(gp: Gamepad): Set<LikeButton> {
    const pressedButtons = new Set<LikeButton>();

    gp.buttons.forEach((btn, i) => {
      if (btn.pressed) {
        const maybeName = this.mapping.get(i) ?? identityMap.get(i);
        if (maybeName) {
          pressedButtons.add(maybeName);
        } else {
          console.log(`[Gamepad] Button not found for index ${i}`);
        }
      }
    })

    return pressedButtons;
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

// A convention used to have numeric keys in our db.
function getVpNumber(vendor: number, product: number) {
  return vendor * 0x10000 + product;
}

const sdlButtonSet = new Set<string>(buttonMap.map(({ sdl }) => sdl));
const sdlToLikeMap = new Map<string, LikeButton>(
  buttonMap.map(({ sdl, like }) => [sdl, like]),
);

type MappingDb = Map<number, MapEntry>;
type MapEntry = {
  name: string,
  mapping: Map<number, LikeButton>,
}

const mappingDb = generateMappingDb(gamecontrollerdb);

function generateMappingDb(db: string): MappingDb {
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
  mappings.pop(); // trailing comma

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
    : btn.startsWith("h") // format: h0.4 for dpad. Map to browser buttons.
    ? {1: 12, 2: 13, 4: 14, 8: 15}[Number(btn.substring(3))]
    : undefined;
}