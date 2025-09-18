import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  Resource,
  Factory,
  Destination,
  Train,
  Order,
  ProductionPlan,
} from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  // Storage keys
  private readonly STORAGE_KEYS = {
    RESOURCES: 'idle-ingredients-resources',
    FACTORIES: 'idle-ingredients-factories',
    DESTINATIONS: 'idle-ingredients-destinations',
    TRAINS: 'idle-ingredients-trains',
    ORDERS: 'idle-ingredients-orders',
    PRODUCTION_PLAN: 'idle-ingredients-production-plan',
    INITIAL_INVENTORY: 'idle-ingredients-initial-inventory',
  } as const;

  // Generic localStorage utilities
  private saveToStorage<T>(key: string, data: T): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, JSON.stringify(data));
      }
    } catch (error) {
      console.error(`Failed to save ${key} to localStorage:`, error);
    }
  }

  private loadFromStorage<T>(key: string, defaultValue: T): T {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(key);
        if (stored) {
          return JSON.parse(stored);
        }
      }
    } catch (error) {
      console.error(`Failed to load ${key} from localStorage:`, error);
    }
    return defaultValue;
  }

  // Resources
  saveResourcesToStorage(resources: Record<string, Resource>): void {
    this.saveToStorage(this.STORAGE_KEYS.RESOURCES, resources);
  }

  loadResourcesFromStorage(): Record<string, Resource> {
    return this.loadFromStorage(this.STORAGE_KEYS.RESOURCES, {} as Record<string, Resource>);
  }

  // Factories
  saveFactoriesToStorage(factories: Record<string, Factory>): void {
    this.saveToStorage(this.STORAGE_KEYS.FACTORIES, factories);
  }

  loadFactoriesFromStorage(): Record<string, Factory> {
    return this.loadFromStorage(this.STORAGE_KEYS.FACTORIES, {} as Record<string, Factory>);
  }

  // Destinations
  saveDestinationsToStorage(destinations: Record<string, Destination>): void {
    this.saveToStorage(this.STORAGE_KEYS.DESTINATIONS, destinations);
  }

  loadDestinationsFromStorage(): Record<string, Destination> {
    return this.loadFromStorage(this.STORAGE_KEYS.DESTINATIONS, {} as Record<string, Destination>);
  }

  // Trains
  saveTrainsToStorage(trains: Record<string, Train>): void {
    this.saveToStorage(this.STORAGE_KEYS.TRAINS, trains);
  }

  loadTrainsFromStorage(): Record<string, Train> {
    return this.loadFromStorage(this.STORAGE_KEYS.TRAINS, {} as Record<string, Train>);
  }

  // Orders
  saveOrdersToStorage(orders: Order[]): void {
    this.saveToStorage(this.STORAGE_KEYS.ORDERS, orders);
  }

  loadOrdersFromStorage(): Order[] {
    return this.loadFromStorage(this.STORAGE_KEYS.ORDERS, [] as Order[]);
  }

  // Production Plan
  saveProductionPlanToStorage(plan: ProductionPlan): void {
    this.saveToStorage(this.STORAGE_KEYS.PRODUCTION_PLAN, plan);
  }

  loadProductionPlanFromStorage(): ProductionPlan | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(this.STORAGE_KEYS.PRODUCTION_PLAN);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Convert inventoryChanges arrays back to Maps
          if (parsed.levels) {
            Object.values(parsed.levels).forEach((level: any) => {
              if (
                level.inventoryChanges &&
                typeof level.inventoryChanges === 'object'
              ) {
                const newMap = new Map<string, number>();
                Object.entries(level.inventoryChanges).forEach(([key, value]) => {
                  newMap.set(key, value as number);
                });
                level.inventoryChanges = newMap;
              }
            });
          }
          return parsed;
        }
      }
    } catch (error) {
      console.error('Failed to load production plan from localStorage:', error);
    }
    return null;
  }

  // Initial Inventory
  saveInitialInventoryToStorage(inventory: Map<string, number>): void {
    this.saveToStorage(this.STORAGE_KEYS.INITIAL_INVENTORY, Object.fromEntries(inventory));
  }

  loadInitialInventoryFromStorage(): Map<string, number> {
    return new Map<string, number>(
      Object.entries(this.loadFromStorage(this.STORAGE_KEYS.INITIAL_INVENTORY, {} as Record<string, number> ))
    );
  }

  // Clear all data
  clearAllData(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        Object.values(this.STORAGE_KEYS).forEach(key => {
          window.localStorage.removeItem(key);
        });
      }
    } catch (error) {
      console.error('Failed to clear data from localStorage:', error);
    }
  }
  
}
