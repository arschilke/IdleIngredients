export interface Resource {
  id: string;
  name: string;
}

export interface ResourceRequirement {
  resourceId: string;
  amount: number;
}

export interface Warehouse {
  id: string;
  name: string;
  inventory: Map<string, number>; // resourceId -> quantity
  maxCapacity: number;
}

export interface InventoryUpdate {
  resourceId: string;
  change: number; // positive for additions, negative for subtractions
  source: 'destination' | 'factory' | 'delivery' | 'order';
  timestamp: number;
}

// Base order interface
export interface BaseOrder {
  id: string;
  name: string;
  resources: ResourceRequirement[]; // Multiple resources per order
}

// Different order types
export interface BoatOrder extends BaseOrder {
  type: 'boat';
  expirationTime: number; // When the boat leaves
}

export interface StoryOrder extends BaseOrder {
  type: 'story';
  travelTime: number; // How long the story takes to complete
}

export interface BuildingOrder extends BaseOrder {
  type: 'building';
  // No additional properties for building orders
}

export type Order = BoatOrder | StoryOrder | BuildingOrder;

// Planning-focused production step
export interface PlannedStep {
  id: string;
  resourceId: string;
  resourceName: string;
  timeRequired: number;
  dependencies: string[]; // IDs of steps that must complete first
  stepType: 'destination' | 'factory' | 'delivery';
  level: number; // Which level this step runs in
  amountProcessed: number; // Amount to be processed
  workerId?: string; // Which worker is assigned (if applicable)
  recipe?: Recipe; // Selected recipe for this step
  destination?: Destination; // Selected destination for this step
  startTime?: number; // Calculated start time
  endTime?: number; // Calculated end time
}

// Planning level with inventory tracking
export interface PlanningLevel {
  level: number;
  steps: PlannedStep[];
  description: string;
  estimatedTime: number;
  inventoryChanges: Map<string, number>; // resourceId -> net change (+ or -)
  workerCount: number; // Number of workers needed
  isOverCapacity: boolean; // Whether this level exceeds max concurrent workers
}

// Planning-focused production plan
export interface ProductionPlan {
  levels: PlanningLevel[];
  totalTime: number;
  workerAssignments: Map<string, string>; // stepId -> workerId
  maxConcurrentWorkers: number;
  inventorySnapshot: Map<string, number>; // Current inventory state
}

export interface Recipe {
  resourceId: string;
  timeRequired: number;
  requires: ResourceRequirement[]; // What resources are needed to produce this
  outputAmount?: number; // How many units are produced per craft
}

export interface Factory {
  id: string;
  name: string;
  currentTask?: string; // ID of current production step
  availableAt: number; // Time when factory becomes available
  queue: PlannedStep[]; // Queue of production steps
  queueMaxSize: number; // Length of the queue
  recipes: Recipe[]
}

export interface Worker {
  id: string;
  name: string;
  currentTask?: string; // ID of current production step
  availableAt: number; // Time when worker becomes available
  capacity: number;
}

// Simplified recipe tree for planning
export interface RecipeTreeNode {
  resourceId: string;
  resourceName: string;
  requiredAmount: number;
  availableRecipes: Recipe[];
  availableDestinations: Destination[];
  selectedRecipe?: Recipe;
  selectedDestination?: Destination;
  craftsRequired: number;
  totalTime: number;
  children: RecipeTreeNode[];
}

export interface Destination {
  id: string, 
  travelTime: number,
  resourceId: string
}

export interface GameState {
  resources: Resource[];
  workers: Worker[];
  orders: Order[];
  warehouses: Warehouse[];
  factories: Factory[];
  destinations: Destination[];
}