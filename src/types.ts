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

export interface Order {
  id: string;
  name: string;
  resourceId: string;
  amount: number;
}

export interface ProductionStep {
  id: string;
  resourceId: string;
  timeRequired: number;
  dependencies: string[]; // IDs of steps that must complete first
  startTime?: number; // When this step starts
  endTime?: number; // When this step completes
  workerId?: string; // Which worker is assigned to this step
  stepType: 'destination' | 'factory' | 'delivery';
  level: number; // Which level this step runs in
  amountProcessed: number; // Actual amount processed based on worker capacity
}

export interface DeliveryStep extends ProductionStep {
  orderId: string;
  orderName: string;
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
  queue: ProductionStep[]; // Queue of production steps
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

export interface RecipeTreeNode {
  resourceId: string;
  resourceName: string;
  requiredAmount: number;
  recipes: Recipe[];
  selectedRecipe: Recipe | null;
  craftsRequired: number;
  totalTime: number;
  children: RecipeTreeNode[];
  isBaseResource: boolean;
}

export interface ProductionLevel {
  level: number;
  steps: ProductionStep[];
  description: string;
  estimatedTime: number;
}

export interface ProductionPlan {
  levels: ProductionLevel[];
  totalTime: number;
  workerAssignments: Map<string, string>; // stepId -> workerId
  timeline: TimelineEvent[];
  maxConcurrentWorkers: number;
  warehouseUpdates: InventoryUpdate[];
}

export interface TimelineEvent {
  time: number;
  type: 'start' | 'complete';
  stepId: string;
  resourceName: string;
  workerName?: string;
  description: string;
  inventoryChange?: number;
}

export interface GameState {
  resources: Resource[];
  workers: Worker[];
  orders: Order[];
  warehouses: Warehouse[];
}

export interface Destination {
  id: string, 
  travelTime: number,
  resourceId: string
}