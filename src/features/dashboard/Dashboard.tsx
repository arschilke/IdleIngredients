import { useState } from 'react';
import { ProductionPlan } from './components/ProductionPlan';
import { CurrentInventory } from './components/CurrentInventory';
import { Navbar } from '../../components/layout/Navbar';
import type {
  Order,
  ProductionPlan as ProductionPlanType,
  SubmitStep,
  DeliveryStep,
  Step,
  PlanningLevel,
} from '../../types';
import '../../styles.scss';
import { getInventoryChanges } from '../../hooks/useInventory';
import { OrderList } from './components/OrderList';
import { getBestTrains } from '../../trains';
import { generateId } from '../../utils';

import {
  maxConcurrentTrains,
  productionPlanCollection,
  defaultProductionPlan,
  trainsCollection,
} from '../../lib/db';
import { eq, useLiveQuery } from '@tanstack/react-db';

const Dashboard = () => {
  const [activeLevel, setActiveLevel] = useState<number>(1);

  const { data: productionPlans, isLoading: productionPlanLoading } =
    useLiveQuery(q =>
      q
        .from({ plan: productionPlanCollection })
        .where(({ plan }) => eq(plan.id, '1'))
    );

  const productionPlan = productionPlans?.[0];

  const handleProductionPlanChange = async (plan: ProductionPlanType) => {
    const tx = productionPlanCollection.update('1', draft => {
      return { ...draft, ...plan };
    });
    await tx.isPersisted.promise;
  };

  const handleActiveLevelChange = (levelNumber: number) => {
    setActiveLevel(levelNumber);
  };

  const handleClearProductionPlan = async () => {
    const tx = productionPlanCollection.update('1', _ => {
      return defaultProductionPlan;
    });
    await tx.isPersisted.promise;
  };

  // Show loading state while data is being fetched
  if (productionPlanLoading) {
    return (
      <div className="app">
        <Navbar />
        <main className="main-grid">
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

  const handlePlanProduction = (order: Order) => {
    if (!productionPlan) {
      return;
    }
    // Add to existing active level
    const activeLevelData = productionPlan.levels[activeLevel] as PlanningLevel;

    if (!activeLevelData) {
      return;
    }

  

    const jobs: Step[] = [];
    if (order.type === 'story') {
      const selectedTrains = getBestTrains(
        activeLevelData,
        order.resources[0].amount,
        trains!,
        order.classes,
        order.countries ? order.countries : undefined
      );

      let trainsIndex = 0;
      while (trainsIndex < selectedTrains.length) {
        jobs.push({
          id: generateId('step'),
          type: 'delivery',
          resourceId: order.resources[0].resourceId,
          levelId: activeLevel,
          trainId: selectedTrains[trainsIndex].id,
          orderId: order.id,
          timeRequired: 0,
        } as DeliveryStep);
        trainsIndex++;
      }
    } else {
      for (let i = 0; i < order.resources.length; i++) {
        jobs.push({
          id: generateId('step'),
          type: 'submit',
          orderId: order.id,
          timeRequired: 0,
          levelId: activeLevel,
          resourceId: order.resources[i].resourceId,
        } as SubmitStep);
      }
    }

    // Add to existing Level

    const updatedSteps = [...activeLevelData.steps, ...jobs];

    const updatedLevel = {
      ...activeLevelData,
      steps: updatedSteps,
    };
    updatedLevel.inventoryChanges = getInventoryChanges(
      updatedLevel,
      factories,
      trains,
      orders
    );

    const updatedPlan = {
      ...productionPlan,
      levels: { ...productionPlan.levels, [updatedLevel.level]: updatedLevel },
    };

    handleProductionPlanChange(updatedPlan as ProductionPlanType);
  };

  return (
    <div className="app">
      <Navbar />

      <main className="main-grid">
        {/* Row 1: Current Orders and New Order Form */}

        <div className="current-orders">
          <OrderList
            orders={orders!}
            resources={resources}
            onOrdersChange={handleOrdersChange}
            onPlanProduction={handlePlanProduction}
          />
        </div>

        <div className="current-inventory">
          <CurrentInventory
            resources={resources}
            activeLevel={activeLevel}
            productionPlan={currentProductionPlan}
            initialInventory={initialInventory!}
            onInitialInventoryChange={updateInitialInventoryMutation.mutate}
          />
        </div>
        <div className="production-plan">
          <ProductionPlan
            productionPlan={currentProductionPlan}
            activeLevel={activeLevel}
            maxConcurrentTrains={maxConcurrentTrains}
            onActiveLevelChange={handleActiveLevelChange}
            onProductionPlanChange={handleProductionPlanChange}
            onOrdersChange={handleOrdersChange}
            onClearPlan={handleClearProductionPlan}
          />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
