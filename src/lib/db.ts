/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Country,
  type Destination,
  type Factory,
  ProductionPlan,
  type Resource,
  type Train,
  TrainClass,
  TrainEngine,
} from '../types';

import { addRxPlugin, createRxDatabase } from 'rxdb/plugins/core';
import { createCollection } from '@tanstack/react-db';
import { rxdbCollectionOptions } from '@tanstack/rxdb-db-collection';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { getRxStorageLocalstorage } from 'rxdb/plugins/storage-localstorage';
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv';
import { RxDBJsonDumpPlugin } from 'rxdb/plugins/json-dump';
import {
  destinationDbSchema,
  destinationSchema,
  factoryDbSchema,
  factorySchema,
  orderDbSchema,
  orderSchema,
  productionPlanDbSchema,
  productionPlanSchema,
  resourceDbSchema,
  resourceSchema,
  trainDbSchema,
  trainSchema,
} from '../schemas';

addRxPlugin(RxDBDevModePlugin);
addRxPlugin(RxDBJsonDumpPlugin);

const db = await createRxDatabase({
  name: 'idleingredients',
  storage: wrappedValidateAjvStorage({ storage: getRxStorageLocalstorage() }),
});

await db.addCollections({
  resources: {
    schema: resourceDbSchema,
  },
  factories: {
    schema: factoryDbSchema,
  },
  destinations: {
    schema: destinationDbSchema,
  },
  trains: {
    schema: trainDbSchema,
  },
  productionPlan: {
    schema: productionPlanDbSchema,
  },
  orders: {
    schema: orderDbSchema,
  },
  initialInventory: {
    schema: {
      title: 'initial inventory schema',
      version: 0,
      description: 'describes the initial inventory',
      primaryKey: 'resourceId',
      type: 'object',
      properties: {
        resourceId: {
          type: 'string',
          maxLength: 100,
        },
        amount: {
          type: 'number',
        },
      },
      required: ['resourceId', 'amount'],
    },
  },
});

const maxConcurrentTrains = 5; // Maximum number of trains that can work simultaneously

const resourcesCollection = createCollection(
  rxdbCollectionOptions({
    schema: resourceSchema,
    rxCollection: db.resources as any,
  })
);

const factoriesCollection = createCollection(
  rxdbCollectionOptions({
    schema: factorySchema,
    rxCollection: db.factories as any,
  })
);

const destinationsCollection = createCollection(
  rxdbCollectionOptions({
    schema: destinationSchema,
    rxCollection: db.destinations as any,
  })
);

const trainsCollection = createCollection(
  rxdbCollectionOptions({
    schema: trainSchema,
    rxCollection: db.trains as any,
  })
);

const productionPlanCollection = createCollection(
  rxdbCollectionOptions({
    schema: productionPlanSchema,
    rxCollection: db.productionPlan as any,
  })
);

const ordersCollection = createCollection(
  rxdbCollectionOptions({
    schema: orderSchema,
    rxCollection: db.orders as any,
  })
);

const initialInventoryCollection = createCollection(
  rxdbCollectionOptions({
    rxCollection: db.initialInventory as any,
  })
);

const resources: Resource[] = [
  { id: 'coal', name: 'Coal', icon: 'Icon_Coal.png' },
  { id: 'iron', name: 'Iron', icon: 'Icon_Iron_Ore.png' },
  { id: 'wood', name: 'Oakwood', icon: 'Icon_Wood.png' },
  { id: 'steel', name: 'Steel', icon: 'Icon_Steel.png' },
  { id: 'nails', name: 'Nails', icon: 'Icon_Nails.webp' },
  {
    id: 'iron_powder',
    name: 'Iron Powder',
    icon: 'Icon_Iron_Powder.webp',
  },
  {
    id: 'saw_blade',
    name: 'Saw Blade',
    icon: 'Icon_Saw_Blade.webp',
  },
  {
    id: 'copper_ore',
    name: 'Copper Ore',
    icon: 'Icon_Copper_Ore.png',
  },
  { id: 'copper', name: 'Copper', icon: 'Icon_Copper.webp' },
  { id: 'timber', name: 'Timber', icon: 'Icon_Timber.png' },
  { id: 'chair', name: 'Chair', icon: 'Icon_Chair.webp' },
  { id: 'table', name: 'Table', icon: 'Icon_Table.webp' },
  {
    id: 'copper_wire',
    name: 'Copper Wire',
    icon: 'Icon_Copper_Wire.webp',
  },
  { id: 'barrel', name: 'Barrel', icon: 'Icon_Barrel.webp' },
  { id: 'oakwood', name: 'Oakwood', icon: 'Icon_Wood.png' },
];

