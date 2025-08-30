import { Train, PlanningLevel } from './types';

/**
 * Get the best available trains for a given amount of resources
 * @param level - The planning level to check for busy trains
 * @param amount - The amount of resources that need to be transported
 * @param trains - Array of available trains
 * @returns Array of trains that can handle the transport
 */
export function getBestTrains(level: PlanningLevel, amount: number, trains: Train[]): Train[] {
  // Get busy train IDs from the level
  const busyTrainIds = level.steps
    .filter(step => step.trainId !== undefined)
    .map(step => step.trainId!);

  // Filter out busy trains and get available ones
  const applicableTrains = trains.filter(t =>
    !busyTrainIds.includes(t.id) &&
    t.availableAt <= level.startTime
  );

  // Sort trains by how close their capacity is to the required amount
  const bestTrains = applicableTrains.sort((a, b) =>
    Math.abs(a.capacity - amount) - Math.abs(b.capacity - amount)
  );

  if (bestTrains.length === 0) {
    return [];
  }
  
  // Select trains until we have enough capacity
  let index = 0;
  let capacity = 0;
  let neededTrains: Train[] = [];
  
  do {
    capacity += bestTrains[index].capacity;
    neededTrains.push(bestTrains[index]);
    index++;
  } while (capacity < amount && index < bestTrains.length);

  return neededTrains;
}
