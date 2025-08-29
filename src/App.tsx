import { useState } from 'react';
import { OrderForm } from './OrderForm';
import { ProductionPlan } from './ProductionPlan';
import { CurrentInventory } from './CurrentInventory';
import { CurrentOrders } from './CurrentOrders';
import { ProductionCalculator } from './calculator';
import { Order, Resource, Train, Factory, Destination, Warehouse, GameState, ProductionPlan as ProductionPlanType } from './types';
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
    { id: 'copper', name: 'Copper' }
  ]);

  const [trains] = useState<Train[]>([
    { id: 'train1', name: 'Train 1', capacity: 10, availableAt: 0, class: 'common' },
    { id: 'train2', name: 'Train 2', capacity: 15, availableAt: 0, class: 'rare' },
    { id: 'train3', name: 'Train 3', capacity: 12, availableAt: 0, class: 'epic' },
    { id: 'train4', name: 'Train 4', capacity: 8, availableAt: 0, class: 'legendary' },
    { id: 'train5', name: 'Train 5', capacity: 20, availableAt: 0, class: 'common' },
    { id: 'train6', name: 'Train 6', capacity: 14, availableAt: 0, class: 'rare' },
    { id: 'train7', name: 'Train 7', capacity: 16, availableAt: 0, class: 'epic' },
    { id: 'train8', name: 'Train 8', capacity: 11, availableAt: 0, class: 'legendary' }
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
          requires: [{ resourceId: 'iron', amount: 10 }, { resourceId: 'coal', amount: 30 }],
          outputAmount: 40
        },
        {
          resourceId: 'copper',
          timeRequired: 500,
          requires: [{ resourceId: 'copper_ore', amount: 40 }],
          outputAmount: 40
        }
      ]
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
          requires: [{
            resourceId: 'iron',
            amount: 30
          }],
          outputAmount: 30
        }, {
          resourceId: 'nails',
          timeRequired: 600,
          requires: [{
            resourceId: 'steel',
            amount: 40
          }],
          outputAmount: 40
        }, {
          resourceId: 'saw_blade',
          timeRequired: 1200,
          requires: [{
            resourceId: 'steel',
            amount: 40
          }, {
            resourceId: 'iron_powder',
            amount: 30
          }],
          outputAmount: 70
        }, {
          resourceId: 'copper_wire',
          timeRequired: (25 * 60),
          requires: [{
            resourceId: 'copper',
            amount: 80
          }, {
            resourceId: 'copper_ore',
            amount: 30
          }],
          outputAmount: 30
        }
      ]
    }
  ]);

  const [destinations] = useState<Destination[]>([
    { id: 'london', travelTime: 60, resourceId: 'coin', classes: ['common', 'rare', 'epic', 'legendary'] },
    { id: 'coal_mine', travelTime: 30, resourceId: 'coal', classes: ['common', 'rare', 'epic', 'legendary'] },
    { id: 'iron_ore_mine', travelTime: 30, resourceId: 'iron', classes: ['common', 'rare', 'epic', 'legendary'] },
    { id: 'steel_factory', travelTime: 180, resourceId: 'steel', classes: ['epic', 'legendary'] },
    { id: 'berlin', travelTime: 300, resourceId: 'coin', classes: ['common', 'rare', 'epic', 'legendary'] },
    { id: 'oakwood', travelTime: 300, resourceId: 'oakwood', classes: ['common', 'rare', 'epic', 'legendary'] },
    { id: 'copper_mine', travelTime: 300, resourceId: 'copper_ore', classes: ['common', 'rare', 'epic', 'legendary'] },
    { id: 'timber_factory', travelTime: 180, resourceId: 'timber', classes: ['epic', 'legendary'] }
  ]);

  const [warehouse] = useState<Warehouse>(
    {
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
        ['copper', 0]
      ])
    }
  );

  const [orders, setOrders] = useState<Order[]>([]);
  const [productionPlan, setProductionPlan] = useState<ProductionPlanType>({
    levels: [{
      level: 0,
      startTime: 0,
      endTime: 0,
      steps: [],
      inventoryChanges: new Map(),
      trainCount: 0,
      isOverCapacity: false,
      description: 'First Level',
      estimatedTime: 0,
      done: false
    }],
    totalTime: 0,
    maxConcurrentWorkers: maxConcurrentTrains,
    activeLevel: 0
  });
  const [activeLevel, setActiveLevel] = useState<number>(1);

  // Create game state for calculator
  const gameState: GameState = {
    resources,
    trains,
    orders,
    warehouse,
    factories,
    destinations,
    productionPlan,
  };

  const calculator = new ProductionCalculator(gameState);

  const handleOrderSubmit = (order: Order) => {
    setOrders([...orders, order]);
  };

  const handleProductionPlanChange = (plan: ProductionPlanType) => {
    setProductionPlan(plan);
  };

  const handleActiveLevelChange = (level: number) => {
    setActiveLevel(level);
  };

  const markLevelAsDone = (levelNumber: number) => {
    if (!productionPlan) return;

    const updatedLevels = productionPlan.levels.map(level =>
      level.level === levelNumber ? { ...level, done: true } : level
    );

    setProductionPlan({
      ...productionPlan,
      levels: updatedLevels
    });
  };

  const removeLevel = (levelNumber: number) => {
    if (!productionPlan) return;

    const updatedLevels = productionPlan.levels
      .filter(level => level.level !== levelNumber)
      .map((level, index) => ({ ...level, level: index + 1 }));

    setProductionPlan({
      ...productionPlan,
      levels: updatedLevels
    });

    // Adjust active level if needed
    if (activeLevel === levelNumber) {
      setActiveLevel(updatedLevels.length > 0 ? 1 : 1);
    } else if (activeLevel > levelNumber) {
      setActiveLevel(activeLevel - 1);
    }
  };

  const clearProductionPlan = () => {
    setProductionPlan({
      levels: [{
        level: 0,
        startTime: 0,
        endTime: 0,
        steps: [],
        inventoryChanges: new Map(),
        trainCount: 0,
        isOverCapacity: false,
        description: 'First Level',
        estimatedTime: 0,
        done: false
      }],
      totalTime: 0,
      maxConcurrentWorkers:
        maxConcurrentTrains,
      activeLevel: 0
    });
    setActiveLevel(0);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Idle Game Production Planner</h1>
        <p>Plan your production steps and manage resources</p>
      </header>

      <main className="container-fluid py-4">
        {/* Row 1: Current Orders and New Order Form */}
        <div className="row g-4 mb-4">
          <div className="col-auto col-md">
            <CurrentOrders
              orders={orders}
              resources={resources}
              trains={trains}
              productionPlan={productionPlan}
              onProductionPlanChange={handleProductionPlanChange}
              maxConcurrentTrains={maxConcurrentTrains}
            />
          </div>
          <div className="col">
            <OrderForm
              resources={resources}
              onSubmit={handleOrderSubmit}
              onOrdersChange={setOrders}
            />
          </div>
        </div>

        {/* Row 2: Production Plan and Current Inventory */}
        <div className="row g-4">
          <div className="col-lg-8">
            <ProductionPlan
              gameState={gameState}
              productionPlan={productionPlan}
              activeLevel={activeLevel}
              onProductionPlanChange={handleProductionPlanChange}
              onActiveLevelChange={handleActiveLevelChange}
              onMarkLevelDone={markLevelAsDone}
              onRemoveLevel={removeLevel}
              onClearPlan={clearProductionPlan}
            />
          </div>
          <div className="col-lg-4">
            <CurrentInventory
              gameState={gameState}
              activeLevel={activeLevel}
              productionPlan={productionPlan}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
