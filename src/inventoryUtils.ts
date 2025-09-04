import { PlannedStep, PlanningLevel, GameState, Inventory } from './types';

/**
 * Resource status for a single job
 */
export interface JobResourceStatus {
  isSufficient: boolean;
  insufficientResources: Array<{
    resourceId: string;
    resourceName: string;
    required: number;
    available: number;
    shortfall: number;
  }>;
  totalRequired: Map<string, number>;
  availableAtStart: Map<string, number>;
}

/**
 * Calculate the net inventory change for a step
 * @param step - The planned step to analyze
 * @returns Object with resourceId and net change (positive for production, negative for consumption)
 */
export function calculateStepInventoryChange(
  step: PlannedStep
): { resourceId: string; netChange: number }[] {
  const changes: { resourceId: string; netChange: number }[] = [];

  if (step.type === 'factory' && step.recipe) {
    // Factory steps consume inputs and produce outputs
    // Add outputs (positive change)
    changes.push({
      resourceId: step.resourceId,
      netChange: step.amountProcessed,
    });

    // Add inputs (negative change)
    step.recipe.requires.forEach(req => {
      changes.push({
        resourceId: req.resourceId,
        netChange: -req.amount,
      });
    });
  } else if (step.type === 'destination') {
    // Destination steps produce resources (positive change)
    changes.push({
      resourceId: step.resourceId,
      netChange: step.amountProcessed,
    });
  } else if (step.type === 'delivery') {
    // Delivery steps consume resources (negative change)
    changes.push({
      resourceId: step.resourceId,
      netChange: -step.amountProcessed,
    });
  }

  return changes;
}

/**
 * Calculate resource sufficiency for a single job
 * @param step - The planned step to analyze
 * @param availableResources - Map of available resources at the start of the job's level
 * @param gameState - The current game state for resource names
 * @returns JobResourceStatus object with detailed resource information
 */
export function calculateJobResourceStatus(
  step: PlannedStep,
  availableResources: Map<string, number>,
  gameState: GameState
): JobResourceStatus {
  const requiredResources = new Map<string, number>();
  const insufficientResources: Array<{
    resourceId: string;
    resourceName: string;
    required: number;
    available: number;
    shortfall: number;
  }> = [];

  // Calculate required resources for this specific job
  if (step.recipe) {
    // Factory jobs consume inputs
    step.recipe.requires.forEach(req => {
      const current = requiredResources.get(req.resourceId) || 0;
      requiredResources.set(req.resourceId, current + req.amount);
    });
  } else if (step.type === 'delivery') {
    // Delivery jobs consume the resource being delivered
    const current = requiredResources.get(step.resourceId) || 0;
    requiredResources.set(step.resourceId, current + step.amountProcessed);
  }

  // Check if available resources are sufficient for this job
  let isSufficient = true;
  requiredResources.forEach((requiredAmount, resourceId) => {
    const availableAmount = availableResources.get(resourceId) || 0;

    if (availableAmount < requiredAmount) {
      isSufficient = false;
      const resourceName =
        gameState.resources.find(r => r.id === resourceId)?.name || resourceId;
      insufficientResources.push({
        resourceId,
        resourceName,
        required: requiredAmount,
        available: availableAmount,
        shortfall: requiredAmount - availableAmount,
      });
    }
  });

  return {
    isSufficient,
    insufficientResources,
    totalRequired: requiredResources,
    availableAtStart: availableResources,
  };
}

/**
 * Calculate resource status for all jobs in a level
 * @param level - The planning level to analyze
 * @param previousLevelWarehouseState - Warehouse state at the end of the previous level
 * @param gameState - The current game state
 * @returns Map of job ID to JobResourceStatus
 */
export function calculateLevelJobResourceStatuses(
  level: PlanningLevel,
  previousLevelWarehouseState: Map<string, number>,
  gameState: GameState
): Map<string, JobResourceStatus> {
  const jobStatuses = new Map<string, JobResourceStatus>();

  // Track available resources as we process jobs in order
  let currentAvailableResources = new Map(previousLevelWarehouseState);

  level.steps.forEach(step => {
    // Calculate resource status for this job
    const jobStatus = calculateJobResourceStatus(
      step,
      currentAvailableResources,
      gameState
    );
    jobStatuses.set(step.id, jobStatus);

    // Update available resources after this job (for subsequent jobs in the same level)
    if (jobStatus.isSufficient) {
      // Apply the job's inventory changes to available resources
      const stepChanges = calculateStepInventoryChange(step);
      stepChanges.forEach(change => {
        const current = currentAvailableResources.get(change.resourceId) || 0;
        currentAvailableResources.set(
          change.resourceId,
          current + change.netChange
        );
      });
    }
  });

  return jobStatuses;
}

/**
 * Get a simplified resource status for quick visual indicators
 * @param jobStatus - The detailed job resource status
 * @returns Simplified status for UI display
 */
export function getSimplifiedResourceStatus(
  jobStatus: JobResourceStatus
): 'sufficient' | 'insufficient' | 'no-resources' {
  if (jobStatus.totalRequired.size === 0) {
    return 'no-resources';
  }
  return jobStatus.isSufficient ? 'sufficient' : 'insufficient';
}

