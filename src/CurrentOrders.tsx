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
      <div className="current-orders">
        <h2>Current Orders</h2>
        <p className="no-orders">No orders yet. Create your first order!</p>
      </div>
    );
  }

  return (
    <div className="current-orders">
      <h2>Current Orders</h2>
      <div className="orders-list">
        {orders.map((order) => (
          <div 
            key={order.id} 
            className="order-item"
            onClick={() => onOrderSelect(order)}
          >
            <div className="order-header">
              <h3>{order.name}</h3>
              <span className={`order-type order-type-${order.type}`}>
                {order.type.charAt(0).toUpperCase() + order.type.slice(1)}
              </span>
            </div>
            
            <div className="order-details">
              {order.type === 'boat' && (
                <p className="order-time">⏰ Expires in: {formatTime((order as any).expirationTime)}</p>
              )}
              {order.type === 'story' && (
                <p className="order-time">⏱️ Travel time: {formatTime((order as any).travelTime)}</p>
              )}
              
              <div className="resources-summary">
                <strong>Resources:</strong>
                {order.resources.map((req, index) => (
                  <span key={index} className="resource-tag">
                    {getResourceName(req.resourceId)}: {req.amount}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
