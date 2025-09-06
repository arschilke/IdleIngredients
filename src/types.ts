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

export type Step = FactoryStep | DestinationStep | DeliveryStep | SubmitStep;

export interface BaseStep {
  type: 'factory' | 'destination' | 'delivery' | 'submit';
  id: string;
  resourceId: string;
  levelId: number;
  timeRequired: number;
}

export interface FactoryStep extends BaseStep {
  type: 'factory';
  recipe: Recipe;
}

export interface DestinationStep extends BaseStep {
  type: 'destination';
  destination: Destination;
  trainId: string;
}

export interface DeliveryStep extends BaseStep {
  type: 'delivery';
  order: StoryOrder;
  trainId: string;
}

export interface SubmitStep extends BaseStep {
  type: 'submit';
  order: BoatOrder | BuildingOrder;
  timeRequired: 0;
}

export interface PlanningLevel {
  level: number;
  steps: Step[];
  inventoryChanges: Map<string, number>;
  done: boolean;
}

export interface ProductionPlan {
  levels: Record<number, PlanningLevel>;
  totalTime: number;
  maxConcurrentWorkers: number;
}

export interface Inventory {
  [resourceId: string]: number;
}
