import { useState } from 'react';
import { OrderForm } from '../../components/forms/OrderForm';
import { ProductionPlan } from './components/ProductionPlan';
import { CurrentInventory } from './components/CurrentInventory';
import { CurrentOrders } from './components/CurrentOrders';
import { Navbar } from '../../components/layout/Navbar';
import type {
  Order,
  ProductionPlan as ProductionPlanType,
} from '../../../types';
import '../../../styles.scss';
import { Db } from '../../../db';
import { useOrders, useAddOrder, useUpdateOrders } from '../../hooks/useOrders';
import { useProductionPlan, useUpdateProductionPlan, useClearProductionPlan } from '../../hooks/useProductionPlan';
import { useResources } from '../../hooks/useResources';
import { useFactories } from '../../hooks/useFactories';
import { useTrains } from '../../hooks/useTrains';
import { useDestinations } from '../../hooks/useDestinations';

const Dashboard = () => {
  const [activeLevel, setActiveLevel] = useState<number>(1);
  
  // React Query hooks
  const { data: orders = [], isLoading: ordersLoading } = useOrders();
  const { data: productionPlan, isLoading: planLoading } = useProductionPlan();
  const { data: resources = {}, isLoading: resourcesLoading } = useResources();
  const { data: factories = {}, isLoading: factoriesLoading } = useFactories();
  const { data: destinations = {}, isLoading: destinationsLoading } = useDestinations();
  const { data: trains = {}, isLoading: trainsLoading } = useTrains();
  
  const addOrderMutation = useAddOrder();
  const updateOrdersMutation = useUpdateOrders();
  const updateProductionPlanMutation = useUpdateProductionPlan();
  const clearProductionPlanMutation = useClearProductionPlan();

  const handleOrderSubmit = (order: Order) => {
    addOrderMutation.mutate(order);
  };

  const handleProductionPlanChange = (plan: ProductionPlanType) => {
    updateProductionPlanMutation.mutate(plan);
  };

  const handleActiveLevelChange = (levelNumber: number) => {
    setActiveLevel(levelNumber);
  };

  const handleClearProductionPlan = (): void => {
    clearProductionPlanMutation.mutate();
  };

  const handleOrdersChange = (newOrders: Order[]) => {
    updateOrdersMutation.mutate(newOrders);
  };

  // Show loading state while data is being fetched
  if (ordersLoading || planLoading || resourcesLoading || factoriesLoading || destinationsLoading || trainsLoading) {
    return (
      <div className="app">
        <Navbar />
        <main className="main-grid m-2 pb-2">
          <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Ensure we have a production plan
  const currentProductionPlan = productionPlan || {
    levels: {
      1: {
        level: 1,
        steps: [],
        inventoryChanges: new Map(),
        done: false,
      },
    },
    totalTime: 0,
    maxConcurrentWorkers: Db.maxConcurrentTrains,
  };

  return (
    <div className="app">
      <Navbar />

      <main className="main-grid m-2 pb-2">
        {/* Row 1: Current Orders and New Order Form */}

        <div className="current-orders">
          <CurrentOrders
            orders={orders}
            resources={resources}
            trains={trains}
            productionPlan={currentProductionPlan}
            activeLevel={activeLevel}
            onProductionPlanChange={handleProductionPlanChange}
            onOrdersChange={handleOrdersChange}
            maxConcurrentTrains={Db.maxConcurrentTrains}
          />
        </div>
        <div className="order-form">
          <OrderForm
            resources={resources}
            onSubmit={handleOrderSubmit}
            onOrdersChange={handleOrdersChange}
          />
        </div>
        <div className="production-plan">
          <ProductionPlan
            factories={factories}
            destinations={destinations}
            productionPlan={currentProductionPlan}
            activeLevel={activeLevel}
            trains={trains}
            maxConcurrentTrains={Db.maxConcurrentTrains}
            resources={resources}
            orders={orders}
            onActiveLevelChange={handleActiveLevelChange}
            onProductionPlanChange={handleProductionPlanChange}
            onOrdersChange={handleOrdersChange}
            onClearPlan={handleClearProductionPlan}
          />
        </div>

        <div className="current-inventory">
          <CurrentInventory
            resources={resources}
            inventory={{}}
            activeLevel={activeLevel}
            productionPlan={currentProductionPlan}
          />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
