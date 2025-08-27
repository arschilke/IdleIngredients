import {
  Resource,
  Order,
  Worker,
  ProductionStep,
  ProductionPlan,
  TimelineEvent,
  Factory,
  ResourceRequirement,
  Destination,
  Recipe,
  RecipeTreeNode,
  ProductionLevel,
  Warehouse,
  InventoryUpdate
} from './types';

export class ProductionCalculator {
  private resources: Map<string, Resource>;
  private workers: Worker[];
  private factories: Factory[];
  private destinations: Destination[];
  private warehouses: Warehouse[];

  constructor(
    resources: Resource[], 
    workers: Worker[], 
    factories: Factory[], 
    destinations: Destination[],
    warehouses: Warehouse[]
  ) {
    this.resources = new Map(resources.map(r => [r.id, r]));
    this.workers = [...workers];
    this.factories = [...factories];
    this.destinations = [...destinations];
    this.warehouses = [...warehouses];
  }

  /**
   * Calculate the optimal production plan using a level-based system
   */
  calculateProductionPlan(order: Order): ProductionPlan {
    const MAX_CONCURRENT_WORKERS = 5;
    
    // Build recipe tree for the requested resource
    const recipeTree = this.buildRecipeTree(order.resourceId, order.amount);
    
    // Analyze the tree to get production requirements
    const analysis = this.analyzeRecipeTree(recipeTree);
    
    // Create production levels
    const levels = this.createProductionLevels(analysis, order, MAX_CONCURRENT_WORKERS);
    
    // Optimize worker assignments across all levels
    const workerAssignments = this.optimizeWorkerAssignmentsAcrossLevels(levels, MAX_CONCURRENT_WORKERS);
    
    // Calculate timeline and warehouse updates
    const { timeline, warehouseUpdates } = this.calculateTimelineAndInventory(levels, workerAssignments, order);
    
    // Calculate total time
    const totalTime = Math.max(...levels.map(level => 
      Math.max(...level.steps.map(step => step.endTime || 0))
    ));
    
    return {
      levels,
      totalTime,
      workerAssignments,
      timeline,
      maxConcurrentWorkers: MAX_CONCURRENT_WORKERS,
      warehouseUpdates
    };
  }