const trains: Train[] = [
  {
    id: 'train1',
    name: 'FS CLASS 740',
    engine: TrainEngine.Steam,
    capacity: 20,
    class: TrainClass.Common,
    country: Country.Britain,
  },
  {
    id: 'train2',
    name: 'GER CLASS S69',
    engine: TrainEngine.Steam,
    capacity: 20,
    class: TrainClass.Common,
    country: Country.Britain,
  },
  {
    id: 'train3',
    name: 'STAR CLASS 4000',
    engine: TrainEngine.Steam,
    capacity: 20,
    class: TrainClass.Common,
    country: Country.Britain,
  },
  {
    id: 'train4',
    name: 'PRUSSIAN P8',
    engine: TrainEngine.Steam,
    capacity: 20,
    class: TrainClass.Common,
    country: Country.Britain,
  },
  {
    id: 'train5',
    name: 'NORD 140',
    engine: TrainEngine.Steam,
    capacity: 30,
    class: TrainClass.Rare,
    country: Country.Britain,
  },
  {
    id: 'train6',
    name: 'LB&SCR B4',
    engine: TrainEngine.Steam,
    capacity: 30,
    class: TrainClass.Rare,
    country: Country.Britain,
  },
  {
    id: 'train7',
    name: 'SHAY CLASS C',
    engine: TrainEngine.Steam,
    capacity: 45,
    class: TrainClass.Epic,
    country: Country.Britain,
  },
  {
    id: 'train8',
    name: 'GWR 3041 THE QUEEN',
    engine: TrainEngine.Steam,
    capacity: 45,
    class: TrainClass.Epic,
    country: Country.Britain,
  },
  {
    id: 'train9',
    name: 'ERIE L-1',
    engine: TrainEngine.Steam,
    capacity: 0,
    class: TrainClass.Legendary,
    country: Country.Britain,
  },
  {
    id: 'train11',
    name: 'CRAMPTON',
    engine: TrainEngine.Steam,
    capacity: 60,
    class: TrainClass.Legendary,
    country: Country.Britain,
  },
  {
    id: 'train12',
    name: 'BLUE COMET',
    engine: TrainEngine.Steam,
    capacity: 0,
    class: TrainClass.Legendary,
    country: Country.Britain,
  },
  {
    id: 'train13',
    name: 'CLASS V100',
    engine: TrainEngine.Diesel,
    capacity: 20,
    class: TrainClass.Common,
    country: Country.Germany,
  },
  {
    id: 'train14',
    name: 'LNER K3',
    engine: TrainEngine.Steam,
    capacity: 4,
    class: TrainClass.Common,
    country: Country.Germany,
  },
  {
    id: 'train15',
    name: 'SECR N CLASS',
    engine: TrainEngine.Steam,
    capacity: 4,
    class: TrainClass.Common,
    country: Country.Germany,
  },
  {
    id: 'train16',
    name: 'VICTORIAN C CLASS',
    engine: TrainEngine.Steam,
    capacity: 8,
    class: TrainClass.Common,
    country: Country.Germany,
  },
  {
    id: 'train17',
    name: 'DR 18 201',
    engine: TrainEngine.Steam,
    capacity: 11,
    class: TrainClass.Rare,
    country: Country.Germany,
  },
  {
    id: 'train18',
    name: 'LRZ 14',
    engine: TrainEngine.Diesel,
    capacity: 20,
    class: TrainClass.Common,
    country: Country.Germany,
  },
  {
    id: 'train19',
    name: 'MILWAUKEE ROAD EF-1',
    engine: TrainEngine.Electric,
    capacity: 9,
    class: TrainClass.Rare,
    country: Country.Germany,
  },
  {
    id: 'train20',
    name: 'PRR K-4',
    engine: TrainEngine.Steam,
    capacity: 13,
    class: TrainClass.Rare,
    country: Country.Germany,
  },
  {
    id: 'train21',
    name: 'PRUSSIAN T 14',
    engine: TrainEngine.Steam,
    capacity: 7,
    class: TrainClass.Rare,
    country: Country.Germany,
  },
  {
    id: 'train22',
    name: 'ATSF 3000',
    engine: TrainEngine.Steam,
    capacity: 0,
    class: TrainClass.Epic,
    country: Country.Germany,
  },
  {
    id: 'train23',
    name: 'CROCODILE CE 6/8',
    engine: TrainEngine.Electric,
    capacity: 20,
    class: TrainClass.Epic,
    country: Country.Germany,
  },
  {
    id: 'train24',
    name: 'CLASS V200',
    engine: TrainEngine.Diesel,
    capacity: 43,
    class: TrainClass.Epic,
    country: Country.Germany,
  },
  {
    id: 'train25',
    name: 'FS CLASS 670',
    engine: TrainEngine.Steam,
    capacity: 19,
    class: TrainClass.Epic,
    country: Country.Germany,
  },
  {
    id: 'train26',
    name: 'EP-2 BIPOLAR',
    engine: TrainEngine.Electric,
    capacity: 27,
    class: TrainClass.Legendary,
    country: Country.Germany,
  },
  {
    id: 'train27',
    name: 'UP BIG BOY',
    engine: TrainEngine.Steam,
    capacity: 50,
    class: TrainClass.Legendary,
    country: Country.Germany,
  },
  {
    id: 'train28',
    name: 'UP BIG BOY 2',
    engine: TrainEngine.Steam,
    capacity: 20,
    class: TrainClass.Legendary,
    country: Country.Germany,
  },
  {
    id: 'train29',
    name: 'John Bull',
    engine: TrainEngine.Steam,
    capacity: 15,
    class: TrainClass.Common,
    country: Country.Germany,
  },
];