/**
 * Calculate the overall resource health score for a job (0-100)
 * @param jobStatus - The detailed job resource status
 * @returns Health score where 100 = fully sufficient, 0 = completely insufficient
 */
export function calculateResourceHealthScore(
  jobStatus: JobResourceStatus
): number {
  if (jobStatus.totalRequired.size === 0) {
    return 100; // No resources required
  }

  if (jobStatus.isSufficient) {
    return 100; // All resources are sufficient
  }

  // Calculate health based on how many resources are insufficient and by how much
  let totalShortfall = 0;
  let totalRequired = 0;

  jobStatus.insufficientResources.forEach(resource => {
    totalShortfall += resource.shortfall;
    totalRequired += resource.required;
  });

  // Health score decreases based on the proportion of insufficient resources
  const healthPercentage = Math.max(
    0,
    100 - (totalShortfall / totalRequired) * 100
  );
  return Math.round(healthPercentage);
}

/**
 * Get resource status summary for a level
 * @param level - The planning level to analyze
 * @param previousLevelWarehouseState - Warehouse state at the end of the previous level
 * @param gameState - The current game state
 * @returns Summary of resource status across all jobs in the level
 */
export function getLevelResourceSummary(
  level: PlanningLevel,
  previousLevelWarehouseState: Map<string, number>,
  gameState: GameState
): {
  totalJobs: number;
  sufficientJobs: number;
  insufficientJobs: number;
  overallHealth: number;
  criticalResources: string[];
} {
  const jobStatuses = calculateLevelJobResourceStatuses(
    level,
    previousLevelWarehouseState,
    gameState
  );

  let sufficientJobs = 0;
  let insufficientJobs = 0;
  let totalHealth = 0;
  const criticalResources = new Set<string>();

  jobStatuses.forEach(status => {
    if (status.isSufficient) {
      sufficientJobs++;
    } else {
      insufficientJobs++;
      // Add insufficient resources to critical list
      status.insufficientResources.forEach(resource => {
        criticalResources.add(resource.resourceId);
      });
    }
    totalHealth += calculateResourceHealthScore(status);
  });

  const totalJobs = level.steps.length;
  const overallHealth =
    totalJobs > 0 ? Math.round(totalHealth / totalJobs) : 100;

  return {
    totalJobs,
    sufficientJobs,
    insufficientJobs,
    overallHealth,
    criticalResources: Array.from(criticalResources),
  };
}

/**
 * Get real-time resource status for a specific job
 * @param step - The planned step to analyze
 * @param levels - Array of planning levels
 * @param gameState - The current game state
 * @param initialWarehouseState - The initial warehouse state
 * @returns Current resource status for the job
 */
export function getJobRealTimeResourceStatus(
  step: PlannedStep,
  levels: PlanningLevel[],
  gameState: GameState,
  initialWarehouseState: Map<string, number>
): JobResourceStatus {
  // Find the level this job belongs to
  const jobLevel = levels.find(l => l.level === step.level);
  if (!jobLevel) {
    // Job not in any level, return default status
    return {
      isSufficient: true,
      insufficientResources: [],
      totalRequired: new Map(),
      availableAtStart: initialWarehouseState,
    };
  }

  // Get warehouse state at the start of this level
  const levelStartWarehouseState =
    jobLevel.level === 1
      ? initialWarehouseState
      : levels.find(l => l.level === jobLevel.level - 1)?.warehouseState ||
        initialWarehouseState;

  // Calculate current resource status
  return calculateJobResourceStatus(step, levelStartWarehouseState, gameState);
}

/**
 * Check if a level has sufficient resources based on warehouse state at the end of the previous level
 * @param level - The level to check
 * @param previousLevelWarehouseState - Warehouse state at the end of the previous level
 * @returns Array of insufficient resources with details
 */
export function checkLevelResourceSufficiency(
  level: PlanningLevel,
  previousLevelWarehouseState: Map<string, number>
): Array<{
  resourceId: string;
  name: string;
  required: number;
  available: number;
}> {
  const requiredResources = new Map<string, number>();

  // Calculate total resources needed for all jobs in this level
  level.steps.forEach(step => {
    if (step.recipe) {
      // For factory jobs, add up all required resources from recipes
      step.recipe.requires.forEach(req => {
        const current = requiredResources.get(req.resourceId) || 0;
        requiredResources.set(req.resourceId, current + req.amount);
      });
    }
    if (step.type === 'delivery') {
      const requiredAmount = step.amountProcessed;
      const current = requiredResources.get(step.resourceId) || 0;
      requiredResources.set(step.resourceId, current + requiredAmount);
    }
  });

  // Check if the previous level's warehouse state has enough of each required resource
  const insufficientResources: Array<{
    resourceId: string;
    name: string;
    required: number;
    available: number;
  }> = [];
  requiredResources.forEach((requiredAmount, resourceId) => {
    const availableAmount = previousLevelWarehouseState.get(resourceId) || 0;
    if (availableAmount < requiredAmount) {
      insufficientResources.push({
        resourceId,
        name: resourceId, // We'll need to get the actual resource name from gameState
        required: requiredAmount,
        available: availableAmount,
      });
    }
  });

  return insufficientResources;
}
