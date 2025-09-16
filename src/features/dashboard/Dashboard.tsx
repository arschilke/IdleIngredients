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
  Train,
} from '../../types';
import '../../styles.scss';
import { Db } from '../../db';
import { useOrders, useUpdateOrders } from '../../hooks/useOrders';
import {
  useProductionPlan,
  useUpdateProductionPlan,
  useClearProductionPlan,
} from '../../hooks/useProductionPlan';
import { useResources } from '../../hooks/useResources';
import { getInventoryChanges } from '../../hooks/useInventory';
import { OrderList } from './components/OrderList';
import { useFactories } from '../../hooks/useFactories';
import { useTrains } from '../../hooks/useTrains';
import { getBestTrains } from '../../trains';
import { generateId } from '../../utils';
import {
  loadInitialInventoryFromStorage,
  saveInitialInventoryToStorage,
} from '../../lib/localStorageUtils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const Dashboard = () => {
  const [activeLevel, setActiveLevel] = useState<number>(1);
  const queryClient = useQueryClient();
  // React Query hooks
  const { data: productionPlan, isLoading: planLoading } = useProductionPlan();
  const { data: resources = {}, isLoading: resourcesLoading } = useResources();
  const { data: orders = [], isLoading: ordersLoading } = useOrders();
  const { data: trains = {}, isLoading: trainsLoading } = useTrains();
  const { data: factories = {}, isLoading: factoriesLoading } = useFactories();

  const { data: initialInventory, isLoading: initialInventoryLoading } =
    useQuery({
      queryKey: ['initial', resources],
      queryFn: async () => {
        const initialInventory = loadInitialInventoryFromStorage();
        if (initialInventory.size === 0) {
          return new Map(
            Object.values(resources).map(resource => [resource.id, 0])
          );
        }
        return initialInventory;
      },
      enabled: !!resources,
      staleTime: 1000 * 60 * 1, // 1 minute
    });

  const updateInitialInventoryMutation = useMutation({
    mutationFn: async (inventory: Map<string, number>) => {
      saveInitialInventoryToStorage(inventory);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['initial'] });
    },
  });

  const updateOrdersMutation = useUpdateOrders();
  const updateProductionPlanMutation = useUpdateProductionPlan();
  const clearProductionPlanMutation = useClearProductionPlan();

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
  if (
    planLoading ||
    resourcesLoading ||
    ordersLoading ||
    trainsLoading ||
    factoriesLoading ||
    initialInventoryLoading
  ) {
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

  const handlePlanProduction = (order: Order) => {
    if (!productionPlan) {
      return;
    }
    // Add to existing active level
    const activeLevelData = productionPlan.levels[activeLevel];

    if (!activeLevelData) {
      return;
    }

    const jobs: Step[] = [];
    if (order.type === 'story') {
      const selectedTrains = getBestTrains(
        activeLevelData,
        order.resources[0].amount,
        trains as Record<string, Train>,
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

    handleProductionPlanChange(updatedPlan);
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
            maxConcurrentTrains={Db.maxConcurrentTrains}
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
