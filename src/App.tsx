import { useState } from 'react';
import { OrderForm } from './OrderForm';
import { ProductionPlan } from './ProductionPlan';
import { CurrentInventory } from './CurrentInventory';
import { CurrentOrders } from './CurrentOrders';
import {
  Order,
  Resource,
  Train,
  Factory,
  Destination,
  ProductionPlan as ProductionPlanType,
  TrainEngine,
  TrainClass,
  Inventory,
} from './types';
import './styles.scss';

function App() {
  const resources: Resource[] = [
    { id: 'coal', name: 'Coal', icon: 'Icon_Coal.png' },
    { id: 'iron', name: 'Iron', icon: 'Icon_Iron_Ore.png' },
    { id: 'wood', name: 'Oakwood', icon: 'Icon_Wood.png' },
    { id: 'steel', name: 'Steel', icon: 'Icon_Steel.png' },
    { id: 'nails', name: 'Nails', icon: 'Icon_Nails.webp' },
    { id: 'iron_powder', name: 'Iron Powder', icon: 'Icon_Iron_Powder.webp' },
    { id: 'saw_blade', name: 'Saw Blade', icon: 'Icon_Saw_Blade.webp' },
    { id: 'copper_ore', name: 'Copper Ore', icon: 'Icon_Copper_Ore.png' },
    { id: 'copper', name: 'Copper', icon: 'Icon_Copper.webp' },
    { id: 'timber', name: 'Timber', icon: 'Icon_Timber.png' },
    { id: 'chair', name: 'Chair', icon: 'Icon_Chair.webp' },
    { id: 'table', name: 'Table', icon: 'Icon_Table.webp' },
    { id: 'copper_wire', name: 'Copper Wire', icon: 'Icon_Copper_Wire.webp' },
  ];

  const trains: Train[] = [
    {
      id: 'train1',
      name: 'FS CLASS 740',
      engine: TrainEngine.Steam,
      capacity: 20,
      class: TrainClass.Common,
    },
    {
      id: 'train2',
      name: 'GER CLASS S69',
      engine: TrainEngine.Steam,
      capacity: 20,
      class: TrainClass.Common,
    },
    {
      id: 'train3',
      name: 'STAR CLASS 4000',
      engine: TrainEngine.Steam,
      capacity: 20,
      class: TrainClass.Common,
    },
    {
      id: 'train4',
      name: 'PRUSSIAN P8',
      engine: TrainEngine.Steam,
      capacity: 20,
      class: TrainClass.Common,
    },
    {
      id: 'train5',
      name: 'NORD 140',
      engine: TrainEngine.Steam,
      capacity: 30,
      class: TrainClass.Rare,
    },
    {
      id: 'train6',
      name: 'LB&SCR B4',
      engine: TrainEngine.Steam,
      capacity: 30,
      class: TrainClass.Rare,
    },
    {
      id: 'train7',
      name: 'SHAY CLASS C',
      engine: TrainEngine.Steam,
      capacity: 45,
      class: TrainClass.Epic,
    },
    {
      id: 'train8',
      name: 'GWR 3041 THE QUEEN',
      engine: TrainEngine.Steam,
      capacity: 45,
      class: TrainClass.Epic,
    },
    {
      id: 'train9',
      name: 'LNER A4 MALLARD',
      engine: TrainEngine.Steam,
      capacity: 60,
      class: TrainClass.Legendary,
    },
    {
      id: 'train10',
      name: 'ERIE L-1',
      engine: TrainEngine.Steam,
      capacity: 60,
      class: TrainClass.Legendary,
    },
    {
      id: 'train11',
      name: 'CRAMPTON',
      engine: TrainEngine.Steam,
      capacity: 60,
      class: TrainClass.Legendary,
    },
    {
      id: 'train12',
      name: 'BLUE COMET',
      engine: TrainEngine.Steam,
      capacity: 60,
      class: TrainClass.Legendary,
    },
  ];

  const maxConcurrentTrains = 5; // Maximum number of trains that can work simultaneously

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
        },
        {
          resourceId: 'copper',
          timeRequired: 500,
          requires: [{ resourceId: 'copper_ore', amount: 40 }],
          outputAmount: 40,
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
  ];

  const destinations: Destination[] = [
    {
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
    {
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
    {
      id: 'steel_factory',
      travelTime: 180,
      resourceId: 'steel',
      classes: [TrainClass.Epic, TrainClass.Legendary],
    },

    {
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
    {
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
    {
      id: 'timber_factory',
      travelTime: 180,
      resourceId: 'timber',
      classes: [TrainClass.Epic, TrainClass.Legendary],
    },
  ];

  const [inventory, setInventory] = useState<Inventory>({
    maxCapacity: 1000,
    inventory: new Map(resources.map(r => [r.id, 0])),
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [activeLevel, setActiveLevel] = useState<number>(1);
  const [productionPlan, setProductionPlan] = useState<ProductionPlanType>({
    levels: [
      {
        level: 1,
        startTime: 0,
        endTime: 0,
        steps: [],
        inventoryChanges: new Map(),
        trainCount: 0,
        description: 'First Level',
        estimatedTime: 0,
        done: false,
      },
    ],
    totalTime: 0,
    maxConcurrentWorkers: maxConcurrentTrains,
  });

  const handleOrderSubmit = (order: Order) => {
    setOrders([...orders, order]);
  };

  const handleProductionPlanChange = (plan: ProductionPlanType) => {
    setProductionPlan(plan);
    setInventory(getInventoryAtLevel(activeLevel));
  };

  const handleActiveLevelChange = (levelNumber: number) => {
    setActiveLevel(levelNumber);
    setInventory(getInventoryAtLevel(levelNumber));

    let deliveredAmounts = new Map<string, number>(
      resources.map(r => [r.id, 0])
    );

    // Sum up amounts from delivery steps for this level
    productionPlan.levels.forEach(level => {
      if (level.level <= activeLevel) {
        level.steps
          .filter(step => step.type === 'delivery')
          .forEach(step => {
            const currentAmount = deliveredAmounts.get(step.resourceId) || 0;
            deliveredAmounts.set(
              step.resourceId,
              currentAmount + step.amountProcessed
            );
          });
      }
    });

    setOrders(
      orders.map(order => {
        return {
          ...order,
          resources: order.resources.map(resource => {
            const currentAmount =
              deliveredAmounts.get(resource.resourceId) || 0;
            const amountLeft = currentAmount - resource.amount;
            if (amountLeft > 0) {
              resource.delivered = resource.amount;
              deliveredAmounts.set(resource.resourceId, amountLeft);
            } else {
              resource.delivered = resource.amount - amountLeft;
              deliveredAmounts.set(resource.resourceId, 0);
            }
            return { ...resource, delivered: resource.delivered || 0 };
          }),
        };
      })
    );
  };

  const getInventoryAtLevel = (levelNumber: number): Inventory => {
    var results = new Map(resources.map(r => [r.id, 0]));
    if (!productionPlan) return { ...inventory, inventory: results };
    for (const level of productionPlan.levels) {
      if (level.level <= levelNumber) {
        for (const [resourceId, change] of level.inventoryChanges) {
          const resource = resources.find(r => r.id === resourceId);
          if (!resource) continue;
          const current = inventory.inventory.get(resourceId) || 0;
          inventory.inventory.set(resourceId, current + change);
        }
      }
    }
    return { ...inventory, inventory: results };
  };

  const clearProductionPlan = () => {
    setProductionPlan({
      levels: [
        {
          level: 1,
          startTime: 0,
          endTime: 0,
          steps: [],
          inventoryChanges: new Map(),
          trainCount: 0,
          description: 'First Level',
          estimatedTime: 0,
          done: false,
        },
      ],
      totalTime: 0,
      maxConcurrentWorkers: maxConcurrentTrains,
    });
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Idle Game Production Planner</h1>
      </header>

      <main className="main-grid m-2 pb-2">
        {/* Row 1: Current Orders and New Order Form */}

        <div className="current-orders">
          <CurrentOrders
            orders={orders}
            resources={resources}
            trains={trains}
            productionPlan={productionPlan}
            activeLevel={activeLevel}
            onProductionPlanChange={handleProductionPlanChange}
            onOrdersChange={setOrders}
            maxConcurrentTrains={maxConcurrentTrains}
          />
        </div>
        <div className="order-form">
          <OrderForm
            resources={resources}
            onSubmit={handleOrderSubmit}
            onOrdersChange={setOrders}
          />
        </div>
        <div className="production-plan">
          <ProductionPlan
            factories={factories}
            destinations={destinations}
            productionPlan={productionPlan}
            activeLevel={activeLevel}
            onActiveLevelChange={handleActiveLevelChange}
            onProductionPlanChange={handleProductionPlanChange}
            onOrdersChange={setOrders}
            onClearPlan={clearProductionPlan}
            trains={trains}
            maxConcurrentTrains={maxConcurrentTrains}
            resources={resources}
          />
        </div>

        <div className="current-inventory">
          <CurrentInventory
            resources={resources}
            inventory={inventory}
            activeLevel={activeLevel}
            productionPlan={productionPlan}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
