import type {
  Resource,
  Factory,
  Destination,
  Train,
  Order,
  ProductionPlan,
} from '../types';

// Storage keys
const STORAGE_KEYS = {
  RESOURCES: 'idle-ingredients-resources',
  FACTORIES: 'idle-ingredients-factories',
  DESTINATIONS: 'idle-ingredients-destinations',
  TRAINS: 'idle-ingredients-trains',
  ORDERS: 'idle-ingredients-orders',
  PRODUCTION_PLAN: 'idle-ingredients-production-plan',
} as const;

// Generic localStorage utilities
const saveToStorage = <T>(key: string, data: T): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, JSON.stringify(data));
    }
  } catch (error) {
    console.error(`Failed to save ${key} to localStorage:`, error);
  }
};

const loadFromStorage = <T>(key: string, defaultValue: T): T => {
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
};

// Resources
export const saveResourcesToStorage = (
  resources: Record<string, Resource>
): void => {
  saveToStorage(STORAGE_KEYS.RESOURCES, resources);
};

export const loadResourcesFromStorage = (): Record<string, Resource> => {
  return loadFromStorage(STORAGE_KEYS.RESOURCES, {});
};

// Factories
export const saveFactoriesToStorage = (
  factories: Record<string, Factory>
): void => {
  saveToStorage(STORAGE_KEYS.FACTORIES, factories);
};

export const loadFactoriesFromStorage = (): Record<string, Factory> => {
  return loadFromStorage(STORAGE_KEYS.FACTORIES, {});
};

// Destinations
export const saveDestinationsToStorage = (
  destinations: Record<string, Destination>
): void => {
  saveToStorage(STORAGE_KEYS.DESTINATIONS, destinations);
};

export const loadDestinationsFromStorage = (): Record<string, Destination> => {
  return loadFromStorage(STORAGE_KEYS.DESTINATIONS, {});
};

// Trains
export const saveTrainsToStorage = (trains: Record<string, Train>): void => {
  saveToStorage(STORAGE_KEYS.TRAINS, trains);
};

export const loadTrainsFromStorage = (): Record<string, Train> => {
  return loadFromStorage(STORAGE_KEYS.TRAINS, {});
};

// Orders (keeping existing functions for compatibility)
export const saveOrdersToStorage = (orders: Order[]): void => {
  saveToStorage(STORAGE_KEYS.ORDERS, orders);
};

export const loadOrdersFromStorage = (): Order[] => {
  return loadFromStorage(STORAGE_KEYS.ORDERS, []);
};

// Production Plan
export const saveProductionPlanToStorage = (plan: ProductionPlan): void => {
  saveToStorage(STORAGE_KEYS.PRODUCTION_PLAN, plan);
};

export const loadProductionPlanFromStorage = (): ProductionPlan | null => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(STORAGE_KEYS.PRODUCTION_PLAN);
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
};

// Initialize default data if not exists
export const initializeDefaultData = (): void => {
  // Only initialize if no data exists
  if (Object.keys(loadResourcesFromStorage()).length === 0) {
    // We'll populate this with data from db.ts
    console.log('Initializing default data...');
  }
};

// Clear all data (useful for resetting the app)
export const clearAllData = (): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      Object.values(STORAGE_KEYS).forEach(key => {
        window.localStorage.removeItem(key);
      });
    }
  } catch (error) {
    console.error('Failed to clear data from localStorage:', error);
  }
};
