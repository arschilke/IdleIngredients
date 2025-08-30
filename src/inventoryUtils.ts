import { PlannedStep, PlanningLevel } from "./types";

/**
 * Calculate the net inventory change for a step
 * @param step - The planned step to analyze
 * @returns Object with resourceId and net change (positive for production, negative for consumption)
 */
export function calculateStepInventoryChange(step: PlannedStep): { resourceId: string; netChange: number }[] {
    const changes: { resourceId: string; netChange: number }[] = [];
    
    if (step.type === 'factory' && step.recipe) {
      // Factory steps consume inputs and produce outputs
      // Add outputs (positive change)
      changes.push({
        resourceId: step.resourceId,
        netChange: step.amountProcessed
      });
      
      // Add inputs (negative change)
      step.recipe.requires.forEach(req => {
        changes.push({
          resourceId: req.resourceId,
          netChange: -req.amount
        });
      });
    } else if (step.type === 'destination') {
      // Destination steps produce resources (positive change)
      changes.push({
        resourceId: step.resourceId,
        netChange: step.amountProcessed
      });
    } else if (step.type === 'delivery') {
      // Delivery steps consume resources (negative change)
      changes.push({
        resourceId: step.resourceId,
        netChange: -step.amountProcessed
      });
    }
    
    return changes;
  }
  
  /**
   * Calculate the warehouse state at the end of a specific level
   * @param levels - Array of planning levels
   * @param targetLevel - The level up to which to calculate warehouse state
   * @param initialWarehouseState - The initial warehouse state (from gameState)
   * @returns Map of resourceId to available amount at the end of the target level
   */
  export function calculateWarehouseStateAtLevel(
    levels: PlanningLevel[], 
    targetLevel: number, 
    initialWarehouseState: Map<string, number>
  ): Map<string, number> {
    const warehouseState = new Map(initialWarehouseState);
    
    // Process levels in order up to the target level
    for (const level of levels) {
      if (level.level > targetLevel) break;
      
      // Apply this level's inventory changes to the warehouse state
      level.inventoryChanges.forEach((change, resourceId) => {
        const current = warehouseState.get(resourceId) || 0;
        warehouseState.set(resourceId, current + change);
      });
    }
    
    return warehouseState;
  }
  
  /**
   * Update warehouse state for all levels after adding a step to a previous level
   * @param levels - Array of planning levels
   * @param step - The step that was added
   * @param targetLevel - The level where the step was added
   * @param initialWarehouseState - The initial warehouse state
   * @returns Updated levels with recalculated warehouse state
   */
  export function updateWarehouseStateAfterStepAddition(
    levels: PlanningLevel[], 
    step: PlannedStep, 
    targetLevel: number,
    initialWarehouseState: Map<string, number>
  ): PlanningLevel[] {
    const updatedLevels = [...levels];
    
    // Calculate the inventory change for the new step
    const stepChanges = calculateStepInventoryChange(step);
    
    // Find the target level and update its inventory changes
    const targetLevelIndex = updatedLevels.findIndex(l => l.level === targetLevel);
    if (targetLevelIndex !== -1) {
      const targetLevelObj = updatedLevels[targetLevelIndex];
      
      // Update inventory changes for this level
      stepChanges.forEach(change => {
        const current = targetLevelObj.inventoryChanges.get(change.resourceId) || 0;
        targetLevelObj.inventoryChanges.set(change.resourceId, current + change.netChange);
      });
    }
    
    // Recalculate warehouse state for all levels starting from the target level
    for (let i = targetLevelIndex; i < updatedLevels.length; i++) {
      const level = updatedLevels[i];
      
      // Calculate warehouse state at the end of this level
      level.warehouseState = calculateWarehouseStateAtLevel(
        updatedLevels, 
        level.level, 
        initialWarehouseState
      );
    }
    
    return updatedLevels;
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
  ): Array<{ resourceId: string; name: string; required: number; available: number }> {
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
    const insufficientResources: Array<{ resourceId: string; name: string; required: number; available: number }> = [];
    requiredResources.forEach((requiredAmount, resourceId) => {
      const availableAmount = previousLevelWarehouseState.get(resourceId) || 0;
      if (availableAmount < requiredAmount) {
        insufficientResources.push({
          resourceId,
          name: resourceId, // We'll need to get the actual resource name from gameState
          required: requiredAmount,
          available: availableAmount
        });
      }
    });
    
    return insufficientResources;
  }
  