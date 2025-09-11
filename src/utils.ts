import type { Resource, Order } from './types';

/**
 * Formats a time duration in seconds to a human-readable string
 * @param seconds - The duration in seconds
 * @returns Formatted string like "2h 30m 15s" or "45m 30s" or "30s"
 */
export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};

/**
 * Gets the display name of a resource by its ID
 * @param resourceId - The resource ID to look up
 * @param gameState - The current game state containing resources
 * @returns The resource name or the ID if not found
 */
export const getResourceName = (
  resourceId: string,
  resources: Resource[]
): string => {
  return resources.find(r => r.id === resourceId)?.name || resourceId;
};

/**
 * Formats a number with appropriate units (K, M, B for thousands, millions, billions)
 * @param num - The number to format
 * @returns Formatted string like "1.5K", "2.3M", "1.1B"
 */
export const formatNumber = (num: number): string => {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(1) + 'B';
  } else if (num >= 1e6) {
    return (num / 1e6).toFixed(1) + 'M';
  } else if (num >= 1e3) {
    return (num / 1e3).toFixed(1) + 'K';
  } else {
    return num.toString();
  }
};

/**
 * Generates a unique ID for new game objects
 * @param prefix - Optional prefix for the ID
 * @returns A unique ID string
 */
export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Saves orders to localStorage
 * @param orders - Array of orders to save
 */
export const saveOrdersToStorage = (orders: Order[]): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(
        'idle-ingredients-orders',
        JSON.stringify(orders)
      );
    }
  } catch {
    // Silently fail if localStorage is not available
  }
};

/**
 * Loads orders from localStorage
 * @returns Array of orders or empty array if none found or error occurs
 */
export const loadOrdersFromStorage = (): Order[] => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem('idle-ingredients-orders');
      if (stored) {
        return JSON.parse(stored);
      }
    }
  } catch {
    // Silently fail if localStorage is not available
  }
  return [];
};
