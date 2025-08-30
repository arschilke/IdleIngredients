import { useState, useEffect } from 'react';
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
  Warehouse,
  GameState,
  ProductionPlan as ProductionPlanType,
} from './types';
import './styles.scss';

function App() {
  const [resources] = useState<Resource[]>([
    { id: 'coal', name: 'Coal' },
    { id: 'iron', name: 'Iron' },
    { id: 'oakwood', name: 'Oakwood' },
    { id: 'steel', name: 'Steel' },
    { id: 'nails', name: 'Nails' },
    { id: 'iron_powder', name: 'Iron Powder' },
    { id: 'saw_blade', name: 'Saw Blade' },
    { id: 'copper_ore', name: 'Copper Ore' },
    { id: 'copper', name: 'Copper' },
  ]);

  const [trains] = useState<Train[]>([
    {
      id: 'train1',
      name: 'Train 1',
      capacity: 10,
      availableAt: 0,
      class: 'common',
    },
    {
      id: 'train2',
      name: 'Train 2',
      capacity: 15,
      availableAt: 0,
      class: 'rare',
    },
    {
      id: 'train3',
      name: 'Train 3',
      capacity: 12,
      availableAt: 0,
      class: 'epic',
    },
    {
      id: 'train4',
      name: 'Train 4',
      capacity: 8,
      availableAt: 0,
      class: 'legendary',
    },
    {
      id: 'train5',
      name: 'Train 5',
      capacity: 20,
      availableAt: 0,
      class: 'common',
    },
    {
      id: 'train6',
      name: 'Train 6',
      capacity: 14,
      availableAt: 0,
      class: 'rare',
    },
    {
      id: 'train7',
      name: 'Train 7',
      capacity: 16,
      availableAt: 0,
      class: 'epic',
    },
    {
      id: 'train8',
      name: 'Train 8',
      capacity: 11,
      availableAt: 0,
      class: 'legendary',
    },
  ]);

  const maxConcurrentTrains = 5; // Maximum number of trains that can work simultaneously

  const [factories] = useState<Factory[]>([
    {
      id: 'factory1',
      name: 'Smelting Plant',
      availableAt: 0,
      queue: [],
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
      availableAt: 0,
      queue: [],
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
  ]);

  const [destinations] = useState<Destination[]>([
    {
      id: 'london',
      travelTime: 60,
      resourceId: 'coin',
      classes: ['common', 'rare', 'epic', 'legendary'],
    },
    {
      id: 'coal_mine',
      travelTime: 30,
      resourceId: 'coal',
      classes: ['common', 'rare', 'epic', 'legendary'],
    },
    {
      id: 'iron_ore_mine',
      travelTime: 30,
      resourceId: 'iron',
      classes: ['common', 'rare', 'epic', 'legendary'],
    },
    {
      id: 'steel_factory',
      travelTime: 180,
      resourceId: 'steel',
      classes: ['epic', 'legendary'],
    },
    {
      id: 'berlin',
      travelTime: 300,
      resourceId: 'coin',
      classes: ['common', 'rare', 'epic', 'legendary'],
    },
    {
      id: 'oakwood',
      travelTime: 300,
      resourceId: 'oakwood',
      classes: ['common', 'rare', 'epic', 'legendary'],
    },
    {
      id: 'copper_mine',
      travelTime: 300,
      resourceId: 'copper_ore',
      classes: ['common', 'rare', 'epic', 'legendary'],
    },
    {
      id: 'timber_factory',
      travelTime: 180,
      resourceId: 'timber',
      classes: ['epic', 'legendary'],
    },
  ]);

  const [warehouse, setWarehouse] = useState<Warehouse>({
    id: 'main_warehouse',
    name: 'Main Warehouse',
    maxCapacity: 1000,
    inventory: new Map([
      ['coal', 0],
      ['iron', 0],
      ['oakwood', 0],
      ['steel', 0],
      ['nails', 0],
      ['iron_powder', 0],
      ['saw_blade', 0],
      ['copper_ore', 0],
      ['copper', 0],
    ]),
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
        warehouseState: new Map(),
        trainCount: 0,
        description: 'First Level',
        estimatedTime: 0,
        done: false,
      },
    ],
    totalTime: 0,
    maxConcurrentWorkers: maxConcurrentTrains,
    activeLevel: 1,
  });

  // Create game state for calculator
  const gameState: GameState = {
    maxConcurrentTrains,
    resources,
    trains,
    orders,
    warehouse,
    factories,
    destinations,
  };

  // Update gameState when warehouse changes
  useEffect(() => {
    // This will trigger a re-render of components that use gameState
  }, [warehouse]);

  const handleOrderSubmit = (order: Order) => {
    setOrders([...orders, order]);
  };

  const handleProductionPlanChange = (plan: ProductionPlanType) => {
    setProductionPlan(plan);

    // Update warehouse inventory based on completed levels
    updateWarehouseInventory(plan);
  };

  const handleActiveLevelChange = (levelNumber: number) => {
    setActiveLevel(levelNumber);
  };

  const updateWarehouseInventory = (plan: ProductionPlanType) => {
    const newInventory = new Map(warehouse.inventory);

    // Process inventory changes from completed levels
    plan.levels.forEach(level => {
      if (level.done) {
        level.inventoryChanges.forEach((amount, resourceId) => {
          const currentAmount = newInventory.get(resourceId) || 0;
          newInventory.set(resourceId, currentAmount + amount);
        });
      }
    });

    setWarehouse(prev => ({
      ...prev,
      inventory: newInventory,
    }));
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
          warehouseState: new Map(),
          trainCount: 0,
          description: 'First Level',
          estimatedTime: 0,
          done: false,
        },
      ],
      totalTime: 0,
      maxConcurrentWorkers: maxConcurrentTrains,
      activeLevel: 1,
    });
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Idle Game Production Planner</h1>
      </header>

      <main className="container-fluid py-4">
        {/* Row 1: Current Orders and New Order Form */}
        <div className="d-flex gap-2">
          <div className="d-flex flex-fill justify-content-between flex-column">
            <CurrentOrders
              orders={orders}
              resources={resources}
              trains={trains}
              productionPlan={productionPlan}
              onProductionPlanChange={handleProductionPlanChange}
              maxConcurrentTrains={maxConcurrentTrains}
            />
            <ProductionPlan
              gameState={gameState}
              productionPlan={productionPlan}
              activeLevel={activeLevel}
              onActiveLevelChange={handleActiveLevelChange}
              onProductionPlanChange={handleProductionPlanChange}
              onClearPlan={clearProductionPlan}
            />
          </div>
          <div className="d-flex flex-fill justify-content-between flex-column">
            <div>
              <OrderForm
                resources={resources}
                onSubmit={handleOrderSubmit}
                onOrdersChange={setOrders}
              />
            </div>
            <div className="flex-shrink-1">
              <CurrentInventory
                gameState={gameState}
                activeLevel={activeLevel}
                productionPlan={productionPlan}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
