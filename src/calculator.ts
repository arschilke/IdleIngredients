import {
  Order,
  PlannedStep,
  ProductionPlan,
  Recipe,
  RecipeTreeNode,
  PlanningLevel,
  GameState
} from './types';

export class ProductionCalculator {
  private gameState: GameState;

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  /**
   * Builds a recipe tree showing all available options for producing required resources
   */
  buildRecipeTree(order: Order): RecipeTreeNode[] {
    const trees: RecipeTreeNode[] = [];
    
    for (const resourceReq of order.resources) {
      const tree = this.buildResourceTree(resourceReq.resourceId, resourceReq.amount);
      trees.push(tree);
    }
    
    return trees;
  }

  /**
   * Builds a recipe tree for a single resource
   */
  private buildResourceTree(resourceId: string, requiredAmount: number, visited: Set<string> = new Set()): RecipeTreeNode {
    // Prevent circular dependencies
    if (visited.has(resourceId)) {
      throw new Error(`Circular dependency detected for resource: ${resourceId}`);
    }
    visited.add(resourceId);

    // Find all available recipes and destinations
    const availableRecipes: Recipe[] = [];
    const availableDestinations: any[] = [];
    
    // Search factories for recipes
    for (const factory of this.gameState.factories) {
      for (const recipe of factory.recipes) {
        if (recipe.resourceId === resourceId) {
          availableRecipes.push(recipe);
        }
      }
    }
    
    // Search destinations
    for (const destination of this.gameState.destinations) {
      if (destination.resourceId === resourceId) {
        availableDestinations.push(destination);
      }
    }

    // Build child nodes for required ingredients
    const children: RecipeTreeNode[] = [];
    // For now, we'll build children for the first recipe if available
    if (availableRecipes.length > 0) {
      const firstRecipe = availableRecipes[0];
      for (const requirement of firstRecipe.requires) {
        const childRequiredAmount = requirement.amount * Math.ceil(requiredAmount / (firstRecipe.outputAmount || 1));
        try {
          const childNode = this.buildResourceTree(requirement.resourceId, childRequiredAmount, new Set(visited));
          children.push(childNode);
        } catch (error) {
          console.warn(`Could not build tree for ${requirement.resourceId}:`, error);
        }
      }
    }

    // Remove from visited set when backtracking
    visited.delete(resourceId);

    return {
      resourceId,
      requiredAmount,
      availableRecipes,
      availableDestinations,
      children
    };
  }

  /**
   * Creates a production plan from selected recipes and destinations
   */
  createProductionPlan(_order: Order, selectedSteps: PlannedStep[]): ProductionPlan {
    const MAX_CONCURRENT_WORKERS = 5;
    
    // Group steps by level
    const levels = this.createPlanningLevels(selectedSteps, MAX_CONCURRENT_WORKERS);
    
    // Calculate inventory changes for each level
    this.calculateInventoryChanges(levels);
    
    // Calculate timing
    this.calculateTiming(levels);
    
    // Calculate total time
    const totalTime = Math.max(...levels.map(level => level.estimatedTime));
    
    return {
      levels,
      totalTime,
      maxConcurrentWorkers: MAX_CONCURRENT_WORKERS,
      inventorySnapshot: this.getCurrentInventory(),
      activeLevel: 1
    };
  }

  /**
   * Creates planning levels from selected steps
   */
  private createPlanningLevels(steps: PlannedStep[], maxConcurrentWorkers: number): PlanningLevel[] {
    const levels = new Map<number, PlannedStep[]>();
    
    // Group steps by level
    for (const step of steps) {
      if (!levels.has(step.level)) {
        levels.set(step.level, []);
      }
      levels.get(step.level)!.push(step);
    }
    
    // Convert to PlanningLevel array
    const planningLevels: PlanningLevel[] = [];
    for (const [levelNum, levelSteps] of levels) {
      const workerCount = this.countWorkersNeeded(levelSteps);
      const isOverCapacity = workerCount > maxConcurrentWorkers;
      
      planningLevels.push({
        level: levelNum,
        steps: levelSteps,
        description: this.generateLevelDescription(levelSteps),
        estimatedTime: this.calculateLevelTime(levelSteps),
        inventoryChanges: new Map(),
        trainCount: workerCount,
        isOverCapacity,
        done: false,
        startTime: 0,
        endTime: 0
      });
    }
    
    // Sort by level number
    return planningLevels.sort((a, b) => a.level - b.level);
  }

  /**
   * Counts how many workers are needed for a level
   */
  private countWorkersNeeded(steps: PlannedStep[]): number {
    let workerCount = 0;
    
    for (const step of steps) {
      if (step.type === 'destination') {
        // Destinations need workers
        workerCount++;
      }
      // Factories don't need workers
    }
    
    return workerCount;
  }

  /**
   * Generates a description for a planning level
   */
  private generateLevelDescription(steps: PlannedStep[]): string {
    const destinationCount = steps.filter(s => s.type === 'destination').length;
    const factoryCount = steps.filter(s => s.type === 'factory').length;
    
    if (destinationCount > 0 && factoryCount > 0) {
      return `${destinationCount} gathering, ${factoryCount} production`;
    } else if (destinationCount > 0) {
      return `${destinationCount} gathering`;
    } else if (factoryCount > 0) {
      return `${factoryCount} production`;
    }
    return 'Planning';
  }

  /**
   * Calculates the estimated time for a level
   */
  private calculateLevelTime(steps: PlannedStep[]): number {
    if (steps.length === 0) return 0;
    
    // For now, return the maximum time of any step in the level
    // In a more sophisticated version, you could account for parallel execution
    return Math.max(...steps.map(step => step.timeRequired));
  }

