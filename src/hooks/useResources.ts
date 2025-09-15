import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Resource } from '../types';
import {
  loadResourcesFromStorage,
  saveResourcesToStorage,
} from '../lib/localStorageUtils';
import { ensureLocalStorageData } from '../lib/migrateData';

// Query keys
export const resourceKeys = {
  all: ['resources'] as const,
  id: (id: string) => [...resourceKeys.all, id] as const,
  lists: () => [...resourceKeys.all, 'list'] as const,
  list: (filters: string) => [...resourceKeys.lists(), { filters }] as const,
};

const saveResources = async (
  resources: Record<string, Resource>
): Promise<Record<string, Resource>> => {
  saveResourcesToStorage(resources);
  return resources;
};

// Hook to get resources
export const useResources = () => {
  return useQuery({
    queryKey: resourceKeys.lists(),
    queryFn: async () => {
      await ensureLocalStorageData();
      return loadResourcesFromStorage();
    },
    staleTime: 1000 * 60 * 60, // 1 hour - resources don't change often
  });
};

export const useUpdateResource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (resource: Resource) => {
      const currentResources =
        queryClient.getQueryData<Record<string, Resource>>(
          resourceKeys.lists()
        ) || {};
      const updatedResources = { ...currentResources, [resource.id]: resource };
      return saveResources(updatedResources);
    },
  });
};

export const useAddResource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (resource: Resource) => {
      const currentResources =
        queryClient.getQueryData<Record<string, Resource>>(
          resourceKeys.lists()
        ) || {};
      const updatedResources = { ...currentResources, [resource.id]: resource };
      return saveResources(updatedResources);
    },
  });
};
