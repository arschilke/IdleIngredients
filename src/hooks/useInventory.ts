import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  type Inventory,
  type PlanningLevel,
  type ProductionPlan,
  type Step,
  StepType,
  type Order,
  type DeliveryStep,
  type Factory,
  type DestinationStep,
  type Train,
} from '../types';
import { useFactories } from './useFactories';
import { useTrains } from './useTrains';

// Query keys
export const inventoryKeys = {
  all: ['inventory'] as const,
  stepChanges: (stepId: string) =>
    [...inventoryKeys.all, 'stepChanges', stepId] as const,
  levelChanges: (levelId: number) =>
    [...inventoryKeys.all, 'levelChanges', levelId] as const,
  atLevel: (levelNumber: number) =>
    [...inventoryKeys.all, 'atLevel', levelNumber] as const,
};

/**
 * Calculate the net inventory change for a step
 */
const calculateStepInventoryChange = (
  step: Step,
  order: Order | undefined,
  factories: Record<string, Factory>,
  trains: Record<string, Train>
): Map<string, number> => {
  const changes: Map<string, number> = new Map();

  switch (step.type) {
    case StepType.Factory:
      return calculateFactoryStepChanges(step, factories);

    case StepType.Destination:
      return calculateDestinationStepChanges(step, trains);

    case StepType.Delivery:
      return calculateDeliveryStepChanges(step, trains);

    case StepType.Submit:
      return calculateSubmitStepChanges(step, order);

    default:
      console.warn(`Unknown step type: ${(step as any).type}`);
      return changes;
  }
};

/**
 * Calculate inventory changes for a factory step
 */
const calculateFactoryStepChanges = (
  step: Step,
  factories: Record<string, any>
): Map<string, number> => {
  const changes: Map<string, number> = new Map();

  const recipe = Object.values(factories)
    .flatMap((f: any) => f.recipes)
    .find((r: any) => r.resourceId === step.resourceId);

  if (!recipe) {
    console.warn(`Recipe not found for resource: ${step.resourceId}`);
    return changes;
  }

  // Add output (positive change)
  changes.set(step.resourceId, recipe.outputAmount);

  // Add inputs (negative change)
  recipe.requires.forEach((requirement: any) => {
    changes.set(requirement.resourceId, -requirement.amount);
  });

  return changes;
};

/**
 * Calculate inventory changes for a destination step
 */
const calculateDestinationStepChanges = (
  step: DestinationStep,
  trains: Record<string, Train>
): Map<string, number> => {
  const changes: Map<string, number> = new Map();

  const train = trains[step.trainId];
  if (!train) {
    console.warn(`Train not found: ${step.trainId}`);
    return changes;
  }

  changes.set(step.resourceId, train.capacity);
  return changes;
};

/**
 * Calculate inventory changes for a delivery step
 */
const calculateDeliveryStepChanges = (
  step: DeliveryStep,
  trains: Record<string, Train>
): Map<string, number> => {
  const changes: Map<string, number> = new Map();

  const train = trains[step.trainId];
  if (!train) {
    console.warn(`Train not found: ${step.trainId}`);
    return changes;
  }

  changes.set(step.resourceId, -train.capacity);
  return changes;
};

/**
 * Calculate inventory changes for a submit step
 */
const calculateSubmitStepChanges = (
  step: Step,
  order?: Order
): Map<string, number> => {
  const changes: Map<string, number> = new Map();

  if (!order) {
    console.warn(`Order not provided for submit step calculation: ${step.id}`);
    return changes;
  }

  // Find the specific resource requirement for this submit step
  const resourceRequirement = order.resources.find(
    r => r.resourceId === step.resourceId
  );
  if (!resourceRequirement) {
    console.warn(
      `Resource requirement not found for submit step: ${step.id}, resourceId: ${step.resourceId}`
    );
    return changes;
  }

  // Submit steps consume the required amount (negative change)
  changes.set(step.resourceId, -resourceRequirement.amount);
  return changes;
};

/**
 * Hook to calculate inventory changes for a single step
 */
export const useStepInventoryChanges = (step: Step, order?: Order) => {
  const { data: factories } = useFactories();
  const { data: trains } = useTrains();

  return useQuery({
    queryKey: inventoryKeys.stepChanges(step.id),
    queryFn: () => {
      if (!factories || !trains) return new Map();
      return calculateStepInventoryChange(step, order, factories, trains);
    },
    enabled: !!factories && !!trains,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to calculate inventory changes for a planning level
 */
export const useLevelInventoryChanges = (
  level: PlanningLevel,
  orders?: Order[]
) => {
  const { data: factories } = useFactories();
  const { data: trains } = useTrains();

  const inventoryChanges = new Map<string, number>();

  level.steps.forEach(step => {
    let order: Order | undefined;
    if (step.type === StepType.Submit && orders) {
      order = orders.find(o => o.id === step.orderId);
    }

    calculateStepInventoryChange(step, order, factories!, trains!).forEach(
      (value, key) => {
        inventoryChanges.set(key, (inventoryChanges.get(key) || 0) + value);
      }
    );
  });

  return inventoryChanges;
};

/**
 * Hook to calculate inventory at a specific level
 */
export const calculateInventoryAtLevel = (
  productionPlan: ProductionPlan,
  levelNumber: number
) => {
  return useQuery({
    queryKey: inventoryKeys.atLevel(levelNumber),
    queryFn: () => {
      // Initialize inventory
      const inventory: Inventory = {};

      // Get all level numbers, sort them in ascending order
      const sortedLevels = Object.keys(productionPlan.levels)
        .map(Number)
        .filter(lvl => lvl <= levelNumber)
        .sort((a, b) => a - b);

      // Step through each level in order, applying inventory changes
      for (const lvl of sortedLevels) {
        const level = productionPlan.levels[lvl];
        if (!level) continue;
        for (const [resourceId, change] of level.inventoryChanges.entries()) {
          inventory[resourceId] += change;
        }
      }

      return inventory;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!productionPlan,
  });
};

/**
 * Hook to get step output amount
 */
export const useStepOutputAmount = (step: Step) => {
  const { data: factories } = useFactories();
  const { data: trains } = useTrains();

  return useMemo(() => {
    if (!factories || !trains) return 0;

    if (step.type === StepType.Destination) {
      const train = trains[(step as any).trainId];
      return train?.capacity ?? 0;
    }
    if (step.type === StepType.Factory) {
      const recipe = Object.values(factories)
        .flatMap((f: any) => f.recipes)
        .find((r: any) => r.resourceId === step.resourceId);
      return recipe?.outputAmount ?? 0;
    }
    return 0;
  }, [step, factories, trains]);
};

/**
 * Hook to get step input amounts
 */
export const useStepInputAmounts = (step: Step) => {
  const { data: factories } = useFactories();
  const { data: trains } = useTrains();

  return useMemo(() => {
    if (!factories || !trains) return new Map();

    if (step.type === StepType.Factory) {
      const recipe = Object.values(factories)
        .flatMap((f: any) => f.recipes)
        .find((r: any) => r.resourceId === step.resourceId);

      if (!recipe) return new Map();

      return new Map(
        recipe.requires.map((req: any) => [req.resourceId, req.amount])
      );
    }
    if (step.type === StepType.Delivery) {
      const train = trains[(step as any).trainId];
      if (!train) return new Map();

      return new Map([[(step as any).resourceId, train.capacity]]);
    }
    return new Map();
  }, [step, factories, trains]);
};
