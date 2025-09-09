import { useState, useEffect } from 'react';
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
import { getInventoryAtLevel } from './inventoryUtils';
import { loadOrdersFromStorage, saveOrdersToStorage } from './utils';

function App() {
  const [inventory, setInventory] = useState<Inventory>(() => {
    const inventory = {} as Inventory;
    Object.keys(resources).forEach(resourceId => {
      inventory[resourceId] = 0;
    });
    return inventory;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    return loadOrdersFromStorage();
  });
  const [activeLevel, setActiveLevel] = useState<number>(1);

  // Save orders to localStorage whenever they change
  useEffect(() => {
    saveOrdersToStorage(orders);
  }, [orders]);
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
    setInventory(getInventoryAtLevel(plan, activeLevel));
  };

  const handleActiveLevelChange = (levelNumber: number) => {
    setInventory(getInventoryAtLevel(productionPlan, levelNumber));
    setActiveLevel(levelNumber);
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
