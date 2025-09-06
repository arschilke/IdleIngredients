import { trains } from './data';
import { PlanningLevel, Step } from './types';

/**
 * Calculate the net inventory change for a step
 * @param step - The planned step to analyze
 * @returns Object with resourceId and net change (positive for production, negative for consumption)
 */
export function calculateStepInventoryChange(step: Step): Map<string, number> {
  const changes: Map<string, number> = new Map();

  if (step.type === 'factory' && step.recipe) {
    // Factory steps consume inputs and produce outputs
    // Add outputs (positive change)
    changes.set(step.resourceId, step.recipe.outputAmount);

    // Add inputs (negative change)
    step.recipe.requires.forEach(req => {
      changes.set(req.resourceId, -req.amount);
    });
  } else if (step.type === 'destination') {
    // Destination steps produce resources (positive change)
    changes.set(step.resourceId, trains[step.trainId].capacity);
  } else if (step.type === 'delivery') {
    // Delivery steps consume resources (negative change)
    changes.set(step.resourceId, -trains[step.trainId].capacity);
  }

  return changes;
}

export function getInventoryChanges(level: PlanningLevel): Map<string, number> {
  const inventoryChanges = new Map<string, number>();

  level.steps.forEach(step => {
    calculateStepInventoryChange(step).forEach((value, key) => {
      inventoryChanges.set(key, (inventoryChanges.get(key) || 0) + value);
    });
  });

  return inventoryChanges;
}
