import {
  Country,
  type DeliveryStep,
  type Destination,
  type DestinationStep,
  type Factory,
  type FactoryStep,
  type Recipe,
  type Resource,
  type Step,
  type SubmitStep,
  type Train,
  TrainClass,
  TrainEngine,
} from 'types';
import { generateId } from 'utils';

export class Db {
  private resources: Record<string, Resource> = {
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
  private trains: Record<string, Train> = {
    train1: {
      id: 'train1',
      name: 'FS CLASS 740',
      engine: TrainEngine.Steam,
      capacity: 20,
      class: TrainClass.Common,
      country: Country.Britain,
    },
    train2: {
      id: 'train2',
      name: 'GER CLASS S69',
      engine: TrainEngine.Steam,
      capacity: 20,
      class: TrainClass.Common,
      country: Country.Britain,
    },
    train3: {
      id: 'train3',
      name: 'STAR CLASS 4000',
      engine: TrainEngine.Steam,
      capacity: 20,
      class: TrainClass.Common,
      country: Country.Britain,
    },
    train4: {
      id: 'train4',
      name: 'PRUSSIAN P8',
      engine: TrainEngine.Steam,
      capacity: 20,
      class: TrainClass.Common,
      country: Country.Britain,
    },
    train5: {
      id: 'train5',
      name: 'NORD 140',
      engine: TrainEngine.Steam,
      capacity: 30,
      class: TrainClass.Rare,
      country: Country.Britain,
    },
    train6: {
      id: 'train6',
      name: 'LB&SCR B4',
      engine: TrainEngine.Steam,
      capacity: 30,
      class: TrainClass.Rare,
      country: Country.Britain,
    },
    train7: {
      id: 'train7',
      name: 'SHAY CLASS C',
      engine: TrainEngine.Steam,
      capacity: 45,
      class: TrainClass.Epic,
      country: Country.Britain,
    },
    train8: {
      id: 'train8',
      name: 'GWR 3041 THE QUEEN',
      engine: TrainEngine.Steam,
      capacity: 45,
      class: TrainClass.Epic,
      country: Country.Britain,
    },
    train9: {
      id: 'train9',
      name: 'ERIE L-1',
      engine: TrainEngine.Steam,
      capacity: 0,
      class: TrainClass.Legendary,
      country: Country.Britain,
    },
    train11: {
      id: 'train11',
      name: 'CRAMPTON',
      engine: TrainEngine.Steam,
      capacity: 60,
      class: TrainClass.Legendary,
      country: Country.Britain,
    },
    train12: {
      id: 'train12',
      name: 'BLUE COMET',
      engine: TrainEngine.Steam,
      capacity: 0,
      class: TrainClass.Legendary,
      country: Country.Britain,
    },
    train13: {
      id: 'train13',
      name: 'CLASS V100',
      engine: TrainEngine.Diesel,
      capacity: 20,
      class: TrainClass.Common,
      country: Country.Germany,
    },
    train14: {
      id: 'train14',
      name: 'LNER K3',
      engine: TrainEngine.Steam,
      capacity: 4,
      class: TrainClass.Common,
      country: Country.Germany,
    },
    train15: {
      id: 'train15',
      name: 'SECR N CLASS',
      engine: TrainEngine.Steam,
      capacity: 4,
      class: TrainClass.Common,
      country: Country.Germany,
    },
    train16: {
      id: 'train16',
      name: 'VICTORIAN C CLASS',
      engine: TrainEngine.Steam,
      capacity: 8,
      class: TrainClass.Common,
      country: Country.Germany,
    },
    train17: {
      id: 'train17',
      name: 'DR 18 201',
      engine: TrainEngine.Steam,
      capacity: 11,
      class: TrainClass.Rare,
      country: Country.Germany,
    },
    train18: {
      id: 'train18',
      name: 'LRZ 14',
      engine: TrainEngine.Diesel,
      capacity: 20,
      class: TrainClass.Common,
      country: Country.Germany,
    },
    train19: {
      id: 'train19',
      name: 'MILWAUKEE ROAD EF-1',
      engine: TrainEngine.Electric,
      capacity: 9,
      class: TrainClass.Rare,
      country: Country.Germany,
    },
    train20: {
      id: 'train20',
      name: 'PRR K-4',
      engine: TrainEngine.Steam,
      capacity: 13,
      class: TrainClass.Rare,
      country: Country.Germany,
    },
    train21: {
      id: 'train21',
      name: 'PRUSSIAN T 14',
      engine: TrainEngine.Steam,
      capacity: 7,
      class: TrainClass.Rare,
      country: Country.Germany,
    },
    train22: {
      id: 'train22',
      name: 'ATSF 3000',
      engine: TrainEngine.Steam,
      capacity: 0,
      class: TrainClass.Epic,
      country: Country.Germany,
    },
    train23: {
      id: 'train23',
      name: 'CROCODILE CE 6/8',
      engine: TrainEngine.Electric,
      capacity: 20,
      class: TrainClass.Epic,
      country: Country.Germany,
    },
    train24: {
      id: 'train24',
      name: 'CLASS V200',
      engine: TrainEngine.Diesel,
      capacity: 43,
      class: TrainClass.Epic,
      country: Country.Germany,
    },
    train25: {
      id: 'train25',
      name: 'FS CLASS 670',
      engine: TrainEngine.Steam,
      capacity: 19,
      class: TrainClass.Epic,
      country: Country.Germany,
    },
    train26: {
      id: 'train26',
      name: 'EP-2 BIPOLAR',
      engine: TrainEngine.Electric,
      capacity: 27,
      class: TrainClass.Legendary,
      country: Country.Germany,
    },
    train27: {
      id: 'train27',
      name: 'UP BIG BOY',
      engine: TrainEngine.Steam,
      capacity: 50,
      class: TrainClass.Legendary,
      country: Country.Germany,
    },
    train28: {
      id: 'train28',
      name: 'UP BIG BOY 2',
      engine: TrainEngine.Steam,
      capacity: 20,
      class: TrainClass.Legendary,
      country: Country.Germany,
    },
    train29: {
      id: 'train29',
      name: 'John Bull',
      engine: TrainEngine.Steam,
      capacity: 15,
      class: TrainClass.Common,
      country: Country.Germany,
    },
  };

  public static maxConcurrentTrains = 5; // Maximum number of trains that can work simultaneously

  private factories: Record<string, Factory> = {
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

  private destinations: Record<string, Destination> = {
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
      country: Country.Britain,
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
      country: Country.Britain,
    },
    steel_factory: {
      id: 'steel_factory',
      travelTime: 180,
      resourceId: 'steel',
      classes: [TrainClass.Epic, TrainClass.Legendary],
      country: Country.Britain,
    },

    oakwood: {
      id: 'oakwood',
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
      country: Country.Germany,
    },
    /*
    timber_factory: {
      id: 'timber_factory',
      travelTime: 180,
      resourceId: 'timber',
      classes: [TrainClass.Epic, TrainClass.Legendary],
      country: Country.Germany,
    },*/
  };

  static isDeliveryStep = (step: Step): step is DeliveryStep => {
    return step.type === 'delivery';
  };

  public outputAmount = (step: Step): number => {
    if (Db.isDestinationStep(step)) {
      return this.trains[step.trainId].capacity;
    }
    if (Db.isFactoryStep(step)) {
      return this.getRecipe(step.resourceId)?.outputAmount ?? 0;
    }
    return 0;
  };

  public getRecipe = (resourceId: string): Recipe | undefined => {
    return Object.values(this.factories)
      .flatMap(f => f.recipes)
      .find(r => r.resourceId === resourceId);
  };

  public inputAmounts = (step: Step): Map<string, number> => {
    if (Db.isFactoryStep(step)) {
      return new Map(
        this.getRecipe(step.resourceId)?.requires.map(x => [
          x.resourceId,
          x.amount,
        ])
      );
    }
    if (Db.isDeliveryStep(step)) {
      return new Map([[step.resourceId, this.trains[step.trainId].capacity]]);
    }
    return new Map();
  };

  public static isFactoryStep = (step: Step): step is FactoryStep => {
    return step.type === 'factory';
  };

  public static isDestinationStep = (step: Step): step is DestinationStep => {
    return step.type === 'destination';
  };

  public static isSubmitStep = (step: Step): step is SubmitStep => {
    return step.type === 'submit';
  };

  public getResources = async (): Promise<Resource[]> => {
    return await Promise.resolve(Object.values(this.resources));
  };

  public getFactories = async (): Promise<Factory[]> => {
    return await Promise.resolve(Object.values(this.factories));
  };

  public getDestinations = async (): Promise<Destination[]> => {
    return await Promise.resolve(Object.values(this.destinations));
  };

  public getTrains = async (): Promise<Record<string, Train>> => {
    return await Promise.resolve(this.trains);
  };

  public addResource = async (name: string, icon: string) => {
    const resource = {
      id: generateId('resource'),
      name: name,
      icon: icon,
    };
    this.resources[resource.id] = resource;
    return resource;
  };

  public addRecipe = async (factoryId: string, recipe: Recipe) => {
    this.factories[factoryId].recipes.push(recipe);
    return recipe;
  };
  public addDestination = async (destination: Destination) => {
    this.destinations[destination.id] = destination;
    return destination;
  };
}
export const db = new Db();
