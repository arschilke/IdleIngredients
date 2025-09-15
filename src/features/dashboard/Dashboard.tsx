import { useState } from 'react';
import { OrderForm } from '../../components/forms/OrderForm';
import { ProductionPlan } from './components/ProductionPlan';
import { CurrentInventory } from './components/CurrentInventory';
import { CurrentOrders } from './components/CurrentOrders';
import { Navbar } from '../../components/layout/Navbar';
import type { Order, ProductionPlan as ProductionPlanType } from '../../types';
import '../../styles.scss';
import { Db } from '../../db';
import { useAddOrder, useUpdateOrders } from '../../hooks/useOrders';
import {
  useProductionPlan,
  useUpdateProductionPlan,
  useClearProductionPlan,
} from '../../hooks/useProductionPlan';
import { useResources } from '../../hooks/useResources';

const Dashboard = () => {
  const [activeLevel, setActiveLevel] = useState<number>(1);

  // React Query hooks
  const { data: productionPlan, isLoading: planLoading } = useProductionPlan();
  const { data: resources = {}, isLoading: resourcesLoading } = useResources();

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
  if (planLoading || resourcesLoading) {
    return (
      <div className="app">
        <Navbar />
        <main className="main-grid m-2 pb-2">
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: '400px' }}
          >
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
        inventoryChanges: new Map<string, number>(),
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
            productionPlan={currentProductionPlan}
            activeLevel={activeLevel}
            maxConcurrentTrains={Db.maxConcurrentTrains}
            onActiveLevelChange={handleActiveLevelChange}
            onProductionPlanChange={handleProductionPlanChange}
            onOrdersChange={handleOrdersChange}
            onClearPlan={handleClearProductionPlan}
          />
        </div>

        <div className="current-inventory">
          <CurrentInventory
            resources={resources}
            activeLevel={activeLevel}
            productionPlan={currentProductionPlan}
          />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
