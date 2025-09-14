import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ProductionPlan as ProductionPlanType } from '../types';
import {
  saveProductionPlanToStorage,
  loadProductionPlanFromStorage,
} from '../lib/localStorageUtils';
export const productionPlanKeys = {
  all: ['productionPlan'] as const,
  current: () => [...productionPlanKeys.all, 'current'] as const,
  inventory: (level: number) =>
    [...productionPlanKeys.all, 'inventory', level] as const,
};

// Default production plan
const defaultProductionPlan: ProductionPlanType = {
  levels: {
    1: {
      level: 1,
      steps: [],
      inventoryChanges: new Map(),
      done: false,
    },
  },
  totalTime: 0,
  maxConcurrentWorkers: 3, // Default value, will be updated from Db
};

// Fetch production plan from localStorage or return default
const fetchProductionPlan = async (): Promise<ProductionPlanType> => {
  const stored = loadProductionPlanFromStorage();
  if (stored) {
    return stored;
  }
  return defaultProductionPlan;
};

// Save production plan to localStorage
const saveProductionPlan = async (
  plan: ProductionPlanType
): Promise<ProductionPlanType> => {
  saveProductionPlanToStorage(plan);
  return plan;
};

// Hook to get production plan
export const useProductionPlan = () => {
  return useQuery({
    queryKey: productionPlanKeys.current(),
    queryFn: fetchProductionPlan,
    staleTime: 1000 * 60 * 1, // 1 minute
  });
};

// Hook to update production plan
export const useUpdateProductionPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (plan: ProductionPlanType) => {
      return saveProductionPlan(plan);
    },
    onSuccess: updatedPlan => {
      queryClient.setQueryData(productionPlanKeys.current(), updatedPlan);
      // Invalidate inventory queries for all levels
      queryClient.invalidateQueries({ queryKey: productionPlanKeys.all });
    },
  });
};

// Hook to get inventory at a specific level
export const useInventoryAtLevel = (level: number) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: productionPlanKeys.inventory(level),
    queryFn: async () => {
      const productionPlan = queryClient.getQueryData<ProductionPlanType>(
        productionPlanKeys.current()
      );
      if (!productionPlan) {
        return {};
      }
    },
    enabled: level > 0,
    staleTime: 1000 * 30, // 30 seconds
  });
};

// Hook to clear production plan
export const useClearProductionPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return saveProductionPlan(defaultProductionPlan);
    },
    onSuccess: clearedPlan => {
      queryClient.setQueryData(productionPlanKeys.current(), clearedPlan);
      queryClient.invalidateQueries({ queryKey: productionPlanKeys.all });
    },
  });
};
