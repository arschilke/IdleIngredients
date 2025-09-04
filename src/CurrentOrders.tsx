import React from 'react';
import {
  Order,
  Resource,
  ProductionPlan,
  PlannedStep,
  BoatOrder,
  StoryOrder,
  Train,
} from './types';
import { formatTime } from './utils';
import { getBestTrains } from './trainUtils';
import { exportOrdersAndPlan, importOrdersAndPlan } from './exportUtils';

interface CurrentOrdersProps {
  orders: Order[];
  resources: Resource[];
  trains: Train[];
  productionPlan: ProductionPlan;
  activeLevel: number;
  onProductionPlanChange: (plan: ProductionPlan) => void;
  onOrdersChange: (orders: Order[]) => void;
  maxConcurrentTrains: number;
}

export function CurrentOrders({
  orders,
  resources,
  trains,
  productionPlan,
  activeLevel,
  onProductionPlanChange,
  onOrdersChange,
}: CurrentOrdersProps) {
  // Calculate delivered amounts for each order's resource requirements

  const handlePlanProduction = (order: Order) => {
    if (!productionPlan) {
      return;
    }
    // Add to existing active level
    const activeLevelData = productionPlan.levels.find(
      level => level.level === activeLevel
    );

    if (!activeLevelData) {
      return;
    }
    const deliveredAmount =
      calculateDeliveredAmounts().get(order.resources[0].resourceId) || 0;
    const selectedTrains = getBestTrains(
      activeLevelData,
      order.resources[0].amount - deliveredAmount,
      trains
    );

    const deliveryJobs: PlannedStep[] = [];
    for (let train of selectedTrains) {
      deliveryJobs.push({
        id: `delivery_${order.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'delivery',
        resourceId: order.resources[0].resourceId,
        level: activeLevelIndex,
        trainId: train.id,
        timeRequired:
          order.type === 'story' ? (order as StoryOrder).travelTime : 0,
        order: order,
        amountProcessed: train.capacity,
        dependencies: [],
      });
    }

    // Add to existing Level

    var updatedSteps = [...activeLevel.steps, ...deliveryJobs];

    const updatedLevel = {
      ...activeLevel,
      trainCount: updatedSteps.filter(step => step.trainId !== undefined)
        .length,
      steps: updatedSteps,
      estimatedTime: Math.max(...updatedSteps.map(j => j.timeRequired)),
    };

    const updatedPlan = {
      ...productionPlan,
      levels: productionPlan.levels.map(level =>
        level.level === activeLevelIndex ? updatedLevel : level
      ),
    };

    onProductionPlanChange(updatedPlan);
  };

  const handleExport = () => {
    exportOrdersAndPlan(orders, productionPlan);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    importOrdersAndPlan(file)
      .then(data => {
        onOrdersChange(data.orders);
        if (data.productionPlan) {
          onProductionPlanChange(data.productionPlan);
        }
        // Show success message
        alert(
          `Successfully imported ${data.orders.length} orders${data.productionPlan ? ' and production plan' : ''}`
        );
        // Reset the file input
        event.target.value = '';
      })
      .catch(error => {
        alert(`Import failed: ${error.message}`);
        event.target.value = '';
      });
  };

  if (orders.length === 0) {
    return (
      <div className="card flex-fill flex-shrink-1">
        <div className="card-header">
          <h2 className="h4 mb-0">Current Orders</h2>
        </div>
        <div className="card-body text-center">
          <p className="text-muted mb-0">
            No orders yet. Create your first order!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card flex-fill">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h2 className="h4 mb-0">Current Orders</h2>
        <div className="d-flex gap-2">
          <button className="btn btn-success btn-sm" onClick={handleExport}>
            <i className="bi bi-download me-1"></i>
            Export
          </button>
          <label className="btn btn-primary btn-sm mb-0">
            <i className="bi bi-upload me-1"></i>
            Import
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>
      <div className="card-body">
        <div className="orders-container position-relative">
          <div className="d-flex flex-row gap-3 overflow-hidden">
            {orders.map(order => (
              <div
                key={order.id}
                className="card bg-opacity-10 bg-light flex-shrink-0"
              >
                <div className="card-body">
                  <div className="d-flex justify-content-between gap-1 align-items-start mb-2">
                    <span className={`badge order-type-${order.type}`}>
                      {order.type.charAt(0).toUpperCase() + order.type.slice(1)}
                    </span>
                    <h6 className="mb-0">{order.name}</h6>
                  </div>
                  <div className="mb-2">
                    {order.type === 'boat' && (
                      <p className="small text-warning mb-1">
                        <i className="bi bi-clock me-1"></i>
                        Expires in:{' '}
                        {formatTime((order as BoatOrder).expirationTime)}
                      </p>
                    )}
                    <div className="mt-2">
                      <small className="text-muted d-block mb-1">
                        Resources:
                      </small>
                      <div className="d-flex flex-wrap gap-1">
                        {order.resources.map((req, index) => {
                          const resource = resources.find(
                            r => r.id === req.resourceId
                          );
                          return (
                            <span key={index} className="badge bg-secondary">
                              {resource?.name || req.resourceId}:{' '}
                              {req?.delivered || 0}/{req.amount}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <button
                    className="btn btn-primary btn-sm w-100"
                    onClick={() => handlePlanProduction(order)}
                  >
                    <i className="bi bi-gear me-1"></i>
                    Plan Production
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="fade-overlay-right"></div>
        </div>
      </div>
    </div>
  );
}