const factories: Factory[] = [
  {
    id: 'factory1',
    name: 'Smelting Plant',
    queueMaxSize: 3,
    recipes: [
      {
        resourceId: 'steel',
        timeRequired: 300,
        requires: [
          { resourceId: 'iron', amount: 10 },
          { resourceId: 'coal', amount: 30 },
        ],
        outputAmount: 40,
        factoryId: 'factory1',
      },
      {
        resourceId: 'copper',
        timeRequired: 500,
        requires: [{ resourceId: 'copper_ore', amount: 40 }],
        outputAmount: 40,
        factoryId: 'factory1',
      },
    ],
  },
  {
    id: 'factory2',
    name: 'Iron Mill',
    queueMaxSize: 10,
    recipes: [
      {
        resourceId: 'iron_powder',
        timeRequired: 90,
        requires: [
          {
            resourceId: 'iron',
            amount: 30,
          },
        ],
        outputAmount: 30,
        factoryId: 'factory2',
      },
      {
        resourceId: 'nails',
        timeRequired: 600,
        requires: [
          {
            resourceId: 'steel',
            amount: 40,
          },
        ],
        outputAmount: 40,
        factoryId: 'factory2',
      },
      {
        resourceId: 'saw_blade',
        timeRequired: 1200,
        requires: [
          {
            resourceId: 'steel',
            amount: 40,
          },
          {
            resourceId: 'iron_powder',
            amount: 30,
          },
        ],
        outputAmount: 70,
        factoryId: 'factory2',
      },
      {
        resourceId: 'copper_wire',
        timeRequired: 25 * 60,
        requires: [
          {
            resourceId: 'copper',
            amount: 80,
          },
          {
            resourceId: 'copper_ore',
            amount: 30,
          },
        ],
        outputAmount: 30,
        factoryId: 'factory2',
      },
    ],
  },
  {
    id: 'factory3',
    name: 'Sawmill',
    queueMaxSize: 10,
    recipes: [
      {
        resourceId: 'timber',
        timeRequired: 900,
        requires: [
          {
            resourceId: 'wood',
            amount: 40,
          },
        ],
        outputAmount: 40,
        factoryId: 'factory3',
      },
    ],
  },
  {
    id: 'factory4',
    name: 'Furniture and Textile',
    queueMaxSize: 10,
    recipes: [
      {
        resourceId: 'chair',
        timeRequired: 120,
        requires: [
          {
            resourceId: 'timber',
            amount: 80,
          },
        ],
        outputAmount: 120,
        factoryId: 'factory4',
      },
      {
        resourceId: 'table',
        timeRequired: 150,
        requires: [
          {
            resourceId: 'timber',
            amount: 80,
          },
        ],
        outputAmount: 150,
        factoryId: 'factory4',
      },
      {
        resourceId: 'barrel',
        timeRequired: 1800,
        requires: [
          {
            resourceId: 'wood',
            amount: 100,
          },
          {
            resourceId: 'copper_wire',
            amount: 110,
          },
        ],
        outputAmount: 210,
        factoryId: 'factory4',
      },
    ],
  },
];

