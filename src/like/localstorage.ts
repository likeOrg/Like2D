export class Localstorage {
  private prefix = 'like2d_';

  constructor() {}

  async write(name: string, data: unknown): Promise<boolean> {
    try {
      const json = JSON.stringify(data);
      localStorage.setItem(`${this.prefix}${name}`, json);
      return true;
    } catch (error) {
      console.error('Failed to write to local storage:', error);
      return false;
    }
  }

  async read<T = unknown>(name: string): Promise<T | null> {
    try {
      const data = localStorage.getItem(`${this.prefix}${name}`);
      if (data === null) {
        return null;
      }
      return JSON.parse(data) as T;
    } catch (error) {
      console.error('Failed to read from local storage:', error);
      return null;
    }
  }

  async readAll(): Promise<{ [key: string]: unknown }> {
    const allData: { [key: string]: unknown } = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        const name = key.slice(this.prefix.length);
        const data = localStorage.getItem(key);
        if (data !== null) {
          try {
            allData[name] = JSON.parse(data);
          } catch (error) {
            console.warn(`Failed to parse local storage item '${key}':`, error);
          }
        }
      }
    }
    return allData;
  }
}

export const localstorage = new Localstorage();
export default localstorage;