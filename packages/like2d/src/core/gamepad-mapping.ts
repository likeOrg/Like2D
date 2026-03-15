// Gamepad button mapping layer
// Bridges SDL database mappings with our internal button naming system

import { GP } from './gamepad-buttons';

// Map SDL button names to our standard button indices
const SDL_TO_GP: Record<string, number> = {
  'a': GP.Bottom,
  'b': GP.Right,
  'x': GP.Left,
  'y': GP.Top,
  'leftshoulder': GP.LB,
  'rightshoulder': GP.RB,
  'lefttrigger': GP.LT,
  'righttrigger': GP.RT,
  'back': GP.Back,
  'start': GP.Start,
  'guide': GP.Guide,
  'leftstick': GP.LS,
  'rightstick': GP.RS,
  'dpup': GP.DUp,
  'dpdown': GP.DDown,
  'dpleft': GP.DLeft,
  'dpright': GP.DRight,
};

// Pre-built mapping that maps controller button index -> GP index
interface ControllerMapping {
  name: string;
  toStandard: Map<number, number>;
}

// Internal database for storing pre-built controller mappings
class GamepadDatabase {
  // vendorProductKey -> mapping
  private mappings = new Map<number, ControllerMapping>();
  private loaded = false;

  load(dbContent: string): void {
    this.mappings.clear();
    
    const lines = dbContent.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }
      
      const mapping = this.parseLine(trimmed);
      if (mapping) {
        // Extract vendor/product from GUID and store mapping
        const guid = line.split(',')[0].toLowerCase().trim();
        const vpKey = this.extractVendorProductKey(guid);
        if (vpKey !== null && !this.mappings.has(vpKey)) {
          this.mappings.set(vpKey, mapping);
        }
      }
    }
    
    this.loaded = true;
  }

  private extractVendorProductKey(guid: string): number | null {
    if (guid.length < 20) return null;
    const vendorHex = guid.substring(8, 12);
    const productHex = guid.substring(16, 20);
    const vendor = parseInt(vendorHex.substring(2, 4) + vendorHex.substring(0, 2), 16);
    const product = parseInt(productHex.substring(2, 4) + productHex.substring(0, 2), 16);
    if (isNaN(vendor) || isNaN(product)) return null;
    return 0x10000 * vendor + product;
  }

  isLoaded(): boolean {
    return this.loaded;
  }

  getMappingCount(): number {
    return this.mappings.size;
  }

  getMapping(vendor: number, product: number): ControllerMapping | undefined {
    const key = 0x10000 * vendor + product;
    return this.mappings.get(key);
  }

  private parseLine(line: string): ControllerMapping | null {
    const parts = line.split(',');
    
    if (parts.length < 3) {
      return null;
    }
    
    const name = parts[1].trim();
    const toStandard = new Map<number, number>();
    
    // Parse mapping pairs (key:value)
    for (let i = 2; i < parts.length; i++) {
      const part = parts[i].trim();
      if (!part || part.startsWith('platform:')) continue;
      
      const colonIndex = part.indexOf(':');
      if (colonIndex === -1) continue;
      
      const sdlName = part.substring(0, colonIndex).trim();
      const value = part.substring(colonIndex + 1).trim();
      
      if (!sdlName || !value) continue;
      
      // Only handle button mappings (b0, b1, etc.)
      if (value.startsWith('b')) {
        const controllerIndex = parseInt(value.substring(1), 10);
        const gpIndex = SDL_TO_GP[sdlName];
        if (!isNaN(controllerIndex) && gpIndex !== undefined) {
          toStandard.set(controllerIndex, gpIndex);
        }
      }
    }
    
    return { name, toStandard };
  }
}

// Singleton instance
const gamepadDatabase = new GamepadDatabase();

export interface ButtonMapping {
  toStandard: Map<number, number>;
  controllerName: string;
  hasMapping: boolean;
  vendor: number | null;
  product: number | null;
}

export class GamepadMapping {
  private dbLoaded = false;

  async loadDatabase(): Promise<void> {
    if (this.dbLoaded) return;

    try {
      const res = await fetch('./gamecontrollerdb.txt');
      if (res.ok) {
        const text = await res.text();
        // Validate it's actually the DB file, not HTML error page
        if (text.startsWith('# Game Controller DB') || text.includes('03000000')) {
          gamepadDatabase.load(text);
          this.dbLoaded = true;
        }
      }
    } catch {}

    if (!this.dbLoaded) {
      try {
        // @ts-ignore - Vite handles ?raw imports
        const module = await import('../gamecontrollerdb.txt?raw');
        if (typeof module.default === 'string') {
          gamepadDatabase.load(module.default);
          this.dbLoaded = true;
        }
      } catch {}
    }

    if (this.dbLoaded) {
      console.log(`[Gamepad] Loaded ${gamepadDatabase.getMappingCount()} controller mappings`);
    }
  }

  loadDatabaseFromText(content: string): void {
    gamepadDatabase.load(content);
    this.dbLoaded = true;
  }

  /**
   * Get button mapping for a specific gamepad
   */
  getMapping(gamepad: Gamepad): ButtonMapping {
    const vp = this.extractVendorProduct(gamepad);

    // If browser provides "standard" mapping, use identity mapping
    if (gamepad.mapping === 'standard') {
      return {
        toStandard: IDENTITY_MAP,
        controllerName: gamepad.id,
        hasMapping: true,
        vendor: vp?.vendor ?? null,
        product: vp?.product ?? null,
      };
    }

    // Look up in database
    if (vp && this.dbLoaded) {
      const dbMapping = gamepadDatabase.getMapping(vp.vendor, vp.product);
      if (dbMapping) {
        return {
          toStandard: dbMapping.toStandard,
          controllerName: dbMapping.name,
          hasMapping: true,
          vendor: vp.vendor,
          product: vp.product,
        };
      }
    }

    // No mapping found - use identity
    return {
      toStandard: IDENTITY_MAP,
      controllerName: gamepad.id,
      hasMapping: false,
      vendor: vp?.vendor ?? null,
      product: vp?.product ?? null,
    };
  }

  private extractVendorProduct(gamepad: Gamepad): { vendor: number; product: number } | null {
    const id = gamepad.id;

    const vendorProductMatch = id.match(/Vendor:\s*([0-9a-fA-F]+)\s+Product:\s*([0-9a-fA-F]+)/i);
    if (vendorProductMatch) {
      const vendor = parseInt(vendorProductMatch[1], 16);
      const product = parseInt(vendorProductMatch[2], 16);
      if (!isNaN(vendor) && !isNaN(product)) {
        return { vendor, product };
      }
    }

    const hexMatch = id.match(/^([0-9a-fA-F]{4})[\s-]+([0-9a-fA-F]{4})/);
    if (hexMatch) {
      const vendor = parseInt(hexMatch[1], 16);
      const product = parseInt(hexMatch[2], 16);
      if (!isNaN(vendor) && !isNaN(product)) {
        return { vendor, product };
      }
    }

    return null;
  }
}

// Reusable identity map for standard/unmapped controllers
const IDENTITY_MAP = new Map<number, number>([
  [0, 0], [1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7],
  [8, 8], [9, 9], [10, 10], [11, 11], [12, 12], [13, 13], [14, 14], [15, 15],
  [16, 16], [17, 17], [18, 18], [19, 19],
]);

// Singleton instance
export const gamepadMapping = new GamepadMapping();
