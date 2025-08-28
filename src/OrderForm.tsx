import { useState } from 'react';
import { Order, Resource, ResourceRequirement, BoatOrder, StoryOrder } from './types';

interface OrderFormProps {
  resources: Resource[];
  onSubmit: (order: Order) => void;
  existingOrders: Order[];
  onOrdersChange: (orders: Order[]) => void;
}

export function OrderForm({ resources, onSubmit, existingOrders }: OrderFormProps) {
  const [orderType, setOrderType] = useState<'boat' | 'story' | 'building'>('building');
  const [orderName, setOrderName] = useState('');
  const [orderResources, setOrderResources] = useState<ResourceRequirement[]>([
    { resourceId: '', amount: 0 }
  ]);
  const [expirationTime, setExpirationTime] = useState(3600); // 1 hour in seconds
  const [travelTime, setTravelTime] = useState(1800); // 30 minutes in seconds

  const addResource = () => {
    setOrderResources([...orderResources, { resourceId: '', amount: 0 }]);
  };

  const removeResource = (index: number) => {
    if (orderResources.length > 1) {
      setOrderResources(orderResources.filter((_, i) => i !== index));
    }
  };

  const updateResource = (index: number, field: keyof ResourceRequirement, value: string | number) => {
    const newResources = [...orderResources];
    newResources[index] = { ...newResources[index], [field]: value };
    setOrderResources(newResources);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderName.trim()) {
      alert('Please enter an order name');
      return;
    }

    if (orderResources.some(r => !r.resourceId || r.amount <= 0)) {
      alert('Please fill in all resource requirements with valid amounts');
      return;
    }

    const newOrder: Order = {
      id: `order_${Date.now()}`,
      name: orderName.trim(),
      resources: orderResources.filter(r => r.resourceId && r.amount > 0),
      ...(orderType === 'boat' && { type: 'boat', expirationTime }),
      ...(orderType === 'story' && { type: 'story', travelTime }),
      ...(orderType === 'building' && { type: 'building' })
    } as Order;

    onSubmit(newOrder);
    
    // Reset form
    setOrderName('');
    setOrderResources([{ resourceId: '', amount: 0 }]);
    setExpirationTime(3600);
    setTravelTime(1800);
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

  return (
    <div className="order-form">
      <h2>Create New Order</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="orderType">Order Type:</label>
          <select
            id="orderType"
            value={orderType}
            onChange={(e) => setOrderType(e.target.value as 'boat' | 'story' | 'building')}
            required
          >
            <option value="building">Building Order</option>
            <option value="boat">Boat Order</option>
            <option value="story">Story Order</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="orderName">Order Name:</label>
          <input
            id="orderName"
            type="text"
            value={orderName}
            onChange={(e) => setOrderName(e.target.value)}
            placeholder="Enter order name"
            required
          />
        </div>

        {orderType === 'boat' && (
          <div className="form-group">
            <label htmlFor="expirationTime">Boat Expiration Time:</label>
            <div className="time-input">
              <input
                id="expirationTime"
                type="range"
                min="300"
                max="7200"
                step="300"
                value={expirationTime}
                onChange={(e) => setExpirationTime(Number(e.target.value))}
              />
              <span className="time-display">{formatTime(expirationTime)}</span>
            </div>
            <small>When the boat leaves</small>
          </div>
        )}

        {orderType === 'story' && (
          <div className="form-group">
            <label htmlFor="travelTime">Story Travel Time:</label>
            <div className="time-input">
              <input
                id="travelTime"
                type="range"
                min="300"
                max="3600"
                step="300"
                value={travelTime}
                onChange={(e) => setTravelTime(Number(e.target.value))}
              />
              <span className="time-display">{formatTime(travelTime)}</span>
            </div>
            <small>How long the story takes to complete</small>
          </div>
        )}

        <div className="form-group">
          <label>Resources Required:</label>
          {orderResources.map((resource, index) => (
            <div key={index} className="resource-input">
              <select
                value={resource.resourceId}
                onChange={(e) => updateResource(index, 'resourceId', e.target.value)}
                required
              >
                <option value="">Select resource</option>
                {resources.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                value={resource.amount}
                onChange={(e) => updateResource(index, 'amount', Number(e.target.value))}
                placeholder="Amount"
                required
              />
              {orderResources.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeResource(index)}
                  className="btn btn-danger btn-small"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addResource} className="btn btn-secondary">
            Add Resource
          </button>
        </div>

        <button type="submit" className="btn btn-primary">
          Create Order
        </button>
      </form>

      {existingOrders.length > 0 && (
        <div className="existing-orders">
          <h3>Existing Orders</h3>
          <div className="orders-grid">
            {existingOrders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <h4>{order.name}</h4>
                  <span className={`order-type order-type-${order.type}`}>
                    {order.type.charAt(0).toUpperCase() + order.type.slice(1)}
                  </span>
                </div>
                <div className="order-details">
                  {order.type === 'boat' && (
                    <p>⏰ Expires in: {formatTime((order as BoatOrder).expirationTime)}</p>
                  )}
                  {order.type === 'story' && (
                    <p>⏱️ Travel time: {formatTime((order as StoryOrder).travelTime)}</p>
                  )}
                  <div className="resources-list">
                    <strong>Resources:</strong>
                    {order.resources.map((req, index) => {
                      const resource = resources.find(r => r.id === req.resourceId);
                      return (
                        <span key={index} className="resource-tag">
                          {resource?.name || req.resourceId}: {req.amount}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => onSubmit(order)}
                >
                  Plan Production
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
