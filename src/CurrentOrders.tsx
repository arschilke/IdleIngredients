import { Order, Resource, ProductionPlan, PlannedStep, BoatOrder, StoryOrder, Train } from './types';

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
    maxConcurrentTrains
}: CurrentOrdersProps) {
    const formatTime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    };

    const handlePlanProduction = (order: Order) => {

        if (!productionPlan) {
            // Create new production plan with Level 1
            const newPlan: ProductionPlan = {
                levels: [{
                    level: 0,
                    steps: [],
                    inventoryChanges: new Map(),
                    trainCount: 1,
                    isOverCapacity: false,
                    description: '',
                    estimatedTime: 0,
                    done: false,
                    startTime: 0,
                    endTime: 0
                }],
                totalTime: 0,
                maxConcurrentWorkers: maxConcurrentTrains,
                inventorySnapshot: new Map(),
                activeLevel: 0
            };

            onProductionPlanChange(newPlan);
        }

        

        // Add to existing active level
        const activeLevelIndex = productionPlan?.activeLevel ?? 0;
        const activeLevel = productionPlan?.levels[activeLevelIndex];

        const deliveryJob: PlannedStep = {
            id: `delivery_${order.id}_${Date.now()}`,
            type: 'delivery',
            resourceId: order.resources[0].resourceId,
            level: 1,
            timeRequired: calculateDeliveryTime(order),
            trainId: getBestTrain(productionPlan, order.resources[0].amount),
            order: order,
            amountProcessed: 0,
            dependencies: []
        };

        // Add to existing Level
        const updatedLevel = {
            ...activeLevel,
            steps: [...activeLevel.steps, deliveryJob],
            estimatedTime: Math.max(activeLevel.estimatedTime, deliveryJob.timeRequired)
        };

        const updatedPlan = {
            ...productionPlan,
            levels: productionPlan.levels.map((level, index) => 
                index === activeLevelIndex ? updatedLevel : level
            )
        };

        onProductionPlanChange(updatedPlan);
    };

    const calculateDeliveryTime = (order: Order): number => {
        // Calculate delivery time based on order type and amount
        const baseAmount = order.resources.reduce((total, req) => total + req.amount, 0);

        switch (order.type) {
            case 'boat':
                // Boat orders have expiration time, delivery should be quick
                return Math.max(60, Math.floor(baseAmount / 10)); // 1 second per 10 units, minimum 1 minute
            case 'story':
                // Story orders have travel time, delivery time proportional to that
                return Math.max(120, Math.floor((order as StoryOrder).travelTime / 2)); // Half the travel time, minimum 2 minutes
            case 'building':
                // Building orders are regular, moderate delivery time
                return Math.max(180, Math.floor(baseAmount / 5)); // 1 second per 5 units, minimum 3 minutes
            default:
                return 300; // Default 5 minutes
        }
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
                        <div key={order.id} className="card border-0 bg-light">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <h4 className="h6 mb-0">{order.name}</h4>
                                    <span className={`badge order-type-${order.type}`}>
                                        {order.type.charAt(0).toUpperCase() + order.type.slice(1)}
                                    </span>
                                </div>
                                <div className="mb-2">
                                    {order.type === 'boat' && (
                                        <p className="small text-warning mb-1">
                                            <i className="bi bi-clock me-1"></i>
                                            Expires in: {formatTime((order as BoatOrder).expirationTime)}
                                        </p>
                                    )}
                                    {order.type === 'story' && (
                                        <p className="small text-info mb-1">
                                            <i className="bi bi-hourglass-split me-1"></i>
                                            Travel time: {formatTime((order as StoryOrder).travelTime)}
                                        </p>
                                    )}
                                    <div className="mt-2">
                                        <small className="text-muted d-block mb-1">Resources:</small>
                                        <div className="d-flex flex-wrap gap-1">
                                            {order.resources.map((req, index) => {
                                                const resource = resources.find(r => r.id === req.resourceId);
                                                return (
                                                    <span key={index} className="badge bg-secondary">
                                                        {resource?.name || req.resourceId}: {req.amount}
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


    function getBestTrain(plan: ProductionPlan, amount: number): string | undefined {
        const activeLevel = plan.levels[plan.activeLevel];
        if (!activeLevel) return undefined;
        
        const busyTrains = activeLevel.steps
            .filter(step => step.trainId)
            .map(step => step.trainId!)
            .filter(id => id !== undefined);
            
        const applicableTrains = trains.filter(t => 
            !busyTrains.includes(t.id) && 
            t.capacity >= amount && 
            t.availableAt <= activeLevel.startTime
        );
        
        const bestTrain = applicableTrains.sort((a, b) => 
            Math.abs(a.capacity - amount) - Math.abs(b.capacity - amount)
        )[0];
        
        return bestTrain?.id;
    }
}

