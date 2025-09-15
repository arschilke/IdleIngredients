import type {
  Order,
  ProductionPlan,
  BoatOrder,
  Step,
  DeliveryStep,
  SubmitStep,
} from '../../../types';
import { formatTime, generateId } from '../../../utils';
import { getInventoryChanges } from '../../../hooks/useInventory';
import React from 'react';
import { getBestTrains } from '../../../trains';
import { useOrders } from '../../../hooks/useOrders';
import { useResources } from '../../../hooks/useResources';
import { useTrains } from '../../../hooks/useTrains';
import { useFactories } from '../../../hooks/useFactories';

interface CurrentOrdersProps {
  productionPlan: ProductionPlan;
  activeLevel: number;
  onProductionPlanChange: (plan: ProductionPlan) => void;
  onOrdersChange: (orders: Order[]) => void;
  maxConcurrentTrains: number;
}

export const CurrentOrders: React.FC<CurrentOrdersProps> = ({
  productionPlan,
  activeLevel,
  onProductionPlanChange,
  onOrdersChange,
}) => {
  const { data: orders } = useOrders();
  const { data: resources } = useResources();
  const { data: trains } = useTrains();
  const { data: factories } = useFactories();
  if (!orders || !resources || !trains || !factories) {
    return <div>Loading...</div>;
  }
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
        trains,
        order.classes,
        order.country ? [order.country] : undefined
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
      factories!,
      trains!,
      orders
    );

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
    <div className="card flex-fill h-100">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h2 className="h4 mb-0">Current Orders</h2>
      </div>
      <div className="card-body">
        <div className="orders-grid">
          <div className="row row-cols-2 g-2">
            {orders.map(order => {
              return (
                <div key={order.id} className="col">
                  <div className="card bg-opacity-10 bg-light flex-shrink-0 shadow-sm">
                    <div className="card-header d-flex align-items-center">
                      <span className={`badge order-type-${order.type}`}>
                        {order.type.charAt(0).toUpperCase() +
                          order.type.slice(1)}
                      </span>
                      <h6 className="mb-0 ms-2">{order.name}</h6>
                      {/* Close (delete) button */}
                      <button
                        type="button"
                        className="btn-close position-absolute top-0 end-0 m-2"
                        aria-label="Delete order"
                        onClick={() => {
                          // Remove the order from the list
                          const updatedOrders = orders.filter(
                            o => o.id !== order.id
                          );
                          onOrdersChange(updatedOrders);
                        }}
                        style={{ zIndex: 2 }}
                      />
                    </div>

                    <div className="card-body">
                      {order.type === 'boat' && (
                        <p className="small text-warning mb-1">
                          <i className="bi bi-clock me-1"></i>
                          Expires in:{' '}
                          {formatTime((order as BoatOrder).expirationTime)}
                        </p>
                      )}
                      <div>
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
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
