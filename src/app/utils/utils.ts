export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function getInventoryChanges(
  level: any,
  factories: any[],
  trains: any[],
  orders: any[]
): Map<string, number> {
  // This is a simplified version - you'll need to implement the full logic
  const changes = new Map<string, number>();
  
  // Add logic here based on your React implementation
  // This would typically calculate inventory changes based on steps, factories, etc.
  
  return changes;
}

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
