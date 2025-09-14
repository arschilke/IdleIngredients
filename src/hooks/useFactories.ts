import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Factory } from '../../types';
import {
  loadFactoriesFromStorage,
  saveFactoriesToStorage,
} from '../lib/localStorageUtils';
import { ensureLocalStorageData } from '../lib/migrateData';

const saveFactories = async (
  factories: Record<string, Factory>
): Promise<Record<string, Factory>> => {
  saveFactoriesToStorage(factories);
  return factories;
};

// Query keys
export const factoriesKeys = {
  all: ['factories'] as const,
  id: (id: string) => [...factoriesKeys.all, id] as const,
  lists: () => [...factoriesKeys.all, 'list'] as const,
  list: (filters: string) => [...factoriesKeys.lists(), { filters }] as const,
};

// Hook to get factories
export const useFactories = () => {
  return useQuery({
    queryKey: factoriesKeys.lists(),
    queryFn: async () => {
      await ensureLocalStorageData();
      return loadFactoriesFromStorage();
    },
    staleTime: 1000 * 60 * 60, // 1 hour - factories don't change often
  });
};

export const useFactory = (id: string) => {
  return useQuery({
    queryKey: factoriesKeys.id(id),
    queryFn: async () => {
      await ensureLocalStorageData();
      return loadFactoriesFromStorage()[id];
    },
  });
};

export const useAddFactory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (factory: Factory) => {
      const currentFactories =
        queryClient.getQueryData<Record<string, Factory>>(
          factoriesKeys.lists()
        ) || {};
      const updatedFactories = { ...currentFactories, [factory.id]: factory };
      return saveFactories(updatedFactories);
    },
  });
};

export const useUpdateFactory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (factory: Factory) => {
      const currentFactories =
        queryClient.getQueryData<Record<string, Factory>>(
          factoriesKeys.lists()
        ) || {};
      const updatedFactories = { ...currentFactories, [factory.id]: factory };
      return saveFactories(updatedFactories);
    },
  });
};
