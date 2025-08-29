export interface Resource {
  id: string;
  name: string;
}

export interface Train {
  id: string;
  name: string;
  capacity: number;
  availableAt: number;
  class: TrainClass; 
}

export interface Recipe {
  resourceId: string;
  timeRequired: number;
  requires: ResourceRequirement[];
  outputAmount: number;
}

export interface Factory {
  id: string;
  name: string;
  availableAt: number;
  queue: PlannedStep[];
  queueMaxSize: number;
  recipes: Recipe[];
}

export interface Destination {
  id: string;
  travelTime: number;
  resourceId: string;
  classes: TrainClass[];
}
export type TrainClass = 'common' | 'rare' | 'epic' | 'legendary';

export interface ResourceRequirement {
  resourceId: string;
  amount: number;
}

export interface Warehouse {
  maxCapacity: number;
  inventory: Map<string, number>;
}

export interface BaseOrder {
  id: string;
  name: string;
  resources: ResourceRequirement[];
}

export interface BoatOrder extends BaseOrder {
  type: 'boat';
  expirationTime: number;
}

export interface StoryOrder extends BaseOrder {
  type: 'story';
  travelTime: number;
}

export interface BuildingOrder extends BaseOrder {
  type: 'building';
}

export type Order = BoatOrder | StoryOrder | BuildingOrder;

export interface PlannedStep {
  id: string;
  type: 'factory' | 'destination' | 'delivery';
  stepType: 'factory' | 'destination' | 'delivery';
  resourceName: string;
  resourceId: string;
  level: number;
  timeRequired: number;
  amountProcessed: number;
  dependencies: string[];
  recipe?: Recipe;
  destination?: Destination;
  startTime?: number;
  endTime?: number;
  trainId?: string;
  order?: Order; // For delivery jobs
}

export interface PlanningLevel {
  level: number;
  steps: PlannedStep[];
  inventoryChanges: Map<string, number>;
  workerCount: number;
  isOverCapacity: boolean;
  description: string;
  estimatedTime: number;
  done: boolean;
}

export interface ProductionPlan {
  levels: PlanningLevel[];
  totalTime: number;
  workerAssignments: Map<string, string>;
  maxConcurrentWorkers: number;
  inventorySnapshot: Map<string, number>;
  activeLevel: number;
}

export interface RecipeTreeNode {
  resourceId: string;
  requiredAmount: number;
  availableRecipes: Recipe[];
  selectedRecipe?: Recipe;
  availableDestinations: Destination[];
  selectedDestination?: Destination;
  children: RecipeTreeNode[];
}

export interface GameState {
  resources: Resource[];
  trains: Train[];
  orders: Order[];
  warehouse: Warehouse;
  factories: Factory[];
  destinations: Destination[];
}