// SDL Game Controller Database parser
// Parses the gamecontrollerdb.txt file format

export interface ControllerMapping {
  guid: string;
  name: string;
  platform: string;
  // Maps SDL button names to controller button indices
  buttons: Map<string, number>;
  // Maps SDL axis names to controller axis indices
  axes: Map<string, number>;
  // Maps D-pad directions to hat index and value
  dpads: Map<string, { hat: number; value: number }>;
}

// SDL button names that we care about for standard layout
export const SDL_BUTTONS = [
  'a', 'b', 'x', 'y',
  'back', 'start', 'guide',
  'leftshoulder', 'rightshoulder',
  'lefttrigger', 'righttrigger',
  'leftstick', 'rightstick',
  'dpup', 'dpdown', 'dpleft', 'dpright',
  'misc1', 'misc2', 'paddle1', 'paddle2', 'paddle3', 'paddle4',
  'touchpad',
] as const;

export type SDLButton = (typeof SDL_BUTTONS)[number];

// SDL axis names
export const SDL_AXES = [
  'leftx', 'lefty',
  'rightx', 'righty',
] as const;

export type SDLAxis = (typeof SDL_AXES)[number];

export class GamepadDatabase {
  private mappings = new Map<string, ControllerMapping>();
  private vendorProductIndex = new Map<number, ControllerMapping>();
  private loaded = false;

  load(dbContent: string): void {
    this.mappings.clear();
    this.vendorProductIndex.clear();
    
    const lines = dbContent.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }
      
      const mapping = this.parseLine(trimmed);
      if (mapping) {
        this.mappings.set(mapping.guid, mapping);
        const vpKey = this.extractVendorProductKey(mapping.guid);
        if (vpKey !== null && !this.vendorProductIndex.has(vpKey)) {
          this.vendorProductIndex.set(vpKey, mapping);
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

  /**
   * Check if the database has been loaded
   */
  isLoaded(): boolean {
    return this.loaded;
  }

  /**
   * Get the number of loaded mappings
   */
  getMappingCount(): number {
    return this.mappings.size;
  }

  /**
   * Look up a controller mapping by GUID
   */
  getMapping(guid: string): ControllerMapping | undefined {
    return this.mappings.get(guid.toLowerCase());
  }

  getMappingByVendorProduct(vendor: number, product: number): ControllerMapping | undefined {
    const key = 0x10000 * vendor + product;
    return this.vendorProductIndex.get(key);
  }

  /**
   * Check if a controller is in the database
   */
  hasController(guid: string): boolean {
    return this.mappings.has(guid.toLowerCase());
  }

  /**
   * Get all mappings for a specific platform
   */
  getMappingsByPlatform(platform: string): ControllerMapping[] {
    const result: ControllerMapping[] = [];
    const platformLower = platform.toLowerCase();
    
    for (const mapping of this.mappings.values()) {
      if (mapping.platform.toLowerCase() === platformLower) {
        result.push(mapping);
      }
    }
    
    return result;
  }

  /**
   * Parse a single database line
   */
  private parseLine(line: string): ControllerMapping | null {
    // Format: GUID,Name,mapping pairs...,platform:Platform,
    const parts = line.split(',');
    
    if (parts.length < 3) {
      return null;
    }
    
    const guid = parts[0].toLowerCase().trim();
    const name = parts[1].trim();
    const buttons = new Map<string, number>();
    const axes = new Map<string, number>();
    const dpads = new Map<string, { hat: number; value: number }>();
    let platform = '';
    
    // Parse mapping pairs (key:value)
    for (let i = 2; i < parts.length; i++) {
      const part = parts[i].trim();
      if (!part) continue;
      
      // Check for platform specifier
      if (part.startsWith('platform:')) {
        platform = part.substring('platform:'.length).trim();
        continue;
      }
      
      // Parse key:value pairs
      const colonIndex = part.indexOf(':');
      if (colonIndex === -1) continue;
      
      const key = part.substring(0, colonIndex).trim();
      const value = part.substring(colonIndex + 1).trim();
      
      if (!key || !value) continue;
      
      // Parse button mapping (b0, b1, etc.)
      if (value.startsWith('b')) {
        const buttonIndex = parseInt(value.substring(1), 10);
        if (!isNaN(buttonIndex)) {
          buttons.set(key, buttonIndex);
        }
      }
      // Parse axis mapping (a0, a1, etc.)
      else if (value.startsWith('a')) {
        const axisIndex = parseInt(value.substring(1), 10);
        if (!isNaN(axisIndex)) {
          axes.set(key, axisIndex);
        }
      }
      // Parse hat mapping (h0.1, h0.4, etc.) - used for D-pad
      else if (value.startsWith('h')) {
        const hatParts = value.substring(1).split('.');
        if (hatParts.length === 2) {
          const hatIndex = parseInt(hatParts[0], 10);
          const hatValue = parseInt(hatParts[1], 10);
          if (!isNaN(hatIndex) && !isNaN(hatValue)) {
            dpads.set(key, { hat: hatIndex, value: hatValue });
          }
        }
      }
      // Parse axis-as-button mappings (+a0, -a0) - some controllers use axes for D-pad
      else if (value.startsWith('+a') || value.startsWith('-a')) {
        const axisIndex = parseInt(value.substring(2), 10);
        const direction = value[0] as '+' | '-';
        if (!isNaN(axisIndex)) {
          // Store as special button with axis info
          // We'll handle this in the mapping layer
          buttons.set(`${key}:${direction}`, axisIndex);
        }
      }
    }
    
    return {
      guid,
      name,
      platform,
      buttons,
      axes,
      dpads,
    };
  }
}

// Singleton instance
export const gamepadDatabase = new GamepadDatabase();
