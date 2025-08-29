import { Order, Resource, ProductionPlan, PlannedStep, BoatOrder, StoryOrder } from './types';

interface CurrentOrdersProps {
    orders: Order[];
    resources: Resource[];
    productionPlan: ProductionPlan | null;
    onProductionPlanChange: (plan: ProductionPlan) => void;
}

export function CurrentOrders({ 
    orders, 
    resources, 
    productionPlan, 
    onProductionPlanChange 
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
        // Create a delivery job for this order
        const deliveryJob: PlannedStep = {
            id: `delivery_${order.id}_${Date.now()}`,
            type: 'delivery',
            stepType: 'delivery',
            resourceName: `Delivery: ${order.name}`,
            resourceId: 'delivery',
            level: 1,
            timeRequired: calculateDeliveryTime(order),
            amountProcessed: order.resources.reduce((total, req) => total + req.amount, 0),
            dependencies: [],
            // Add order-specific information
            order: order
        };

        if (!productionPlan) {
            // Create new production plan with Level 1
            const newPlan: ProductionPlan = {
                levels: [{
                    level: 1,
                    steps: [deliveryJob],
                    inventoryChanges: new Map(),
                    workerCount: 0, // Delivery jobs don't require workers
                    isOverCapacity: false,
                    description: 'Delivery Level',
                    estimatedTime: deliveryJob.timeRequired,
                    done: false
                }],
                totalTime: deliveryJob.timeRequired,
                workerAssignments: new Map(),
                maxConcurrentWorkers: 5,
                inventorySnapshot: new Map(),
                activeLevel: 1
            };
            onProductionPlanChange(newPlan);
        } else {
            // Add to existing Level 1 or create Level 1 if it doesn't exist
            const level1 = productionPlan.levels.find(l => l.level === 1);
            if (level1) {
                // Add to existing Level 1
                const updatedLevel1 = {
                    ...level1,
                    steps: [...level1.steps, deliveryJob],
                    estimatedTime: Math.max(level1.estimatedTime, deliveryJob.timeRequired)
                };
                
                const updatedLevels = productionPlan.levels.map(l => 
                    l.level === 1 ? updatedLevel1 : l
                );
                
                onProductionPlanChange({
                    ...productionPlan,
                    levels: updatedLevels,
                    totalTime: Math.max(...updatedLevels.map(l => l.estimatedTime))
                });
            } else {
                // Create Level 1 and add the job
                const newLevel1 = {
                    level: 1,
                    steps: [deliveryJob],
                    inventoryChanges: new Map(),
                    workerCount: 0,
                    isOverCapacity: false,
                    description: 'Delivery Level',
                    estimatedTime: deliveryJob.timeRequired,
                    done: false
                };
                
                const updatedLevels = [newLevel1, ...productionPlan.levels.map(l => ({
                    ...l,
                    level: l.level + 1
                }))];
                
                onProductionPlanChange({
                    ...productionPlan,
                    levels: updatedLevels,
                    totalTime: Math.max(...updatedLevels.map(l => l.estimatedTime))
                });
            }
        }
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
}
