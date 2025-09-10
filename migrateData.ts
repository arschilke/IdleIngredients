import { db } from './db';
import { 
  saveResourcesToStorage, 
  saveFactoriesToStorage, 
  saveDestinationsToStorage, 
  saveTrainsToStorage,
  loadResourcesFromStorage,
  loadFactoriesFromStorage,
  loadDestinationsFromStorage,
  loadTrainsFromStorage
} from './localStorageUtils';

// Convert Db arrays to Record format
const convertArrayToRecord = <T extends { id: string }>(array: T[]): Record<string, T> => {
  return array.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {} as Record<string, T>);
};

// Migrate data from Db to localStorage
export const migrateDbToLocalStorage = async (): Promise<void> => {
  try {
    console.log('Starting migration from Db to localStorage...');
    
    // Get data from Db
    const resources = await db.getResources();
    const factories = await db.getFactories();
    const destinations = await db.getDestinations();
    const trains = await db.getTrains();
    
    // Convert to Record format
    const resourcesRecord = convertArrayToRecord(resources);
    const factoriesRecord = convertArrayToRecord(factories);
    const destinationsRecord = convertArrayToRecord(destinations);
    const trainsRecord = trains; // Already in Record format
    
    // Save to localStorage
    saveResourcesToStorage(resourcesRecord);
    saveFactoriesToStorage(factoriesRecord);
    saveDestinationsToStorage(destinationsRecord);
    saveTrainsToStorage(trainsRecord);
    
    console.log('Migration completed successfully!');
    console.log(`Migrated ${resources.length} resources, ${factories.length} factories, ${destinations.length} destinations, ${Object.keys(trains).length} trains`);
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

// Check if localStorage has data, if not migrate from Db
export const ensureLocalStorageData = async (): Promise<void> => {
  const hasResources = Object.keys(loadResourcesFromStorage()).length > 0;
  const hasFactories = Object.keys(loadFactoriesFromStorage()).length > 0;
  const hasDestinations = Object.keys(loadDestinationsFromStorage()).length > 0;
  const hasTrains = Object.keys(loadTrainsFromStorage()).length > 0;
  
  if (!hasResources || !hasFactories || !hasDestinations || !hasTrains) {
    console.log('LocalStorage data missing, migrating from Db...');
    await migrateDbToLocalStorage();
  } else {
    console.log('LocalStorage data already exists');
  }
};