const destinations: Destination[] = [
  {
    id: 'coal_mine',
    name: 'Coal Mine',
    travelTime: 30,
    resourceId: 'coal',
    classes: [
      TrainClass.Common,
      TrainClass.Rare,
      TrainClass.Epic,
      TrainClass.Legendary,
    ],
    country: Country.Britain,
  },
  {
    id: 'iron_ore_mine',
    name: 'Iron Ore Mine',
    travelTime: 30,
    resourceId: 'iron',
    classes: [
      TrainClass.Common,
      TrainClass.Rare,
      TrainClass.Epic,
      TrainClass.Legendary,
    ],
    country: Country.Britain,
  },
  {
    id: 'steel_factory',
    name: 'Steel Factory',
    travelTime: 180,
    resourceId: 'steel',
    classes: [TrainClass.Epic, TrainClass.Legendary],
    country: Country.Britain,
  },
  {
    id: 'oakwood',
    name: 'Oak wood',
    travelTime: 300,
    resourceId: 'wood',
    classes: [
      TrainClass.Common,
      TrainClass.Rare,
      TrainClass.Epic,
      TrainClass.Legendary,
    ],
    country: Country.Germany,
  },
  {
    id: 'copper_mine',
    name: 'Copper Mine',
    travelTime: 300,
    resourceId: 'copper_ore',
    classes: [
      TrainClass.Common,
      TrainClass.Rare,
      TrainClass.Epic,
      TrainClass.Legendary,
    ],
    country: Country.Germany,
  },
  {
    id: 'timber_factory',
    name: 'Timber Factory',
    travelTime: 180,
    resourceId: 'timber',
    classes: [TrainClass.Epic, TrainClass.Legendary],
    country: Country.Germany,
  },
];

const initialInventory: Map<string, number> = new Map(
  resources.map(resource => [resource.id, 0])
);

await db.resources.bulkInsert(resources);
await db.factories.bulkInsert(factories);
await db.destinations.bulkInsert(destinations);
await db.trains.bulkInsert(trains);
await db.initialInventory.bulkInsert(Array.from(initialInventory.entries()));

const saveFile = async (blob: Blob, filename: string) => {
  const a = document.createElement('a');
  a.download = filename;
  a.href = URL.createObjectURL(blob);
  a.addEventListener('click', () => {
    setTimeout(() => URL.revokeObjectURL(a.href), 30 * 1000);
  });
  a.click();
};

db.resources.exportJSON().then(json => {
  const filename = 'idle-ingredients-resources.json';

  const blob = new Blob([JSON.stringify(json, null, 2)], {
    type: 'application/json',
  });
  saveFile(blob, filename);
});

db.factories.exportJSON().then(json => {
  const filename = 'idle-ingredients-factories.json';
  const blob = new Blob([JSON.stringify(json, null, 2)], {
    type: 'application/json',
  });
  saveFile(blob, filename);
});

db.destinations.exportJSON().then(json => {
  const filename = 'idle-ingredients-destinations.json';
  const blob = new Blob([JSON.stringify(json, null, 2)], {
    type: 'application/json',
  });
  saveFile(blob, filename);
});

db.trains.exportJSON().then(json => {
  const filename = 'idle-ingredients-trains.json';
  const blob = new Blob([JSON.stringify(json, null, 2)], {
    type: 'application/json',
  });
  saveFile(blob, filename);
});

db.productionPlan.exportJSON().then(json => {
  const filename = 'idle-ingredients-production-plan.json';
  const blob = new Blob([JSON.stringify(json, null, 2)], {
    type: 'application/json',
  });
  saveFile(blob, filename);
});

db.orders.exportJSON().then(json => {
  const filename = 'idle-ingredients-orders.json';
  const blob = new Blob([JSON.stringify(json, null, 2)], {
    type: 'application/json',
  });
  saveFile(blob, filename);
});

db.initialInventory.exportJSON().then(json => {
  const filename = 'idle-ingredients-initial-inventory.json';
  const blob = new Blob([JSON.stringify(json, null, 2)], {
    type: 'application/json',
  });
  saveFile(blob, filename);
});

const defaultProductionPlan: ProductionPlan = {
  id: '1',
  levels: {
    1: {
      level: 1,
      steps: [],
      inventoryChanges: new Map<string, number>(),
      done: false,
    },
  },
  totalTime: 0,
  maxConcurrentWorkers: 3, // Default value, will be updated from Db
};

export {
  maxConcurrentTrains,
  resourcesCollection,
  factoriesCollection,
  destinationsCollection,
  trainsCollection,
  productionPlanCollection,
  ordersCollection,
  initialInventoryCollection,
  defaultProductionPlan,
};
