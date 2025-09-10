import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  loadTrainsFromStorage,
  saveTrainsToStorage,
} from '../../localStorageUtils';
import { ensureLocalStorageData } from '../../migrateData';
import type { Train } from 'types';

// Query keys
export const trainsKeys = {
  all: ['trains'] as const,
  id: (id: string) => [...trainsKeys.all, id] as const,
  lists: () => [...trainsKeys.all, 'list'] as const,
  list: (filters: string) => [...trainsKeys.lists(), { filters }] as const,
};

// Fetch orders from localStorage
const fetchTrains = async (): Promise<Record<string, Train>> => {
  await ensureLocalStorageData();
  return loadTrainsFromStorage();
};

// Save orders to localStorage
const saveTrains = async (
  trains: Record<string, Train>
): Promise<Record<string, Train>> => {
  saveTrainsToStorage(trains);
  return trains;
};

// Hook to get trains
export const useTrains = () => {
  return useQuery({
    queryKey: trainsKeys.lists(),
    queryFn: fetchTrains,
    staleTime: 1000 * 60 * 60, // 1 hour - trains don't change often
  });
};

export const useTrain = (id: string) => {
  return useQuery({
    queryKey: trainsKeys.id(id),
    queryFn: async () => {
      await ensureLocalStorageData();
      return loadTrainsFromStorage()[id];
    },
    staleTime: 1000 * 60 * 60, // 1 hour - trains don't change often
  });
};

// Hook to get all data at once (useful for components that need multiple data types)
export const useAddTrain = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (train: Train) => {
      const currentTrains =
        queryClient.getQueryData<Record<string, Train>>(trainsKeys.lists()) ||
        {};
      const updatedTrains = { ...currentTrains, [train.id]: train };
      return saveTrains(updatedTrains);
    },
    onSuccess: (trains: Record<string, Train>) => {
      queryClient.setQueryData(trainsKeys.lists(), trains);
    },
  });
};

export const useUpdateTrain = (train: Train) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (train: Train) => {
      const currentTrains =
        queryClient.getQueryData<Record<string, Train>>(trainsKeys.lists()) ||
        {};
      const updatedTrains = { ...currentTrains, [train.id]: train };
      return saveTrains(updatedTrains);
    },
    onSuccess: (trains: Record<string, Train>) => {
      queryClient.setQueryData(trainsKeys.lists(), trains);
    },
  });
};
