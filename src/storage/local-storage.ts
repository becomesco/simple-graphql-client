import { Storage } from './interfaces/storage.interface';

export class LocalStorage implements Storage {
  constructor(private readonly prfx?: string) {}

  public get(key: string): any {
    const value = localStorage.getItem(`${this.prfx}${key}`);
    if (value) {
      try {
        return JSON.parse(value);
      } catch (error) {
        return value;
      }
    }
    return undefined;
  }
  public set(key: string, value: any): boolean {
    try {
      if (typeof value === 'object') {
        localStorage.setItem(`${this.prfx}${key}`, JSON.stringify(value));
      } else {
        localStorage.setItem(`${this.prfx}${key}`, value);
      }
    } catch (error) {
      console.error(error);
      return false;
    }
    return true;
  }
  public remove(key: string): boolean {
    try {
      localStorage.removeItem(`${this.prfx}${key}`);
    } catch (error) {
      console.error(error);
      return false;
    }
    return true;
  }
}
