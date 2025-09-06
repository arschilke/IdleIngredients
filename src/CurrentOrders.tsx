import React from 'react';
import {
  Order,
  Resource,
  ProductionPlan,
  BoatOrder,
  Train,
  Step,
  DeliveryStep,
  SubmitStep,
} from './types';
import { formatTime, generateId } from './utils';
import { getBestTrains } from './trainUtils';
import { getInventoryChanges } from './inventoryUtils';

interface CurrentOrdersProps {
  orders: Order[];
  resources: Record<string, Resource>;
  trains: Record<string, Train>;
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
    const activeLevelData = productionPlan.levels[activeLevel];

    if (!activeLevelData) {
      return;
    }

    const jobs: Step[] = [];
    if (order.type === 'story') {
      const selectedTrains = getBestTrains(
        activeLevelData,
        order.resources[0].amount,
        trains
      );
      let trainsIndex = 0;
      while (trainsIndex < selectedTrains.length) {
        jobs.push({
          id: generateId('step'),
          type: 'delivery',
          resourceId: order.resources[0].resourceId,
          levelId: activeLevel,
          trainId: selectedTrains[trainsIndex].id,
          order: order,
        } as DeliveryStep);
        trainsIndex++;
      }
    } else {
      for (let i = 0; i < order.resources.length; i++) {
        jobs.push({
          id: generateId('step'),
          type: 'submit',
          order: order,
          levelId: activeLevel,
          resourceId: order.resources[i].resourceId,
        } as SubmitStep);
      }
    }

    // Add to existing Level

    var updatedSteps = [...activeLevelData.steps, ...jobs];

    const updatedLevel = {
      ...activeLevelData,
      steps: updatedSteps,
    };
    updatedLevel.inventoryChanges = getInventoryChanges(updatedLevel);

    const updatedPlan = {
      ...productionPlan,
      levels: { ...productionPlan.levels, [updatedLevel.level]: updatedLevel },
    };

    onProductionPlanChange(updatedPlan);
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
          <button className="btn btn-success btn-sm" onClick={() => {}}>
            <i className="bi bi-download me-1"></i>
            Export
          </button>
          <label className="btn btn-primary btn-sm mb-0">
            <i className="bi bi-upload me-1"></i>
            Import
            <input
              type="file"
              accept=".json"
              onChange={() => {}}
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
                className="card bg-opacity-10 bg-light flex-shrink-0 position-relative"
              >
                {/* Close (delete) button */}
                <button
                  type="button"
                  className="btn-close position-absolute top-0 end-0 m-2"
                  aria-label="Delete order"
                  onClick={() => {
                    // Remove the order from the list
                    const updatedOrders = orders.filter(o => o.id !== order.id);
                    onOrdersChange(updatedOrders);
                  }}
                  style={{ zIndex: 2 }}
                />

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
                          const resource = resources[req.resourceId];
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
