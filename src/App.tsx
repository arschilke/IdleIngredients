import { useState } from 'react';
import { OrderForm } from './OrderForm';
import { ProductionPlan } from './ProductionPlan';
import { CurrentInventory } from './CurrentInventory';
import { CurrentOrders } from './CurrentOrders';
import {
  Inventory,
  Order,
  ProductionPlan as ProductionPlanType,
} from './types';
import './styles.scss';
import {
  destinations,
  factories,
  maxConcurrentTrains,
  resources,
  trains,
} from './data';

function App() {
  const [inventory, setInventory] = useState<Inventory>(() => {
    const inventory = {} as Inventory;
    Object.keys(resources).forEach(resourceId => {
      inventory[resourceId] = 0;
    });
    return inventory;
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [activeLevel, setActiveLevel] = useState<number>(1);
  const [productionPlan, setProductionPlan] = useState<ProductionPlanType>({
    levels: {
      1: {
        level: 1,
        steps: [],
        inventoryChanges: new Map(),
        done: false,
      },
    },
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
    setInventory(getInventoryAtLevel(levelNumber));
    setActiveLevel(levelNumber);
  };

  const getInventoryAtLevel = (levelNumber: number): Inventory => {
    // Initialize inventory with zero for each resource
    const inventory: Inventory = {};
    Object.keys(resources).forEach(resourceId => {
      inventory[resourceId] = 0;
    });

    // Get all level numbers, sort them in ascending order
    const sortedLevels = Object.keys(productionPlan.levels)
      .map(Number)
      .filter(lvl => lvl <= levelNumber)
      .sort((a, b) => a - b);

    // Step through each level in order, applying inventory changes
    for (const lvl of sortedLevels) {
      const level = productionPlan.levels[lvl];
      if (!level) continue;
      for (const [resourceId, change] of level.inventoryChanges.entries()) {
        inventory[resourceId] += change;
      }
    }

    return inventory;
  };

  const clearProductionPlan = (): void => {
    setProductionPlan({
      levels: [
        {
          level: 1,
          steps: [],
          inventoryChanges: new Map(),
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
            inventory={inventory}
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