  /**
   * Builds a recipe tree to determine the best recipes for producing required resources
   */
  buildRecipeTree(resourceId: string, requiredAmount: number, visited: Set<string> = new Set()): RecipeTreeNode {
    // Prevent circular dependencies
    if (visited.has(resourceId)) {
      throw new Error(`Circular dependency detected for resource: ${resourceId}`);
    }
    visited.add(resourceId);

    // Get the resource name
    const resource = this.resources.get(resourceId);
    const resourceName = resource?.name || resourceId;

    // Find all recipes that can produce this resource from both factories and destinations
    const recipes: Recipe[] = [];
    
    // Search factories for recipes
    for (const factory of this.factories) {
      for (const recipe of factory.recipes) {
        if (recipe.resourceId === resourceId) {
          recipes.push(recipe);
        }
      }
    }
    
    // Search destinations for recipes (base resource gathering)
    for (const destination of this.destinations) {
      if (destination.resourceId === resourceId) {
        // Calculate total worker capacity for this destination
        let totalCapacity = 0;
        for (const worker of this.workers) {
          totalCapacity += worker.capacity;
        }
        
        // Create a recipe-like structure for destinations
        const destinationRecipe: Recipe = {
          resourceId: destination.resourceId,
          timeRequired: destination.travelTime,
          requires: [], // Destinations don't require other resources
          outputAmount: totalCapacity // Use total worker capacity as output amount per trip
        };
        recipes.push(destinationRecipe);
      }
    }

    // Calculate crafts required and total time for the best recipe
    let selectedRecipe: Recipe | null = null;
    let craftsRequired = 0;
    let totalTime = 0;

    if (recipes.length > 0) {
      // Select the best recipe (for now, just pick the first one)
      // In a more sophisticated version, you could compare recipes based on efficiency
      selectedRecipe = recipes[0];
      craftsRequired = Math.ceil(requiredAmount / (selectedRecipe.outputAmount || 1));
      totalTime = selectedRecipe.timeRequired * craftsRequired;
    }

    // Build child nodes for required ingredients
    const children: RecipeTreeNode[] = [];
    if (selectedRecipe && selectedRecipe.requires.length > 0) {
      for (const requirement of selectedRecipe.requires) {
        const childRequiredAmount = requirement.amount * craftsRequired;
        try {
          const childNode = this.buildRecipeTree(requirement.resourceId, childRequiredAmount, new Set(visited));
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
      resourceName,
      requiredAmount,
      recipes,
      selectedRecipe,
      craftsRequired,
      totalTime,
      children,
      isBaseResource: false // All resources now have recipes (either from factories or destinations)
    };
  }

  /**
   * Analyzes a recipe tree to find the optimal production path
   */
  analyzeRecipeTree(tree: RecipeTreeNode): {
    totalTime: number;
    totalCrafts: number;
    baseResources: Map<string, number>;
    productionSteps: Array<{
      resourceId: string;
      resourceName: string;
      amount: number;
      crafts: number;
      time: number;
      recipe: Recipe | null;
    }>;
    optimizationSuggestions: string[];
  } {
    const baseResources = new Map<string, number>();
    const productionSteps: Array<{
      resourceId: string;
      resourceName: string;
      amount: number;
      crafts: number;
      time: number;
      recipe: Recipe | null;
    }> = [];
    const optimizationSuggestions: string[] = [];

    // Recursive function to analyze the tree
    const analyzeNode = (node: RecipeTreeNode, level: number = 0): number => {
      let maxChildTime = 0;

      // Analyze children first (dependencies)
      for (const child of node.children) {
        const childTime = analyzeNode(child, level + 1);
        maxChildTime = Math.max(maxChildTime, childTime);
      }

      // Add this node to production steps
      if (node.selectedRecipe) {
        // Check if this is a destination recipe (no requirements = base resource)
        const isDestination = node.selectedRecipe.requires.length === 0;
        
        productionSteps.push({
          resourceId: node.resourceId,
          resourceName: node.resourceName,
          amount: node.requiredAmount,
          crafts: node.craftsRequired,
          time: node.totalTime,
          recipe: node.selectedRecipe
        });
        
        // Track destination resources (base resources) separately
        if (isDestination) {
          const current = baseResources.get(node.resourceId) || 0;
          baseResources.set(node.resourceId, current + node.requiredAmount);
        }
      }

      // Return the total time for this branch (including dependencies)
      return maxChildTime + node.totalTime;
    };

    const totalTime = analyzeNode(tree);
    const totalCrafts = productionSteps.reduce((sum, step) => sum + step.crafts, 0);

    // Generate optimization suggestions
    if (totalTime > 0) {
      // Find steps that could be parallelized
      const parallelizableSteps = productionSteps.filter(step => step.time > 0);
      if (parallelizableSteps.length > 1) {
        optimizationSuggestions.push(
          `Consider parallelizing production of ${parallelizableSteps.length} different resources to reduce total time.`
        );
      }

      // Find the most time-consuming step
      const longestStep = productionSteps.reduce((longest, current) => 
        current.time > longest.time ? current : longest
      );
      if (longestStep) {
        const stepType = longestStep.recipe?.requires.length === 0 ? 'gathering' : 'production';
        optimizationSuggestions.push(
          `${longestStep.resourceName} ${stepType} takes the longest (${ProductionCalculator.formatTime(longestStep.time)}). Consider optimizing this process.`
        );
      }

      // Check for destination resource bottlenecks
      for (const [resourceId, amount] of baseResources) {
        if (amount > 100) { // Arbitrary threshold
          optimizationSuggestions.push(
            `High requirement for ${resourceId} (${amount} units). Consider bulk gathering or alternative sources.`
          );
        }
      }
      
      // Check for factory production bottlenecks
      const factorySteps = productionSteps.filter(step => step.recipe && step.recipe.requires.length > 0);
      if (factorySteps.length > 0) {
        const totalFactoryTime = factorySteps.reduce((sum, step) => sum + step.time, 0);
        optimizationSuggestions.push(
          `Factory production time: ${ProductionCalculator.formatTime(totalFactoryTime)}. Consider upgrading factories or adding more workers.`
        );
      }
    }

    return {
      totalTime,
      totalCrafts,
      baseResources,
      productionSteps,
      optimizationSuggestions
    };
  }

  /**
   * Create production levels that organize steps for optimal concurrent execution
   */
  private createProductionLevels(analysis: any, order: Order, maxConcurrentWorkers: number): ProductionLevel[] {
    const levels: ProductionLevel[] = [];
    
    // Level 1: Base resource gathering (destinations)
    const destinationSteps: ProductionStep[] = [];
    for (const [resourceId, amount] of analysis.baseResources) {
      const destination = this.destinations.find(d => d.resourceId === resourceId);
      if (destination) {
        const step: ProductionStep = {
          id: `destination_${resourceId}`,
          resourceId: resourceId,
          timeRequired: destination.travelTime,
          dependencies: [],
          stepType: 'destination',
          level: 1,
          amountProcessed: 0 // Will be calculated based on worker capacity
        };
        destinationSteps.push(step);
      }
    }
    
    if (destinationSteps.length > 0) {
      levels.push({
        level: 1,
        steps: destinationSteps,
        description: `Gather base resources: ${destinationSteps.map(s => s.resourceId).join(', ')}`,
        estimatedTime: Math.max(...destinationSteps.map(s => s.timeRequired))
      });
    }
    
    // Level 2: Factory production
    const factorySteps: ProductionStep[] = [];
    for (const step of analysis.productionSteps) {
      if (step.recipe && step.recipe.requires.length > 0) {
        const factoryStep: ProductionStep = {
          id: `factory_${step.resourceId}`,
          resourceId: step.resourceId,
          timeRequired: step.time,
          dependencies: step.recipe.requires.map((req: ResourceRequirement) => `destination_${req.resourceId}`),
          stepType: 'factory',
          level: 2,
          amountProcessed: 0 // Will be calculated based on worker capacity
        };
        factorySteps.push(factoryStep);
      }
    }
    
    if (factorySteps.length > 0) {
      levels.push({
        level: 2,
        steps: factorySteps,
        description: `Produce resources in factories: ${factorySteps.map(s => s.resourceId).join(', ')}`,
        estimatedTime: Math.max(...factorySteps.map(s => s.timeRequired))
      });
    }
    
    // Level 3: Final delivery
    const deliveryStep: ProductionStep = {
      id: `delivery_${order.id}`,
      resourceId: 'delivery',
      timeRequired: order.amount, // 1 second per unit
      dependencies: factorySteps.length > 0 ? factorySteps.map(s => s.id) : destinationSteps.map(s => s.id),
      stepType: 'delivery',
      level: 3,
      amountProcessed: 0 // Will be calculated based on worker capacity
    };
    
    levels.push({
      level: 3,
      steps: [deliveryStep],
      description: `Deliver ${order.amount} ${order.resourceId} to complete order`,
      estimatedTime: deliveryStep.timeRequired
    });
    
    return levels;
  }

  /**
   * Optimize worker assignments across all levels
   */
  private optimizeWorkerAssignmentsAcrossLevels(levels: ProductionLevel[], maxConcurrentWorkers: number): Map<string, string> {
    const assignments = new Map<string, string>();
    const workerAvailability = new Map<string, number>();
    
    // Initialize worker availability
    for (const worker of this.workers) {
      workerAvailability.set(worker.id, worker.availableAt || 0);
    }
    
    // Process each level sequentially
    for (const level of levels) {
      const activeWorkers = new Set<string>();
      
      // Sort steps by time (longest first for better worker utilization)
      const sortedSteps = [...level.steps].sort((a, b) => b.timeRequired - a.timeRequired);
      
      for (const step of sortedSteps) {
        // Find the best available worker
        let bestWorker: Worker | null = null;
        let earliestStart = Infinity;
        
        for (const worker of this.workers) {
          const availableAt = workerAvailability.get(worker.id) || 0;
          const stepStartTime = Math.max(availableAt, this.getStepStartTime(step, assignments, workerAvailability, levels));
          
          // Check if we can assign this worker (respecting concurrent limit)
          const canAssign = !activeWorkers.has(worker.id) || activeWorkers.size < maxConcurrentWorkers;
          
          if (canAssign && stepStartTime < earliestStart) {
            earliestStart = stepStartTime;
            bestWorker = worker;
          }
        }
        
        if (bestWorker) {
          const workerId = bestWorker.id;
          const startTime = Math.max(
            workerAvailability.get(workerId) || 0,
            this.getStepStartTime(step, assignments, workerAvailability, levels)
          );
          
          const endTime = startTime + step.timeRequired;
          
          // Calculate amount processed based on worker capacity
          if (step.stepType === 'destination') {
            // For destinations, amount processed equals worker capacity
            step.amountProcessed = bestWorker.capacity;
          } else if (step.stepType === 'delivery') {
            // For delivery, amount processed equals order amount
            step.amountProcessed = step.timeRequired; // timeRequired is the order amount
          } else {
            // For factory steps, amount processed equals worker capacity
            step.amountProcessed = bestWorker.capacity;
          }
          
          // Update step timing
          step.startTime = startTime;
          step.endTime = endTime;
          step.workerId = workerId;
          
          // Update worker availability
          workerAvailability.set(workerId, endTime);
          
          // Track active workers for this level
          activeWorkers.add(workerId);
          
          // Record assignment
          assignments.set(step.id, workerId);
        }
      }
    }
    
    return assignments;
  }

  /**
   * Calculate when a step can start based on its dependencies
   */
  private getStepStartTime(
    step: ProductionStep,
    assignments: Map<string, string>,
    workerAvailability: Map<string, number>,
    levels: ProductionLevel[]
  ): number {
    if (step.dependencies.length === 0) {
      return 0;
    }
    
    let maxDependencyEndTime = 0;
    for (const depId of step.dependencies) {
      // Find the step that produces this dependency
      for (const [stepId, workerId] of assignments) {
        if (stepId === depId) {
          // This is a dependency step, find its end time
          const depStep = this.findStepById(stepId, levels);
          if (depStep && depStep.endTime) {
            maxDependencyEndTime = Math.max(maxDependencyEndTime, depStep.endTime);
          }
          break;
        }
      }
    }
    
    return maxDependencyEndTime;
  }

  /**
   * Find a step by ID across all levels
   */
  private findStepById(stepId: string, levels: ProductionLevel[]): ProductionStep | null {
    for (const level of levels) {
      const step = level.steps.find((s: ProductionStep) => s.id === stepId);
      if (step) return step;
    }
    return null;
  }

  /**
   * Calculate timeline and warehouse inventory updates
   */
  private calculateTimelineAndInventory(
    levels: ProductionLevel[], 
    assignments: Map<string, string>, 
    order: Order
  ): { timeline: TimelineEvent[], warehouseUpdates: InventoryUpdate[] } {
    const events: TimelineEvent[] = [];
    const warehouseUpdates: InventoryUpdate[] = [];
    const timestamp = Date.now();
    
    for (const level of levels) {
      for (const step of level.steps) {
        const workerId = assignments.get(step.id);
        const worker = this.workers.find(w => w.id === workerId);
        
        if (step.startTime !== undefined && step.endTime !== undefined) {
          // Start event
          events.push({
            time: step.startTime,
            type: 'start',
            stepId: step.id,
            resourceName: step.resourceId,
            workerName: worker?.name,
            description: `Start ${step.stepType} for ${step.resourceId}`,
            inventoryChange: undefined
          });
          
          // Complete event with inventory changes
          let inventoryChange = 0;
          
          if (step.stepType === 'destination') {
            // Add resources to warehouse from destination
            inventoryChange = step.amountProcessed;
            warehouseUpdates.push({
              resourceId: step.resourceId,
              change: inventoryChange,
              source: 'destination',
              timestamp: timestamp + step.endTime * 1000 // Convert to milliseconds
            });
          } else if (step.stepType === 'factory') {
            // Add produced resources to warehouse
            inventoryChange = step.amountProcessed;
            warehouseUpdates.push({
              resourceId: step.resourceId,
              change: inventoryChange,
              source: 'factory',
              timestamp: timestamp + step.endTime * 1000
            });
          } else if (step.stepType === 'delivery') {
            // Remove resources from warehouse for delivery
            inventoryChange = -step.amountProcessed;
            warehouseUpdates.push({
              resourceId: order.resourceId,
              change: inventoryChange,
              source: 'delivery',
              timestamp: timestamp + step.endTime * 1000
            });
          }
          
          events.push({
            time: step.endTime,
            type: 'complete',
            stepId: step.id,
            resourceName: step.resourceId,
            workerName: worker?.name,
            description: `Completed ${step.stepType} for ${step.resourceId}`,
            inventoryChange: inventoryChange
          });
        }
      }
    }
    
    // Sort by time
    const sortedEvents = events.sort((a, b) => a.time - b.time);
    const sortedUpdates = warehouseUpdates.sort((a, b) => a.timestamp - b.timestamp);
    
    return { timeline: sortedEvents, warehouseUpdates: sortedUpdates };
  }

  // Helper method to format time
  static formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  /**
   * Get current warehouse inventory for a resource
   */
  getWarehouseInventory(resourceId: string): number {
    let totalInventory = 0;
    for (const warehouse of this.warehouses) {
      totalInventory += warehouse.inventory.get(resourceId) || 0;
    }
    return totalInventory;
  }

  /**
   * Update warehouse inventory
   */
  updateWarehouseInventory(resourceId: string, change: number, warehouseId?: string): void {
    if (warehouseId) {
      // Update specific warehouse
      const warehouse = this.warehouses.find(w => w.id === warehouseId);
      if (warehouse) {
        const current = warehouse.inventory.get(resourceId) || 0;
        warehouse.inventory.set(resourceId, Math.max(0, current + change));
      }
    } else {
      // Update first available warehouse
      for (const warehouse of this.warehouses) {
        const current = warehouse.inventory.get(resourceId) || 0;
        const newAmount = Math.max(0, current + change);
        warehouse.inventory.set(resourceId, newAmount);
        break; // Only update first warehouse for now
      }
    }
  }
}
