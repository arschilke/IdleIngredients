import { useState } from 'react';
import { Order, Resource, ResourceRequirement } from './types';

interface OrderFormProps {
  resources: Resource[];
  onSubmit: (order: Order) => void;
  onOrdersChange: (orders: Order[]) => void;
}

export function OrderForm({ resources, onSubmit }: OrderFormProps) {
  const [orderType, setOrderType] = useState<'boat' | 'story' | 'building'>('story');
  const [orderName, setOrderName] = useState('Story Order ' + new Date().toISOString());
  const [orderResources, setOrderResources] = useState<ResourceRequirement[]>([
    { resourceId: 'saw_blade', amount: 75 }
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
              <option value="story">Story Order</option>
              <option value="building">Building Order</option>
              <option value="boat">Boat Order</option>
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
      </div>
    </div>
  );
}
