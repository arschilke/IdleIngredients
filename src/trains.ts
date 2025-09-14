import {
  type Train,
  type PlanningLevel,
  type TrainClass,
  type Country,
  StepType,
  type DeliveryStep,
  type DestinationStep,
} from './types';

export const getBestTrains = (
  level: PlanningLevel,
  amount: number,
  trains: Record<string, Train>,
  allowedClasses?: TrainClass[],
  allowedCountries?: Country[]
): Train[] => {
  // Get busy train IDs from the level
  const busyTrainIds = level.steps
    .filter(
      step =>
        step.type === StepType.Destination || step.type === StepType.Delivery
    )
    .map(step => (step as DestinationStep | DeliveryStep).trainId);

  // Filter out busy trains and get available ones
  const applicableTrains = Object.values(trains).filter((x: Train) => {
    // Check if train is not busy
    const isNotBusy = x.id !== undefined && !busyTrainIds.includes(x.id);

    // Check if train class is allowed (if allowedClasses is provided)
    const isClassAllowed = !allowedClasses || allowedClasses.includes(x.class);
    const isCountryAllowed =
      !allowedCountries || allowedCountries.includes(x.country);

    return isNotBusy && isClassAllowed && isCountryAllowed;
  });

  // Sort trains by how close their capacity is to the required amount
  const bestTrains = applicableTrains.sort(
    (a, b) => Math.abs(a.capacity - amount) - Math.abs(b.capacity - amount)
  );

  if (bestTrains.length === 0) {
    return [];
  }

  // Select trains until we have enough capacity
  let index = 0;
  let capacity = 0;
  const neededTrains: Train[] = [];

  do {
    capacity += bestTrains[index].capacity;
    neededTrains.push(bestTrains[index]);
    index++;
  } while (capacity < amount && index < bestTrains.length);

  return neededTrains;
};
