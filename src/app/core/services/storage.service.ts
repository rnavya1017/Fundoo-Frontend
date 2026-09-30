import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  get<T>(key: string, fallback: T): T {
    if (typeof localStorage === 'undefined') return fallback;
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  }

  set<T>(key: string, value: T): void {
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, JSON.stringify(value));
  }

  remove(key: string): void {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
  }
}
