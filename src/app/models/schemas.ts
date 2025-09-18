import { z } from 'zod';
import { StepType, TrainClass, Country, TrainEngine, OrderType } from './types';

export const resourceSchema = z.object({
  id: z.string().max(100),
  name: z.string(),
  icon: z.string(),
});

export const resourceRequirementSchema = z.object({
  resourceId: z.string(),
  amount: z.number(),
  delivered: z.number().optional(),
});

// Form schema for OrderForm - flat structure with all fields
export const orderSchema = z.object({
  id: z.string(),
  type: z.enum(Object.values(OrderType) as [string, ...string[]]),
  name: z.string(),
  resources: z.array(resourceRequirementSchema),
  expirationTime: z.number().optional(),
  travelTime: z.number().optional(),
  classes: z.array(z.enum(Object.values(TrainClass) as [string, ...string[]])).optional(),
  countries: z.array(z.enum(Object.values(Country) as [string, ...string[]])).optional(),
});

export const recipeSchema = z.object({
  factoryId: z.string(),
  resourceId: z.string(),
  timeRequired: z.number(),
  outputAmount: z.number(),
  requires: z.array(resourceRequirementSchema),
});

export const factorySchema = z.object({
  id: z.string(),
  queueMaxSize: z.number(),
  name: z.string(),
  recipes: z.array(recipeSchema),
});

export const destinationSchema = z.object({
  id: z.string(),
  name: z.string(),
  travelTime: z.number(),
  resourceId: z.string(),
  classes: z.array(z.enum(Object.values(TrainClass) as [string, ...string[]])),
  country: z.enum(Object.values(Country) as [string, ...string[]]),
});

export const stepSchema = z.object({
  id: z.string(),
  type: z.enum(Object.values(StepType) as [string, ...string[]]),
  name: z.string(),
  resourceId: z.string(),
  levelId: z.number(),
  timeRequired: z.number(),
  trainId: z.string().optional(),
  orderId: z.string().optional(),
});

export const levelSchema = z.object({
  level: z.number(),
  done: z.boolean(),
  steps: z.array(stepSchema),
  inventoryChanges: z.map(z.string(), z.number()),
});

export const productionPlanSchema = z.object({
  id: z.string(),
  maxConcurrentWorkers: z.number(),
  totalTime: z.number(),
  levels: z.record(z.number(), levelSchema),
});

export const trainSchema = z.object({
  id: z.string(),
  name: z.string(),
  capacity: z.number(),
  class: z.enum(Object.values(TrainClass) as [string, ...string[]]),
  engine: z.enum(Object.values(TrainEngine) as [string, ...string[]]),
  country: z.enum(Object.values(Country) as [string, ...string[]]),
});
