import { useState } from 'react';
import { OrderForm } from './OrderForm';
import { ProductionPlan } from './ProductionPlan';
import { CurrentInventory } from './CurrentInventory';
import { CurrentOrders } from './CurrentOrders';
import { ProductionCalculator } from './calculator';
import { Order, Resource, Worker, Factory, Destination, Warehouse, GameState } from './types';
import './index.css';

function App() {
  const [resources] = useState<Resource[]>([
    { id: 'coal', name: 'Coal' },
    { id: 'iron', name: 'Iron' },
    { id: 'oakwood', name: 'Oakwood'  },
    { id: 'steel', name: 'Steel' },
    { id: 'nails', name: 'Nails' },
    { id: 'iron_powder', name: 'Iron Powder'},
    { id: 'saw_blade', name: 'Saw Blade'},
    { id: 'copper_ore', name: 'Copper Ore'},
    { id: 'copper', name: 'Copper'}
  ]);

  const [workers] = useState<Worker[]>([
    { id: 'worker1', name: 'Worker 1', capacity: 10, availableAt: 0 },
    { id: 'worker2', name: 'Worker 2', capacity: 15, availableAt: 0 },
    { id: 'worker3', name: 'Worker 3', capacity: 12, availableAt: 0 },
    { id: 'worker4', name: 'Worker 4', capacity: 8, availableAt: 0 },
    { id: 'worker5', name: 'Worker 5', capacity: 20, availableAt: 0 },
    { id: 'worker6', name: 'Worker 6', capacity: 14, availableAt: 0 },
    { id: 'worker7', name: 'Worker 7', capacity: 16, availableAt: 0 },
    { id: 'worker8', name: 'Worker 8', capacity: 11, availableAt: 0 }
  ]);

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
          requires: [ { resourceId: 'copper_ore', amount: 40 }],
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
          },{
            resourceId: 'copper_ore',
            amount: 30
          }],
          outputAmount: 30
        }
      ]
    }
  ]);

  const [destinations] = useState<Destination[]>([
    { id: 'coal_mine', travelTime: 120, resourceId: 'coal' },
    { id: 'iron_mine', travelTime: 180, resourceId: 'iron' },
    { id: 'oak_forest', travelTime: 90, resourceId: 'oakwood' },
    { id: 'copper_mine', travelTime: 240, resourceId: 'copper_ore' }
  ]);

  const [warehouses] = useState<Warehouse[]>([
    {
      id: 'main_warehouse',
      name: 'Main Warehouse',
      maxCapacity: 1000,
      inventory: new Map([
        ['coal', 50],
        ['iron', 30],
        ['oakwood', 20],
        ['steel', 10],
        ['nails', 5],
        ['iron_powder', 15],
        ['saw_blade', 2],
        ['copper_ore', 25],
        ['copper', 8]
      ])
    }
  ]);

  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [activeLevel, setActiveLevel] = useState<number>(1);

  // Create game state for calculator
  const gameState: GameState = {
    resources,
    workers,
    orders,
    warehouses,
    factories,
    destinations
  };

  const calculator = new ProductionCalculator(gameState);

  const handleOrderSubmit = (order: Order) => {
    setOrders([...orders, order]);
    setCurrentOrder(order);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Idle Game Production Planner</h1>
        <p>Plan your production steps and manage resources</p>
      </header>

      <main className="dashboard">
        {/* Row 1: Current Orders and New Order Form */}
        <div className="dashboard-row">
          <div className="dashboard-panel">
            <CurrentOrders 
              orders={orders}
              resources={resources}
              onOrderSelect={setCurrentOrder}
            />
          </div>
          <div className="dashboard-panel">
            <OrderForm
              resources={resources}
              onSubmit={handleOrderSubmit}
              existingOrders={orders}
              onOrdersChange={setOrders}
            />
          </div>
        </div>

        {/* Row 2: Production Plan and Current Inventory */}
        <div className="dashboard-row">
          <div className="dashboard-panel">
            <ProductionPlan
              order={currentOrder}
              calculator={calculator}
              gameState={gameState}
              activeLevel={activeLevel}
              onActiveLevelChange={setActiveLevel}
            />
          </div>
          <div className="dashboard-panel">
            <CurrentInventory
              gameState={gameState}
              activeLevel={activeLevel}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
