import { JobResourceStatus } from './inventoryUtils';

export interface Resource {
  id: string;
  name: string;
  icon: string;
}

export interface Train {
  id: string;
  name: string;
  capacity: number;
  class: TrainClass;
  engine: TrainEngine;
}

export enum TrainEngine {
  Steam = 'steam',
  Diesel = 'diesel',
  Electric = 'electric',
}

export enum TrainClass {
  Common = 'common',
  Rare = 'rare',
  Epic = 'epic',
  Legendary = 'legendary',
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
  queueMaxSize: number;
  recipes: Recipe[];
}

export interface Destination {
  id: string;
  travelTime: number;
  resourceId: string;
  classes: TrainClass[];
}

export interface ResourceRequirement {
  resourceId: string;
  amount: number;
  delivered?: number;
}

export interface Warehouse {
  id: string;
  name: string;
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

export type PlannedStepType = 'factory' | 'destination' | 'delivery';

export interface PlannedStep {
  id: string;
  type: PlannedStepType;
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
  resourceStatus?: JobResourceStatus;
}

export interface PlanningLevel {
  level: number;
  startTime: number;
  endTime: number;
  steps: PlannedStep[];
  inventoryChanges: Map<string, number>;
  trainCount: number;
  description: string;
  estimatedTime: number;
  done: boolean;
}

export interface ProductionPlan {
  levels: PlanningLevel[];
  totalTime: number;
  maxConcurrentWorkers: number;
}

export interface Inventory {
  maxCapacity: number;
  inventory: Map<string, number>;
}
