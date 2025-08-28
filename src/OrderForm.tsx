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
    <div className="card h-100">
      <div className="card-header">
        <h2 className="h4 mb-0">Create New Order</h2>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="orderType" className="form-label">Order Type:</label>
            <select
              id="orderType"
              className="form-select"
              value={orderType}
              onChange={(e) => setOrderType(e.target.value as 'boat' | 'story' | 'building')}
              required
            >
              <option value="building">Building Order</option>
              <option value="boat">Boat Order</option>
              <option value="story">Story Order</option>
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="orderName" className="form-label">Order Name:</label>
            <input
              id="orderName"
              type="text"
              className="form-control"
              value={orderName}
              onChange={(e) => setOrderName(e.target.value)}
              placeholder="Enter order name"
              required
            />
          </div>

          {orderType === 'boat' && (
            <div className="mb-3">
              <label htmlFor="expirationTime" className="form-label">Boat Expiration Time:</label>
              <div className="d-flex align-items-center gap-2">
                <input
                  id="expirationTime"
                  type="range"
                  className="form-range flex-grow-1"
                  min="300"
                  max="7200"
                  step="300"
                  value={expirationTime}
                  onChange={(e) => setExpirationTime(Number(e.target.value))}
                />
                <span className="badge bg-warning">{formatTime(expirationTime)}</span>
              </div>
              <small className="form-text text-muted">When the boat leaves</small>
            </div>
          )}

          {orderType === 'story' && (
            <div className="mb-3">
              <label htmlFor="travelTime" className="form-label">Story Travel Time:</label>
              <div className="d-flex align-items-center gap-2">
                <input
                  id="travelTime"
                  type="range"
                  className="form-range flex-grow-1"
                  min="300"
                  max="3600"
                  step="300"
                  value={travelTime}
                  onChange={(e) => setTravelTime(Number(e.target.value))}
                />
                <span className="badge bg-info">{formatTime(travelTime)}</span>
              </div>
              <small className="form-text text-muted">How long the story takes to complete</small>
            </div>
          )}

          <div className="mb-3">
            <label className="form-label">Resources Required:</label>
            {orderResources.map((resource, index) => (
              <div key={index} className="d-flex gap-2 mb-2">
                <select
                  className="form-select flex-grow-1"
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
                  className="form-control"
                  style={{ width: '100px' }}
                  min="1"
                  value={resource.amount}
                  onChange={(e) => updateResource(index, 'amount', Number(e.target.value))}
                  placeholder="Amount"
                  required
                />
                {orderResources.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => removeResource(index)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addResource} className="btn btn-outline-secondary btn-sm">
              <i className="bi bi-plus me-1"></i>
              Add Resource
            </button>
          </div>

          <button type="submit" className="btn btn-primary w-100">
            <i className="bi bi-plus-circle me-1"></i>
            Create Order
          </button>
        </form>

        {existingOrders.length > 0 && (
          <div className="mt-4">
            <h3 className="h5 mb-3">Existing Orders</h3>
            <div className="d-flex flex-column gap-3">
              {existingOrders.map((order) => (
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
                      onClick={() => onSubmit(order)}
                    >
                      <i className="bi bi-gear me-1"></i>
                      Plan Production
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
