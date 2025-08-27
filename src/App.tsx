import { useState } from 'react';
import { OrderForm } from './OrderForm';
import { ProductionResults } from './ProductionResults';
import { ResourceManager } from './ResourceManager';
import { WorkerManager } from './WorkerManager';
import { ProductionCalculator } from './calculator';
import { Order, Resource, Worker, Factory, Destination, ProductionPlan, Warehouse } from './types';
import './index.css';

function App() {
  const [resources, setResources] = useState<Resource[]>([
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

  const [workers, setWorkers] = useState<Worker[]>([
    { id: 'worker1', name: 'Worker 1', capacity: 10, availableAt: 0 },
    { id: 'worker2', name: 'Worker 2', capacity: 15, availableAt: 0 },
    { id: 'worker3', name: 'Worker 3', capacity: 12, availableAt: 0 },
    { id: 'worker4', name: 'Worker 4', capacity: 8, availableAt: 0 },
    { id: 'worker5', name: 'Worker 5', capacity: 20, availableAt: 0 },
    { id: 'worker6', name: 'Worker 6', capacity: 14, availableAt: 0 },
    { id: 'worker7', name: 'Worker 7', capacity: 16, availableAt: 0 },
    { id: 'worker8', name: 'Worker 8', capacity: 11, availableAt: 0 }
  ]);

  const [factories, setFactories] = useState<Factory[]>([
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
    },
  ]);

  const [destinations, setDestinations] = useState<Destination[]>([
    { id: 'iron_mine', travelTime: 30, resourceId: 'iron' },
    { id: 'coal_mine', travelTime: 30, resourceId: 'coal' },
    { id: 'copper_mine', travelTime: 600, resourceId: 'copper_ore' }
  ]);

  const [warehouses, setWarehouses] = useState<Warehouse[]>([
    {
      id: 'main_warehouse',
      name: 'Main Warehouse',
      inventory: new Map([
        ['coal', 100],
        ['iron', 150],
        ['oakwood', 200],
        ['steel', 50],
        ['nails', 25],
        ['iron_powder', 75],
        ['saw_blade', 10],
        ['copper_ore', 80],
        ['copper', 30]
      ]),
      maxCapacity: 10000
    }
  ]);

  const [orders, setOrders] = useState<Order[]>([]);
  const [productionPlan, setProductionPlan] = useState<ProductionPlan | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'results' | 'resources' | 'workers' | 'warehouse'>('orders');

  const calculateProduction = (order: Order) => {
    try {
      const calculator = new ProductionCalculator(resources, workers, factories, destinations, warehouses);
      const plan = calculator.calculateProductionPlan(order);
      setProductionPlan(plan);
      setActiveTab('results');
    } catch (error) {
      console.error('Error calculating production plan:', error);
      alert('Error calculating production plan. Please check the console for details.');
    }
  };

  const addOrder = (order: Order) => {
    setOrders([...orders, order]);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🏭 Idle Ingredients Production Planner</h1>
        <p>Optimize your production chains and worker assignments</p>
      </header>

      <nav className="app-nav">
        <button 
          className={`nav-button ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          📋 Orders
        </button>
        <button 
          className={`nav-button ${activeTab === 'results' ? 'active' : ''}`}
          onClick={() => setActiveTab('results')}
          disabled={!productionPlan}
        >
          🚀 Results
        </button>
        <button 
          className={`nav-button ${activeTab === 'resources' ? 'active' : ''}`}
          onClick={() => setActiveTab('resources')}
        >
          🏗️ Resources
        </button>
        <button 
          className={`nav-button ${activeTab === 'workers' ? 'active' : ''}`}
          onClick={() => setActiveTab('workers')}
        >
          👥 Workers
        </button>
        <button 
          className={`nav-button ${activeTab === 'warehouse' ? 'active' : ''}`}
          onClick={() => setActiveTab('warehouse')}
        >
          🏪 Warehouse
        </button>
      </nav>

      <main className="app-main">
        {activeTab === 'orders' && (
          <div>
            <OrderForm resources={resources} onSubmit={addOrder} />
            {orders.length > 0 && (
              <div className="orders-list">
                <h2>📋 Current Orders</h2>
                {orders.map((order) => (
                  <div key={order.id} className="order-item">
                    <div className="order-info">
                      <h3>{order.name}</h3>
                      <p>Resource: {resources.find(r => r.id === order.resourceId)?.name || order.resourceId}</p>
                      <p>Amount: {order.amount}</p>
                    </div>
                    <button 
                      className="btn btn-primary"
                      onClick={() => calculateProduction(order)}
                    >
                      Calculate Production
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'results' && productionPlan && (
          <ProductionResults productionPlan={productionPlan} workers={workers} />
        )}

        {activeTab === 'resources' && (
          <ResourceManager 
            resources={resources} 
            onResourcesChange={setResources}
            factories={factories}
            onFactoriesChange={setFactories}
            destinations={destinations}
            onDestinationsChange={setDestinations}
          />
        )}

        {activeTab === 'workers' && (
          <WorkerManager 
            workers={workers} 
            onWorkersChange={setWorkers} 
          />
        )}

        {activeTab === 'warehouse' && (
          <WarehouseManager 
            warehouses={warehouses}
            onWarehousesChange={setWarehouses}
            resources={resources}
          />
        )}
      </main>
    </div>
  );
}

export default App;
