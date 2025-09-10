import { db } from './db';
import type { Inventory, PlanningLevel, ProductionPlan, Step } from './types';

/**
 * Calculate the net inventory change for a step
 * @param step - The planned step to analyze
 * @returns Object with resourceId and net change (positive for production, negative for consumption)
 */
export const calculateStepInventoryChange = (
  step: Step
): Map<string, number> => {
  const changes: Map<string, number> = new Map();

  if (step.type === 'factory') {
    const recipe = db.getRecipe(step.resourceId);
    // Factory steps consume inputs and produce outputs
    // Add outputs (positive change)
    changes.set(step.resourceId, recipe?.outputAmount ?? 0);
    // Add inputs (negative change)
    recipe?.requires.forEach(req => {
      changes.set(req.resourceId, -req.amount);
    });
  } else if (step.type === 'destination') {
    // Destination steps produce resources (positive change)
    changes.set(step.resourceId, db.trains[step.trainId].capacity);
  } else if (step.type === 'delivery') {
    // Delivery steps consume resources (negative change)
    changes.set(step.resourceId, -db.trains[step.trainId].capacity);
  }

  return changes;
};

export const getInventoryChanges = (
  level: PlanningLevel
): Map<string, number> => {
  const inventoryChanges = new Map<string, number>();

  level.steps.forEach(step => {
    calculateStepInventoryChange(step).forEach((value, key) => {
      inventoryChanges.set(key, (inventoryChanges.get(key) || 0) + value);
    });
  });

  return inventoryChanges;
};

export const getInventoryAtLevel = (
  productionPlan: ProductionPlan,
  levelNumber: number
): Inventory => {
  // Initialize inventory with zero for each resource
  const inventory: Inventory = {};
  Object.keys(db.resources).forEach(resourceId => {
    inventory[resourceId] = 0;
  });

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
};
