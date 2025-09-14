import {
  object,
  string,
  number,
  array,
  boolean,
  ObjectSchema,
  mixed,
} from 'yup';
import {
  StepType,
  PlanningLevel,
  ResourceRequirement,
  Recipe,
  Factory,
  Destination,
  ProductionPlan,
  TrainClass,
  Country,
  Resource,
  Train,
  TrainEngine,
  OrderType,
} from './types';

export const resourceSchema: ObjectSchema<Resource> = object({
  id: string().required(),
  name: string().required(),
  icon: string().required(),
});

export const resourceRequirementSchema: ObjectSchema<ResourceRequirement> =
  object({
    resourceId: string().required(),
    amount: number().required(),
    delivered: number().optional(),
  });

// Form schema for OrderForm - flat structure with all fields
export const orderSchema = object({
  id: string().required(),
  type: string().oneOf(Object.values(OrderType)).required(),
  name: string().required(),
  resources: array(resourceRequirementSchema).required(),
  expirationTime: number().when('type', {
    is: OrderType.Boat,
    then: schema => schema.required(),
    otherwise: schema => schema.optional(),
  }),
  travelTime: number().when('type', {
    is: OrderType.Story,
    then: schema => schema.required(),
    otherwise: schema => schema.optional(),
  }),
  classes: array(string().oneOf(Object.values(TrainClass)).required()).when(
    'type',
    {
      is: OrderType.Story,
      then: schema => schema.required(),
      otherwise: schema => schema.optional(),
    }
  ),
  country: string().when('type', {
    is: OrderType.Story,
    then: schema => schema.required(),
    otherwise: schema => schema.optional(),
  }),
});

export const recipeSchema: ObjectSchema<Recipe> = object({
  factoryId: string()
    .required()
    .test(
      'factory-id-match',
      'Factory ID must match factory ID',
      (value, context) => {
        const factory = context.parent.id;
        return factory === value;
      }
    ),
  resourceId: string().required(),
  timeRequired: number().required(),
  outputAmount: number().required(),
  requires: array(resourceRequirementSchema).required(),
});

export const factorySchema: ObjectSchema<Factory> = object({
  id: string().required(),
  queueMaxSize: number().required(),
  name: string().required(),
  recipes: array(recipeSchema).required(),
});

export const destinationSchema: ObjectSchema<Destination> = object({
  id: string().required(),
  name: string().required(),
  travelTime: number().required(),
  resourceId: string().required(),
  classes: array(
    string()
      .oneOf([
        TrainClass.Common,
        TrainClass.Rare,
        TrainClass.Epic,
        TrainClass.Legendary,
      ])
      .required()
  ).required(),
  country: string().oneOf([Country.Britain, Country.Germany]).required(),
});

export const stepSchema = object({
  id: string().required(),
  type: string().oneOf(Object.values(StepType)).required(),
  name: string().required(),
  resourceId: string()
    .required()
    .test('resource-id-exists', 'Resource ID must exist', (value, context) => {
      const resources = context.parent.resources;
      return resources[value] !== undefined;
    }),
  levelId: number()
    .required()
    .test(
      'level-id-must-equal-to-parent',
      'Level ID must equal to parent level ID',
      (value, context) => {
        return value === context.parent?.levelId;
      }
    ),
  timeRequired: number().required(),
  trainId: string()
    .required()
    .transform(value => (value == '' ? undefined : value))
    .when('type', {
      is: [StepType.Destination, StepType.Delivery],
      then: schema =>
        schema
          .required()
          .test('train-id-exists', 'Train ID must exist', (value, context) => {
            const trains = context.parent.trains;
            return trains[value] !== undefined;
          }),
      otherwise: schema => schema,
    }),
  orderId: string()
    .required()
    .transform(value => (value == '' ? undefined : value))
    .when('type', {
      is: [StepType.Delivery, StepType.Submit],
      then: schema =>
        schema
          .required()
          .test('order-id-exists', 'Order ID must exist', (value, context) => {
            const orders = context.parent.orders;
            return orders[value] !== undefined;
          }),
      otherwise: schema => schema,
    }),
});

export const levelSchema = object({
  level: number().required(),
  done: boolean().required(),
  steps: array().of(stepSchema).required(),
  inventoryChanges: mixed<Map<string, number>>().required(),
});

export const productionPlanSchema: ObjectSchema<ProductionPlan> = object({
  maxConcurrentWorkers: number().required(),
  totalTime: number().required(),
  levels: mixed<Record<number, PlanningLevel>>()
    .required()
    .test(
      'levels-key-match-id',
      'Level keys must match their level',
      async function (levels) {
        if (!levels) return true;

        for (const [key, level] of Object.entries(levels)) {
          const keyNum = parseInt(key);
          const levelData = level as PlanningLevel;

          // Check if key matches level.level
          if (isNaN(keyNum) || levelData.level !== keyNum) {
            return this.createError({
              message: `Level key "${key}" does not match level.level "${levelData.level}"`,
              path: `levels.${key}.level`,
            });
          }
        }
        return true;
      }
    )
    .test(
      'levels-schema-match',
      'Level objects must conform to levelSchema',
      async function (levels) {
        if (!levels) return true;

        for (const level of Object.values<PlanningLevel>(levels)) {
          // Validate the level object against levelSchema
          try {
            await levelSchema.validate(level, { strict: true });
          } catch (validationError) {
            return this.createError({
              message: `Level validation failed: ${validationError.message}`,
              path: `levels.${level.level}`,
            });
          }
        }
        return true;
      }
    ),
});

export const trainSchema: ObjectSchema<Train> = object({
  id: string().required(),
  name: string().required(),
  capacity: number().required(),
  class: string().oneOf(Object.values(TrainClass)).required(),
  engine: string().oneOf(Object.values(TrainEngine)).required(),
  country: string().oneOf(Object.values(Country)).required(),
});
