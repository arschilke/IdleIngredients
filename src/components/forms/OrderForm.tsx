  import { useState, type FormEvent } from 'react';
import type {
  Order,
  Resource,
  ResourceRequirement,
} from '../../types';
import { TrainClass, Country } from '../../types';
import { formatTime } from "../../utils";

interface OrderFormProps {
  resources: Record<string, Resource>;
  onSubmit: (order: Order) => void;
  onOrdersChange: (orders: Order[]) => void;
}

export const OrderForm = ({ resources, onSubmit }: OrderFormProps) => {
  const [orderType, setOrderType] = useState<'boat' | 'story' | 'building'>(
    'story'
  );
  const [orderName, setOrderName] = useState(
    'Story Order ' + new Date().toISOString()
  );
  const [orderResources, setOrderResources] = useState<ResourceRequirement[]>([
    { resourceId: 'saw_blade', amount: 75, delivered: 0 },
  ]);
  const [expirationTime, setExpirationTime] = useState(3600); // 1 hour in seconds
  const [travelTime, setTravelTime] = useState(1800); // 30 minutes in seconds
  const [selectedTrainClasses, setSelectedTrainClasses] = useState<
    TrainClass[]
  >([
    TrainClass.Common,
    TrainClass.Rare,
    TrainClass.Epic,
    TrainClass.Legendary,
  ]);
  const [selectedCountry, setSelectedCountry] = useState<Country | ''>('');

  const addResource = () => {
    setOrderResources([
      ...orderResources,
      { resourceId: '', amount: 0, delivered: 0 },
    ]);
  };

  const removeResource = (index: number) => {
    if (orderResources.length > 1) {
      setOrderResources(orderResources.filter((_, i) => i !== index));
    }
  };

  const updateResource = (
    index: number,
    field: keyof ResourceRequirement,
    value: string | number
  ) => {
    const newResources = [...orderResources];
    newResources[index] = { ...newResources[index], [field]: value };
    setOrderResources(newResources);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!orderName.trim()) {
      alert('Please enter an order name');
      return;
    }

    if (orderResources.some(r => !r.resourceId || r.amount <= 0)) {
      alert('Please fill in all resource requirements with valid amounts');
      return;
    }

    if (orderType === 'story' && selectedTrainClasses.length === 0) {
      alert('Please select at least one train class for story orders');
      return;
    }

    const newOrder: Order = {
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: orderName.trim(),
      resources: orderResources.filter(r => r.resourceId && r.amount > 0),
      ...(orderType === 'boat' && { type: 'boat', expirationTime }),
      ...(orderType === 'story' && {
        type: 'story',
        travelTime,
        classes: selectedTrainClasses,
        ...(selectedCountry && { country: selectedCountry }),
      }),
      ...(orderType === 'building' && { type: 'building' }),
    } as Order;

    onSubmit(newOrder);

    // Reset form
    setOrderName('');
    setOrderResources([
      {
        resourceId: '',
        amount: 0,
        delivered: 0,
      },
    ]);
    setExpirationTime(3600);
    setTravelTime(1800);
    setSelectedTrainClasses([
      TrainClass.Common,
      TrainClass.Rare,
      TrainClass.Epic,
      TrainClass.Legendary,
    ]);
    setSelectedCountry('');
  };

  return (
    <div className="card">
      <div className="card-header py-2">
        <h3 className="h5 mb-0">Create New Order</h3>
      </div>
      <div className="card-body py-3">
        <form onSubmit={handleSubmit}>
          <div className="mb-2">
            <label htmlFor="orderType" className="form-label">
              Order Type:
            </label>
            <select
              id="orderType"
              className="form-select form-select-sm"
              value={orderType}
              onChange={e =>
                setOrderType(e.target.value as 'boat' | 'story' | 'building')
              }
              required
            >
              <option value="story">Story Order</option>
              <option value="building">Building Order</option>
              <option value="boat">Boat Order</option>
            </select>
          </div>

          <div className="mb-2">
            <label htmlFor="orderName" className="form-label">
              Order Name:
            </label>
            <input
              id="orderName"
              type="text"
              className="form-control form-control-sm"
              value={orderName}
              onChange={e => setOrderName(e.target.value)}
              placeholder="Enter order name"
              required
            />
          </div>

          {orderType === 'boat' && (
            <div className="mb-2">
              <label htmlFor="expirationTime" className="form-label">
                Boat Expiration Time:
              </label>
              <div className="d-flex align-items-center gap-2">
                <input
                  id="expirationTime"
                  type="range"
                  className="form-range flex-grow-1"
                  min="3600"
                  max="36000"
                  step="1800"
                  value={expirationTime}
                  onChange={e => setExpirationTime(Number(e.target.value))}
                />
                <span className="badge bg-warning">
                  {formatTime(expirationTime)}
                </span>
              </div>
            </div>
          )}

          {orderType === 'story' && (
            <div className="mb-1">
              <label htmlFor="travelTime" className="form-label">
                Story Travel Time:
              </label>
              <div className="d-flex align-items-center gap-2">
                <input
                  id="travelTime"
                  type="range"
                  className="form-range flex-grow-1"
                  min="300"
                  max="3600"
                  step="300"
                  value={travelTime}
                  onChange={e => setTravelTime(Number(e.target.value))}
                />
                <span className="badge bg-info">{formatTime(travelTime)}</span>
              </div>
            </div>
          )}

          {orderType === 'story' && (
            <div className="mb-2">
              <label className="form-label">Allowed Train Classes:</label>
              <select
                className="form-select form-select-sm"
                id={`classes`}
                value={selectedTrainClasses}
                multiple
                onChange={e => {
                  const selectedValues = Array.from(
                    e.target.selectedOptions,
                    option => option.value as TrainClass
                  );
                  setSelectedTrainClasses(selectedValues);
                }}
              >
                {Object.values(TrainClass).map(trainClass => (
                  <option key={trainClass} value={trainClass}>
                    {trainClass.charAt(0).toUpperCase() + trainClass.slice(1)}
                  </option>
                ))}
              </select>
              <label className="form-label">Allowed Country:</label>
              <select
                className="form-select form-select-sm"
                id="country"
                value={selectedCountry}
                onChange={e =>
                  setSelectedCountry(e.target.value as Country | '')
                }
              >
                <option value="">No specific country</option>
                {Object.values(Country).map(country => (
                  <option key={country} value={country}>
                    {country.charAt(0).toUpperCase() + country.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mb-2">
            <label className="form-label">Resources Required:</label>
            {orderResources.map((resource, index) => (
              <div key={index} className="d-flex gap-2 mb-2">
                <select
                  className="form-select form-select-sm flex-grow-1"
                  value={resource.resourceId}
                  onChange={e =>
                    updateResource(index, 'resourceId', e.target.value)
                  }
                  required
                >
                  <option value="">Select resource</option>
                  {Object.values(resources).map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  style={{ width: '100px' }}
                  min="1"
                  value={resource.amount}
                  onChange={e =>
                    updateResource(index, 'amount', Number(e.target.value))
                  }
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
            <button
              type="button"
              onClick={addResource}
              className="btn btn-outline-secondary btn-sm"
            >
              <i className="bi bi-plus me-1"></i>
              Add Resource
            </button>
          </div>

          <button type="submit" className="btn btn-primary btn-sm w-100">
            <i className="bi bi-plus-circle me-1"></i>
            Create Order
          </button>
        </form>
      </div>
    </div>
  );
};
