/**
 * Update gamecontrollers -- A helper function to populate a JSON db with game controller info
 * directly from the SDL3 source code, and write it to controllerdb.json.
 * 
 * Entries are parsed [from community db](https://raw.githubusercontent.com/mdqinc/SDL_GameControllerDB/refs/heads/master/gamecontrollerdb.txt).
 */

import { writeFileSync } from "node:fs";

const buttonMap = [
  { sdl: "a", num: 0 },
  { sdl: "b", num: 1 },
  { sdl: "x", num: 2 },
  { sdl: "y", num: 3 },
  { sdl: "leftshoulder", num: 4 },
  { sdl: "rightshoulder", num: 5 },
  { sdl: "lefttrigger", num: 6 },
  { sdl: "righttrigger", num: 7 },
  { sdl: "back", num: 8 },
  { sdl: "start", num: 9 },
  { sdl: "leftstick", num: 10 },
  { sdl: "rightstick", num: 11 },
  { sdl: "dpup", num: 12 },
  { sdl: "dpdown", num: 13 },
  { sdl: "dpleft", num: 14 },
  { sdl: "dpright", num: 15 },
] as const;

const sdlButtonSet = new Set<string>(buttonMap.map(({ sdl }) => sdl));
const sdlToLikeMap = new Map<string, number>(
  buttonMap.map(({ sdl, num }) => [sdl, num]),
);

type MappingEntry = {
  name: string;
  mapping: Record<number, number>;
};

type ParsedSdlMapping = {
  vendor: number;
  product: number;
  name: string;
  mapping: Record<number, number>;
  os: string;
};

type OsSection<T> = Record<number, T>;
type MappingDb<T> = Record<string, OsSection<T>>;

async function generateMappingDb(): Promise<Record<string, OsSection<MappingEntry>>> {
    const header = await fetch(
      "https://raw.githubusercontent.com/mdqinc/SDL_GameControllerDB/refs/heads/master/gamecontrollerdb.txt",
    ).then((r) => r.text());

    const db: MappingDb<MappingEntry> = {};

    let mappingCount = 0;
    let duplicateMappingCount = 0;
    let ambiguousMappingCount = 0;
    let fullyAmbiguousMappingCount = 0;

    for (const line of header.split('\n')) {
        const map = parseDbLine(line);
        if (map) {
            const entry = map.vendor * 0x10000 + map.product;
            db[map.os] ??= {};
            const section = db[map.os];
            if (entry in section) {
                // A mapping already exists, so find the intersection of that
                // and this mapping. Never bind ambiguous values.
                let ambiguous = false;

                const mapping = Object.fromEntries(
                    Object.entries(map.mapping).filter(
                    ([k, v]) => {
                        const matches = section[entry].mapping[Number(k)] === v;
                        ambiguous = ambiguous || !matches;
                        return matches;
                    }
                    ),
                );

                if (ambiguous) ++ambiguousMappingCount;
                ++duplicateMappingCount;

                let name = map.name;
                if (!section[entry].name.includes(map.name)) {
                    name = map.name + " | " + section[entry].name;
                }
                section[entry] = {...map, name, mapping}
            } else {
                ++mappingCount;
                section[entry] = { name: map.name, mapping: map.mapping };
            }
        }
    }

    for (const os of Object.keys(db)) {
        for (const entry of Object.keys(db[os])) {
            const mapping = db[os][Number(entry)].mapping;
            if (!Object.keys(mapping).length) {
                delete db[os][Number(entry)];
                fullyAmbiguousMappingCount++;
            }
        }
    }

    console.log(`
Parsed Gamepad DB:
    total: ${mappingCount}
    duplicates: ${duplicateMappingCount}
    ambiguous: ${ambiguousMappingCount}
    fully ambiguous (pruned): ${fullyAmbiguousMappingCount}
    `);

    return db;
}

function parseDbLine(line: string): ParsedSdlMapping | undefined {
  if (line.trimStart().startsWith('#')) {
    return;
  }
  const [guid, name, ...mappings] = line.split(",");
  mappings.pop(); // trailing comma

  const vendor = 
    parseInt(guid.substring(8, 10), 16) +
    0x100 * parseInt(guid.substring(10, 12), 16);

  const product =
    parseInt(guid.substring(16, 18), 16) +
    0x100 * parseInt(guid.substring(18, 20), 16);

  if (!vendor || !product) return;

  let os = "Linux";
  const mapping: Record<number, number> = Object.fromEntries(
    mappings
      .map((s) => {
        const [sdl, bname] = s.split(":");
        if (sdl == "platform") {
          os = bname;
        }
        const browserIndex = sdlRawButtonToBrowser(bname);
        return (
          browserIndex !== undefined &&
          sdlButtonSet.has(sdl) && [browserIndex, sdlToLikeMap.get(sdl)]
        );
      })
      .filter((v) => !!v) as [number, number][],
  );

  return { name, vendor, product, mapping, os };
}

function sdlRawButtonToBrowser(btn: string): number | undefined {
  return btn.startsWith("b") ? Number(btn.substring(1)) : undefined;
}

const mappingDb = await generateMappingDb();
writeFileSync("./like/src/input/controllerdb.json", JSON.stringify(mappingDb));