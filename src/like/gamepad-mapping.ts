// Gamepad button mapping layer
// Bridges SDL database mappings with our internal button naming system

import { gamepadDatabase, ControllerMapping } from './gamepad-db.ts';
import { getButtonIndex } from './gamepad-button-map.ts';

// Map SDL button names to our internal button names
const SDL_TO_INTERNAL_BUTTON: Record<string, string> = {
  // Face buttons
  'a': 'ButtonBottom',
  'b': 'ButtonRight',
  'x': 'ButtonLeft',
  'y': 'ButtonTop',

  // Bumpers and triggers
  'leftshoulder': 'LB',
  'rightshoulder': 'RB',
  'lefttrigger': 'LT',
  'righttrigger': 'RT',

  // Menu buttons
  'back': 'Back',
  'start': 'Start',
  'guide': 'Guide',

  // Stick presses
  'leftstick': 'LS',
  'rightstick': 'RS',

  // D-Pad
  'dpup': 'DPadUp',
  'dpdown': 'DPadDown',
  'dpleft': 'DPadLeft',
  'dpright': 'DPadRight',

  // Misc buttons
  'misc1': 'Misc1',
  'misc2': 'Misc2',
  'paddle1': 'Paddle1',
  'paddle2': 'Paddle2',
  'paddle3': 'Paddle3',
  'paddle4': 'Paddle4',
  'touchpad': 'Touchpad',
};

export interface ButtonMapping {
  // Maps controller-specific button index to standard button index
  toStandard: Map<number, number>;
  // Maps standard button index to controller-specific button index
  fromStandard: Map<number, number>;
  // Controller info
  controllerName: string;
  hasMapping: boolean;
}

export class GamepadMapping {
  private mappings = new Map<string, ButtonMapping>();
  private dbLoaded = false;

  async loadDatabase(): Promise<void> {
    if (this.dbLoaded) return;

    const sources = ['/like/gamecontrollerdb.txt', './gamecontrollerdb.txt'];
    for (const src of sources) {
      try {
        const res = await fetch(src);
        if (res.ok) {
          gamepadDatabase.load(await res.text());
          this.dbLoaded = true;
          break;
        }
      } catch {}
    }

    if (!this.dbLoaded) {
      try {
        // @ts-ignore - Vite handles ?raw imports
        const module = await import('./gamecontrollerdb.txt?raw');
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

  /**
   * Load database from raw text content
   */
  loadDatabaseFromText(content: string): void {
    gamepadDatabase.load(content);
    this.dbLoaded = true;
  }

  /**
   * Get or create a button mapping for a specific gamepad
   */
  getMapping(gamepad: Gamepad): ButtonMapping {
    // Use the gamepad's id as a key (this contains the GUID in most browsers)
    const key = `${gamepad.id}_${gamepad.index}`;

    if (this.mappings.has(key)) {
      return this.mappings.get(key)!;
    }

    const mapping = this.createMapping(gamepad);
    this.mappings.set(key, mapping);
    return mapping;
  }

  /**
   * Clear all cached mappings
   */
  clear(): void {
    this.mappings.clear();
  }

  /**
   * Create a new button mapping for a gamepad
   */
  private createMapping(gamepad: Gamepad): ButtonMapping {
    const toStandard = new Map<number, number>();
    const fromStandard = new Map<number, number>();

    // Try to find a mapping in the database
    const dbMapping = this.findDatabaseMapping(gamepad);

    if (dbMapping) {
      // Use the database mapping
      for (const [sdlButton, controllerButtonIndex] of dbMapping.buttons) {
        const internalName = SDL_TO_INTERNAL_BUTTON[sdlButton];
        if (internalName) {
          const standardIndex = getButtonIndex(internalName);
          if (standardIndex !== undefined) {
            toStandard.set(controllerButtonIndex, standardIndex);
            fromStandard.set(standardIndex, controllerButtonIndex);
          }
        }
      }

      return {
        toStandard,
        fromStandard,
        controllerName: dbMapping.name,
        hasMapping: true,
      };
    }

    // No database mapping found - use default Xbox-style layout
    // This assumes the browser already normalized the layout
    for (let i = 0; i < gamepad.buttons.length; i++) {
      toStandard.set(i, i);
      fromStandard.set(i, i);
    }

    return {
      toStandard,
      fromStandard,
      controllerName: gamepad.id,
      hasMapping: false,
    };
  }

  private findDatabaseMapping(gamepad: Gamepad): ControllerMapping | undefined {
    if (!this.dbLoaded) return undefined;

    const vp = this.extractVendorProduct(gamepad);
    if (vp) {
      return gamepadDatabase.getMappingByVendorProduct(vp.vendor, vp.product);
    }
    return undefined;
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

// Singleton instance
export const gamepadMapping = new GamepadMapping();
export default gamepadMapping;
