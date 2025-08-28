import { Order, Resource } from './types';

interface CurrentOrdersProps {
  orders: Order[];
  resources: Resource[];
  onOrderSelect: (order: Order) => void;
}

export function CurrentOrders({ orders, resources, onOrderSelect }: CurrentOrdersProps) {
  const getResourceName = (resourceId: string): string => {
    const resource = resources.find(r => r.id === resourceId);
    return resource?.name || resourceId;
  };

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

  if (orders.length === 0) {
    return (
      <div className="card h-100">
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
    <div className="card h-100">
      <div className="card-header">
        <h2 className="h4 mb-0">Current Orders</h2>
      </div>
      <div className="card-body">
        <div className="d-flex flex-column gap-3">
          {orders.map((order) => (
            <div 
              key={order.id} 
              className="card border-0 bg-light cursor-pointer"
              onClick={() => onOrderSelect(order)}
            >
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h3 className="h6 mb-0">{order.name}</h3>
                  <span className={`badge order-type-${order.type}`}>
                    {order.type.charAt(0).toUpperCase() + order.type.slice(1)}
                  </span>
                </div>
                
                <div className="order-details">
                  {order.type === 'boat' && (
                    <p className="small text-warning mb-1">
                      <i className="bi bi-clock me-1"></i>
                      Expires in: {formatTime((order as any).expirationTime)}
                    </p>
                  )}
                  {order.type === 'story' && (
                    <p className="small text-info mb-1">
                      <i className="bi bi-hourglass-split me-1"></i>
                      Travel time: {formatTime((order as any).travelTime)}
                    </p>
                  )}
                  
                  <div className="mt-2">
                    <small className="text-muted d-block mb-1">Resources:</small>
                    <div className="d-flex flex-wrap gap-1">
                      {order.resources.map((req, index) => (
                        <span key={index} className="badge bg-secondary">
                          {getResourceName(req.resourceId)}: {req.amount}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
