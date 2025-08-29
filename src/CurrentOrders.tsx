import { Order, Resource, ProductionPlan, PlannedStep, BoatOrder, StoryOrder, Train } from './types';
import { formatTime } from './utils';

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
    onProductionPlanChange
}: CurrentOrdersProps) {

    const handlePlanProduction = (order: Order) => {
        if (!productionPlan) {
            return;
        }
        // Add to existing active level
        const activeLevelIndex = productionPlan?.activeLevel ?? 0;
        const activeLevel = productionPlan?.levels[activeLevelIndex];

        const trains = getBestTrains(productionPlan, order.resources[0].amount);

        const deliveryJobs: PlannedStep[] = [];
        for (let train of trains) {
            deliveryJobs.push( {
                id: `delivery_${order.id}_${Date.now()}`,
                type: 'delivery',
                resourceId: order.resources[0].resourceId,
                level: 1,
                trainId: train.id,
                timeRequired: order.type === 'story' ? (order as StoryOrder).travelTime : 0,
                order: order,
                amountProcessed: train.capacity,
                dependencies: []
            });
        }
        
        // Add to existing Level
        
        var updatedSteps = [...activeLevel.steps, ...deliveryJobs];

        const updatedLevel = {
            ...activeLevel,
            trainCount: updatedSteps.filter(step => step.trainId !== undefined).length,
            steps: updatedSteps,
            estimatedTime: Math.max(...updatedSteps.map(j => j.timeRequired))
        };

        const updatedPlan = {
            ...productionPlan,
            levels: productionPlan.levels.map((level, index) =>
                index === activeLevelIndex ? updatedLevel : level
            )
        };

        onProductionPlanChange(updatedPlan);
    };

    if (orders.length === 0) {
        return (
            <div className="card">
                <div className="card-header">
                    <h2 className="h4 mb-0">Current Orders</h2>
                </div>
                <div className="card-body text-center">
                    <p className="text-muted mb-0">No orders yet. Create your first order!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="card-header">
                <h2 className="h4 mb-0">Current Orders</h2>
            </div>
            <div className="card-body">
                <div className="d-flex flex-row flex-wrap gap-3">
                    {orders.map((order) => (
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
                                            Expires in: {formatTime((order as BoatOrder).expirationTime)}
                                        </p>
                                    )}
                                    <div className="mt-2">
                                        <small className="text-muted d-block mb-1">Resources:</small>
                                        <div className="d-flex flex-wrap gap-1">
                                            {order.resources.map((req, index) => {
                                                const resource = resources.find(r => r.id === req.resourceId);
                                                return (
                                                    <span key={index} className="badge bg-secondary">
                                                        {resource?.name || req.resourceId}: {req.delivered}/{req.amount}
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


    function getBestTrains(plan: ProductionPlan, amount: number): Train[] {
        const activeLevel = plan.levels[plan.activeLevel];
        if (!activeLevel) return [];

        const busyTrainIds = activeLevel.steps
            .filter(step => step.trainId !== undefined)
            .map(step => step.trainId!);
        

        const applicableTrains = trains.filter(t =>
            !busyTrainIds.includes(t.id) &&
            t.availableAt <= activeLevel.startTime
        );

        const bestTrains = applicableTrains.sort((a, b) =>
            Math.abs(a.capacity - amount) - Math.abs(b.capacity - amount)
        );

        if(bestTrains.length === 0) {
            return [];
        }
        
        let index = 0;
        let capacity = 0;
        let neededTrains = [];
        do {
            capacity += bestTrains[index].capacity;
            neededTrains.push(bestTrains[index]);
            index++;
        } while (capacity <= amount);

        return neededTrains;
    }
}

