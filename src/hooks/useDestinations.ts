import type { Destination } from '../types';
import {
  loadDestinationsFromStorage,
  saveDestinationsToStorage,
} from '../lib/localStorageUtils';

// Query keys
export const destinationsKeys = {
  all: ['destinations'] as const,
  id: (id: string) => [...destinationsKeys.all, id] as const,
  lists: () => [...destinationsKeys.all, 'list'] as const,
  list: (filters: string) =>
    [...destinationsKeys.lists(), { filters }] as const,
};

const saveDestinations = async (
  destinations: Record<string, Destination>
): Promise<Record<string, Destination>> => {
  saveDestinationsToStorage(destinations);
  return destinations;
};

// Hook to get destinations
export const useDestinations = () => {
  return useQuery({
    queryKey: destinationsKeys.lists(),
    queryFn: async () => {
      return loadDestinationsFromStorage();
    },
    staleTime: 1000 * 60 * 60, // 1 hour - destinations don't change often
  });
};

export const useDestination = (id: string) => {
  return useQuery({
    queryKey: destinationsKeys.id(id),
    queryFn: async () => {
      return loadDestinationsFromStorage()[id];
    },
  });
};

export const useAddDestination = () => {
  return useMutation({
    mutationFn: async (destination: Destination) => {
      const currentDestinations = loadDestinationsFromStorage();
      const updatedDestinations = {
        ...currentDestinations,
        [destination.id]: destination,
      };
      return saveDestinations(updatedDestinations);
    },
  });
};
