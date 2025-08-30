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

interface CurrentOrdersProps {
  orders: Order[];
  resources: Resource[];
  trains: Train[];
  productionPlan: ProductionPlan | null;
  onProductionPlanChange: (plan: ProductionPlan) => void;
  maxConcurrentTrains: number;
}

export function CurrentOrders({
  orders,
  resources,
  trains,
  productionPlan,
  onProductionPlanChange,
}: CurrentOrdersProps) {
  // Calculate delivered amounts for each order's resource requirements
  const calculateDeliveredAmounts = (order: Order): Map<string, number> => {
    if (!productionPlan) return new Map();

    const deliveredAmounts = new Map<string, number>();

    // Initialize all resource requirements with 0 delivered
    order.resources.forEach(req => {
      deliveredAmounts.set(req.resourceId, 0);
    });

    // Sum up amounts from completed delivery steps for this order
    productionPlan.levels.forEach(level => {
      if (level.done) {
        level.steps.forEach(step => {
          if (step.type === 'delivery' && step.order?.id === order.id) {
            const currentAmount = deliveredAmounts.get(step.resourceId) || 0;
            deliveredAmounts.set(
              step.resourceId,
              currentAmount + step.amountProcessed
            );
          }
        });
      }
    });

    return deliveredAmounts;
  };

  const handlePlanProduction = (order: Order) => {
    if (!productionPlan) {
      return;
    }
    // Add to existing active level
    const activeLevelIndex = productionPlan.activeLevel;
    const activeLevel = productionPlan.levels.find(
      level => level.level === activeLevelIndex
    );

    if (!activeLevel) {
      console.error('Active level not found:', activeLevelIndex);
      return;
    }

    const selectedTrains = getBestTrains(
      activeLevel,
      order.resources[0].amount,
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
      <div className="card-header">
        <h2 className="h4 mb-0">Current Orders</h2>
      </div>
      <div className="card-body">
        <div className="d-flex flex-row flex-wrap gap-3">
          {orders.map(order => (
            <div key={order.id} className="card bg-opacity-10 bg-light">
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
                        const deliveredAmount =
                          calculateDeliveredAmounts(order).get(
                            req.resourceId
                          ) || 0;
                        return (
                          <span key={index} className="badge bg-secondary">
                            {resource?.name || req.resourceId}:{' '}
                            {deliveredAmount}/{req.amount}
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
      </div>
    </div>
  );
}
