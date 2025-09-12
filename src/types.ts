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
  country: Country;
}

export enum Country {
  Britain = 'britain',
  Germany = 'germany',
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
  factoryId: string;
}

export interface Factory {
  id: string;
  name: string;
  queueMaxSize: number;
  recipes: Recipe[];
}

export interface Destination {
  id: string;
  name: string;
  travelTime: number;
  resourceId: string;
  classes: TrainClass[];
  country: Country;
}

export interface ResourceRequirement {
  resourceId: string;
  amount: number;
  delivered?: number;
}

export interface BaseOrder {
  id: string;
  name: string;
  type: 'boat' | 'story' | 'building';
  resources: ResourceRequirement[];
}

export interface BoatOrder extends BaseOrder {
  type: 'boat';
  expirationTime: number;
}

export interface StoryOrder extends BaseOrder {
  type: 'story';
  travelTime: number;
  classes: TrainClass[];
  country?: Country;
}

export interface BuildingOrder extends BaseOrder {
  type: 'building';
}

export type Order = BoatOrder | StoryOrder | BuildingOrder;

export type Step = FactoryStep | DestinationStep | DeliveryStep | SubmitStep;

export interface BaseStep {
  type: StepType;
  id: string;
  resourceId: string;
  levelId: number;
  timeRequired: number;
}

export interface FactoryStep extends BaseStep {
  type: StepType.Factory;
}

export interface DestinationStep extends BaseStep {
  type: StepType.Destination;
  trainId: string;
}

export interface DeliveryStep extends BaseStep {
  type: StepType.Delivery;
  orderId: string;
  trainId: string;
}

export interface SubmitStep extends BaseStep {
  type: StepType.Submit;
  orderId: string;
}

export enum StepType {
  Factory = 'factory',
  Destination = 'destination',
  Delivery = 'delivery',
  Submit = 'submit',
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
