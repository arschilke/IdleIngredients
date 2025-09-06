import {
  DeliveryStep,
  Destination,
  DestinationStep,
  Factory,
  FactoryStep,
  Resource,
  Step,
  SubmitStep,
  Train,
  TrainClass,
  TrainEngine,
} from './types';

export const resources: Record<string, Resource> = {
  coal: { id: 'coal', name: 'Coal', icon: 'Icon_Coal.png' },
  iron: { id: 'iron', name: 'Iron', icon: 'Icon_Iron_Ore.png' },
  wood: { id: 'wood', name: 'Oakwood', icon: 'Icon_Wood.png' },
  steel: { id: 'steel', name: 'Steel', icon: 'Icon_Steel.png' },
  nails: { id: 'nails', name: 'Nails', icon: 'Icon_Nails.webp' },
  iron_powder: {
    id: 'iron_powder',
    name: 'Iron Powder',
    icon: 'Icon_Iron_Powder.webp',
  },
  saw_blade: {
    id: 'saw_blade',
    name: 'Saw Blade',
    icon: 'Icon_Saw_Blade.webp',
  },
  copper_ore: {
    id: 'copper_ore',
    name: 'Copper Ore',
    icon: 'Icon_Copper_Ore.png',
  },
  copper: { id: 'copper', name: 'Copper', icon: 'Icon_Copper.webp' },
  timber: { id: 'timber', name: 'Timber', icon: 'Icon_Timber.png' },
  chair: { id: 'chair', name: 'Chair', icon: 'Icon_Chair.webp' },
  table: { id: 'table', name: 'Table', icon: 'Icon_Table.webp' },
  copper_wire: {
    id: 'copper_wire',
    name: 'Copper Wire',
    icon: 'Icon_Copper_Wire.webp',
  },
  barrel: { id: 'barrel', name: 'Barrel', icon: 'Icon_Barrel.webp' },
  oakwood: { id: 'oakwood', name: 'Oakwood', icon: 'Icon_Wood.png' },
};

export const trains: Record<string, Train> = {
  train1: {
    id: 'train1',
    name: 'FS CLASS 740',
    engine: TrainEngine.Steam,
    capacity: 20,
    class: TrainClass.Common,
  },
  train2: {
    id: 'train2',
    name: 'GER CLASS S69',
    engine: TrainEngine.Steam,
    capacity: 20,
    class: TrainClass.Common,
  },
  train3: {
    id: 'train3',
    name: 'STAR CLASS 4000',
    engine: TrainEngine.Steam,
    capacity: 20,
    class: TrainClass.Common,
  },
  train4: {
    id: 'train4',
    name: 'PRUSSIAN P8',
    engine: TrainEngine.Steam,
    capacity: 20,
    class: TrainClass.Common,
  },
  train5: {
    id: 'train5',
    name: 'NORD 140',
    engine: TrainEngine.Steam,
    capacity: 30,
    class: TrainClass.Rare,
  },
  train6: {
    id: 'train6',
    name: 'LB&SCR B4',
    engine: TrainEngine.Steam,
    capacity: 30,
    class: TrainClass.Rare,
  },
  train7: {
    id: 'train7',
    name: 'SHAY CLASS C',
    engine: TrainEngine.Steam,
    capacity: 45,
    class: TrainClass.Epic,
  },
  train8: {
    id: 'train8',
    name: 'GWR 3041 THE QUEEN',
    engine: TrainEngine.Steam,
    capacity: 45,
    class: TrainClass.Epic,
  },
  train9: {
    id: 'train9',
    name: 'LNER A4 MALLARD',
    engine: TrainEngine.Steam,
    capacity: 60,
    class: TrainClass.Legendary,
  },
  train10: {
    id: 'train10',
    name: 'ERIE L-1',
    engine: TrainEngine.Steam,
    capacity: 60,
    class: TrainClass.Legendary,
  },
  train11: {
    id: 'train11',
    name: 'CRAMPTON',
    engine: TrainEngine.Steam,
    capacity: 60,
    class: TrainClass.Legendary,
  },
  train12: {
    id: 'train12',
    name: 'BLUE COMET',
    engine: TrainEngine.Steam,
    capacity: 60,
    class: TrainClass.Legendary,
  },
};

export const maxConcurrentTrains = 5; // Maximum number of trains that can work simultaneously

export const factories: Record<string, Factory> = {
  factory1: {
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
      },
      {
        resourceId: 'copper',
        timeRequired: 500,
        requires: [{ resourceId: 'copper_ore', amount: 40 }],
        outputAmount: 40,
      },
    ],
  },
  factory2: {
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
      },
    ],
  },
  factory3: {
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
      },
    ],
  },
  factory4: {
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
      },
    ],
  },
};

export const destinations: Record<string, Destination> = {
  coal_mine: {
    id: 'coal_mine',
    travelTime: 30,
    resourceId: 'coal',
    classes: [
      TrainClass.Common,
      TrainClass.Rare,
      TrainClass.Epic,
      TrainClass.Legendary,
    ],
  },
  iron_ore_mine: {
    id: 'iron_ore_mine',
    travelTime: 30,
    resourceId: 'iron',
    classes: [
      TrainClass.Common,
      TrainClass.Rare,
      TrainClass.Epic,
      TrainClass.Legendary,
    ],
  },
  steel_factory: {
    id: 'steel_factory',
    travelTime: 180,
    resourceId: 'steel',
    classes: [TrainClass.Epic, TrainClass.Legendary],
  },

  oakwood: {
    id: 'oakwood',
    travelTime: 300,
    resourceId: 'oakwood',
    classes: [
      TrainClass.Common,
      TrainClass.Rare,
      TrainClass.Epic,
      TrainClass.Legendary,
    ],
  },
  copper_mine: {
    id: 'copper_mine',
    travelTime: 300,
    resourceId: 'copper_ore',
    classes: [
      TrainClass.Common,
      TrainClass.Rare,
      TrainClass.Epic,
      TrainClass.Legendary,
    ],
  },
  timber_factory: {
    id: 'timber_factory',
    travelTime: 180,
    resourceId: 'timber',
    classes: [TrainClass.Epic, TrainClass.Legendary],
  },
};

export const isDeliveryStep = (step: Step): step is DeliveryStep => {
  return step.type === 'delivery';
};

export function outputAmount(step: Step): number {
  if (isDestinationStep(step)) {
    return trains[step.trainId].capacity;
  }
  if (isFactoryStep(step)) {
    return step.recipe.outputAmount;
  }
  return 0;
}

export function inputAmounts(step: Step): Map<string, number> {
  if (isFactoryStep(step)) {
    return new Map(step.recipe.requires.map(x => [x.resourceId, x.amount]));
  }
  if (isDeliveryStep(step)) {
    return new Map([[step.resourceId, trains[step.trainId].capacity]]);
  }
  return new Map();
}

export const isFactoryStep = (step: Step): step is FactoryStep => {
  return step.type === 'factory';
};

export const isDestinationStep = (step: Step): step is DestinationStep => {
  return step.type === 'destination';
};

export const isSubmitStep = (step: Step): step is SubmitStep => {
  return step.type === 'submit';
};