  /**
   * Calculates inventory changes for each level
   */
  private calculateInventoryChanges(levels: PlanningLevel[]): void {
    let currentInventory = this.getCurrentInventory();
    
    for (const level of levels) {
      const levelChanges = new Map<string, number>();
      
      for (const step of level.steps) {
        // Calculate what this step produces or consumes
        if (step.type === 'destination') {
          // Destinations produce resources
          const current = levelChanges.get(step.resourceId) || 0;
          levelChanges.set(step.resourceId, current + step.amountProcessed);
        } else if (step.type === 'factory' && step.recipe) {
          // Factories consume inputs and produce outputs
          // Consume inputs
          for (const requirement of step.recipe.requires) {
            const current = levelChanges.get(requirement.resourceId) || 0;
            levelChanges.set(requirement.resourceId, current - requirement.amount);
          }
          
          // Produce output
          const current = levelChanges.get(step.resourceId) || 0;
          levelChanges.set(step.resourceId, current + (step.recipe.outputAmount || 0));
        }
      }
      
      level.inventoryChanges = levelChanges;
      
      // Update current inventory for next level
      for (const [resourceId, change] of levelChanges) {
        const current = currentInventory.get(resourceId) || 0;
        currentInventory.set(resourceId, current + change);
      }
    }
  }

  /**
   * Calculates timing for each level
   */
  private calculateTiming(levels: PlanningLevel[]): void {
    let currentTime = 0;
    
    for (const level of levels) {
      // Set start time for all steps in this level
      for (const step of level.steps) {
        step.startTime = currentTime;
        step.endTime = currentTime + step.timeRequired;
      }
      
      // Move to next level
      currentTime += level.estimatedTime;
    }
  }

  /**
   * Gets current inventory across all warehouses
   */
  private getCurrentInventory(): Map<string, number> {
    const inventory = new Map<string, number>();
    
    // Use the single warehouse from gameState
    for (const [resourceId, amount] of this.gameState.warehouse.inventory) {
      const current = inventory.get(resourceId) || 0;
      inventory.set(resourceId, current + amount);
    }
    
    return inventory;
  }

  /**
   * Validates if a production plan is feasible
   */
  validateProductionPlan(plan: ProductionPlan): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check for over-capacity levels
    for (const level of plan.levels) {
      if (level.isOverCapacity) {
        errors.push(`Level ${level.level} requires ${level.trainCount} workers but only ${plan.maxConcurrentWorkers} are available`);
      }
    }
    
    // Check for negative inventory
    for (const level of plan.levels) {
      for (const [resourceId, change] of level.inventoryChanges) {
        const currentInventory = this.getCurrentInventory();
        const current = currentInventory.get(resourceId) || 0;
        if (current + change < 0) {
          errors.push(`Insufficient ${resourceId} at level ${level.level}: need ${Math.abs(change)} but only have ${current}`);
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Moves a step to a different level
   */
  moveStepToLevel(stepId: string, fromLevel: number, toLevel: number, plan: ProductionPlan): ProductionPlan {
    const step = plan.levels
      .flatMap(level => level.steps)
      .find(s => s.id === stepId);
    
    if (!step) {
      throw new Error(`Step ${stepId} not found`);
    }
    
    // Remove from old level
    const fromLevelIndex = plan.levels.findIndex(level => level.level === fromLevel);
    if (fromLevelIndex !== -1) {
      plan.levels[fromLevelIndex].steps = plan.levels[fromLevelIndex].steps.filter(s => s.id !== stepId);
    }
    
    // Add to new level
    const toLevelIndex = plan.levels.findIndex(level => level.level === toLevel);
    if (toLevelIndex !== -1) {
      step.level = toLevel;
      plan.levels[toLevelIndex].steps.push(step);
    }
    
    // Recalculate the plan
    return this.createProductionPlan({} as Order, plan.levels.flatMap(level => level.steps));
  }

  /**
   * Adds a new step to a level
   */
  addStepToLevel(step: PlannedStep, level: number, plan: ProductionPlan): ProductionPlan {
    const levelIndex = plan.levels.findIndex(l => l.level === level);
    if (levelIndex === -1) {
      // Create new level if it doesn't exist
      plan.levels.push({
        level,
        steps: [step],
        description: this.generateLevelDescription([step]),
        estimatedTime: step.timeRequired,
        inventoryChanges: new Map(),
        trainCount: this.countWorkersNeeded([step]),
        isOverCapacity: false,
        done: false,
        startTime: 0,
        endTime: 0
      });
    } else {
      plan.levels[levelIndex].steps.push(step);
    }
    
    // Recalculate the plan
    return this.createProductionPlan({} as Order, plan.levels.flatMap(level => level.steps));
  }

  /**
   * Removes a step from a level
   */
  removeStepFromLevel(stepId: string, level: number, plan: ProductionPlan): ProductionPlan {
    const levelIndex = plan.levels.findIndex(l => l.level === level);
    if (levelIndex !== -1) {
      plan.levels[levelIndex].steps = plan.levels[levelIndex].steps.filter(s => s.id !== stepId);
      
      // Remove empty levels
      if (plan.levels[levelIndex].steps.length === 0) {
        plan.levels.splice(levelIndex, 1);
      }
    }
    
    // Recalculate the plan
    return this.createProductionPlan({} as Order, plan.levels.flatMap(level => level.steps));
  }
}
