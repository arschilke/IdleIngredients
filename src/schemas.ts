import { z } from 'zod';
import { StepType, TrainClass, Country, TrainEngine, OrderType } from './types';

export const resourceSchema = z.object({
  id: z.string().max(100),
  name: z.string(),
  icon: z.string(),
});

export const resourceDbSchema = {
  title: 'resource schema',
  version: 0,
  description: 'describes a simple resource',
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100,
    },
    name: {
      type: 'string',
    },
    icon: {
      type: 'string',
    },
  },
  required: ['id', 'name', 'icon'],
};

export const resourceRequirementSchema = z.object({
  resourceId: z.string(),
  amount: z.number(),
  delivered: z.number().optional(),
});

export const resourceRequirementDbSchema = {
  title: 'resource requirement schema',
  version: 0,
  description: 'describes a simple resource requirement',
  type: 'object',
  properties: {
    resourceId: {
      type: 'string',
    },
    amount: {
      type: 'number',
    },
    delivered: {
      type: 'number',
    },
  },
  required: ['resourceId', 'amount'],
};
// Form schema for OrderForm - flat structure with all fields
export const orderSchema = z.object({
  id: z.string(),
  type: z.enum(Object.values(OrderType)),
  name: z.string(),
  resources: z.array(resourceRequirementSchema),
  expirationTime: z.number().optional(),
  travelTime: z.number().optional(),
  classes: z.array(z.enum(TrainClass)).optional(),
  countries: z.array(z.enum(Country)).optional(),
});

export const orderDbSchema = {
  title: 'order schema',
  version: 0,
  description: 'describes a simple order',
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100,
    },
    type: {
      type: 'string',
    },
    name: {
      type: 'string',
    },
    resources: {
      type: 'array',
      items: resourceRequirementDbSchema,
    },
    expirationTime: {
      type: 'number',
    },
    travelTime: {
      type: 'number',
    },
    classes: {
      type: 'array',
      items: {
        enum: [Object.values(TrainClass)],
      },
    },
    countries: {
      type: 'array',
      items: {
        enum: [Object.values(Country)],
      },
    },
  },
  required: ['id', 'type', 'name', 'resources'],
};

export const recipeSchema = z.object({
  factoryId: z.string(),
  resourceId: z.string(),
  timeRequired: z.number(),
  outputAmount: z.number(),
  requires: z.array(resourceRequirementSchema),
});

export const recipeDbSchema = {
  title: 'recipe schema',
  version: 0,
  description: 'describes a simple recipe',
  type: 'object',
  properties: {
    factoryId: {
      type: 'string',
    },
    resourceId: {
      type: 'string',
    },
    timeRequired: {
      type: 'number',
    },
    outputAmount: {
      type: 'number',
    },
    requires: {
      type: 'array',
      items: resourceRequirementDbSchema,
    },
  },
  required: [
    'factoryId',
    'resourceId',
    'timeRequired',
    'outputAmount',
    'requires',
  ],
};

export const factorySchema = z.object({
  id: z.string(),
  queueMaxSize: z.number(),
  name: z.string(),
  recipes: z.array(recipeSchema),
});

export const factoryDbSchema = {
  title: 'factory schema',
  version: 0,
  description: 'describes a simple factory',
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100,
    },
    queueMaxSize: {
      type: 'number',
    },
    name: {
      type: 'string',
    },
    recipes: {
      type: 'array',
      items: recipeDbSchema,
    },
  },
  required: ['id', 'queueMaxSize', 'name', 'recipes'],
};

export const destinationSchema = z.object({
  id: z.string(),
  name: z.string(),
  travelTime: z.number(),
  resourceId: z.string(),
  classes: z.array(z.enum(TrainClass)),
  country: z.enum(Country),
});

export const destinationDbSchema = {
  title: 'destination schema',
  version: 0,
  description: 'describes a simple destination',
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100,
    },
    name: {
      type: 'string',
    },
    travelTime: {
      type: 'number',
    },
    resourceId: {
      type: 'string',
    },
    classes: {
      type: 'array',
      items: {
        enum: [Object.values(TrainClass)],
      },
    },
    country: {
      type: 'string',
      enum: [Object.values(Country)],
    },
  },
  required: ['id', 'name', 'travelTime', 'resourceId', 'classes', 'country'],
};

export const stepSchema = z.object({
  id: z.string(),
  type: z.enum(StepType),
  name: z.string(),
  resourceId: z.string(),
  levelId: z.number(),
  timeRequired: z.number(),
  trainId: z.string().optional(),
  orderId: z.string().optional(),
});

export const stepDbSchema = {
  title: 'step schema',
  version: 0,
  description: 'describes a simple step',
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100,
    },
    type: {
      type: 'string',
      enum: [Object.values(StepType)],
    },
    name: {
      type: 'string',
    },
    resourceId: {
      type: 'string',
    },
    levelId: {
      type: 'number',
    },
    timeRequired: {
      type: 'number',
    },
    trainId: {
      type: 'string',
    },
    orderId: {
      type: 'string',
    },
  },
  required: ['id', 'type', 'name', 'resourceId', 'levelId', 'timeRequired'],
};

export const levelSchema = z.object({
  level: z.number(),
  done: z.boolean(),
  steps: z.array(stepSchema),
  inventoryChanges: z.map(z.string(), z.number()),
});

export const levelDbSchema = {
  title: 'level schema',
  version: 0,
  description: 'describes a simple level',
  primaryKey: 'level',
  type: 'object',
  properties: {
    level: {
      type: 'number',
    },
    done: {
      type: 'boolean',
    },
    steps: {
      type: 'array',
      items: stepDbSchema,
    },
    inventoryChanges: {
      type: 'object',
      patternProperties: {
        '.{1,}': { type: 'number' },
      },
    },
  },
  required: ['level', 'done', 'steps', 'inventoryChanges'],
};

export const productionPlanSchema = z.object({
  id: z.string(),
  maxConcurrentWorkers: z.number(),
  totalTime: z.number(),
  levels: z.record(z.number(), levelSchema),
});

export const productionPlanDbSchema = {
  title: 'production plan schema',
  version: 0,
  description: 'describes a simple production plan',
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100,
    },
    maxConcurrentWorkers: {
      type: 'number',
    },
    totalTime: {
      type: 'number',
    },
    levels: {
      type: 'object',
      patternProperties: {
        '[0-9]+': levelDbSchema,
      },
    },
  },
  required: ['maxConcurrentWorkers', 'totalTime', 'levels'],
};

export const trainSchema = z.object({
  id: z.string(),
  name: z.string(),
  capacity: z.number(),
  class: z.enum(TrainClass),
  engine: z.enum(TrainEngine),
  country: z.enum(Country),
});

export const trainDbSchema = {
  title: 'train schema',
  version: 0,
  description: 'describes a simple train',
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100,
    },
    name: {
      type: 'string',
    },
    capacity: {
      type: 'number',
    },
    class: {
      type: 'string',
      enum: [Object.values(TrainClass)],
    },
    engine: {
      type: 'string',
      enum: [Object.values(TrainEngine)],
    },
    country: {
      type: 'string',
      enum: [Object.values(Country)],
    },
  },
  required: ['id', 'name', 'capacity', 'class', 'engine', 'country'],
};
