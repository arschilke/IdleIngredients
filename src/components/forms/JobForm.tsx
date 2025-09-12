import type {
  Order,
  PlanningLevel,
  Step,
  StoryOrder,
  Train,
} from '../../types';
import { Country, StepType, TrainClass } from '../../types';
import React, { type FormEvent, useState } from 'react';
import { useBestTrains } from '../../hooks/useBestTrains';
import { generateId } from '../../utils';
import { useDestinations } from '../../hooks/useDestinations';
import { useResources } from '../../hooks/useResources';
import { useFactories } from '../../hooks/useFactories';

interface JobFormProps {
  job?: Step;
  level: PlanningLevel;
  orders: Order[];
  onSubmit: (job: Step) => void;
  onClose: () => void;
}
export const JobForm: React.FC<JobFormProps> = ({
  job,
  level,
  orders,
  onSubmit,
  onClose,
}) => {
  const isAddMode = !job;

  const { data: destinations = {} } = useDestinations();
  const { data: resources = {} } = useResources();
  const { data: factories = {} } = useFactories();

  const [type, setType] = useState<StepType>(job?.type ?? StepType.Factory);
  const [resourceId, setResourceId] = useState<string>(job?.resourceId ?? '');
  const [orderId, setOrderId] = useState<string>(
    job && 'orderId' in job ? job.orderId : ''
  );
  const [trainId, setTrainId] = useState<string>(
    job && 'trainId' in job ? job.trainId : ''
  );

  const getOrder = (orderId: string) => {
    return orders.find(o => o.id === orderId) as StoryOrder;
  };

  const getTrains = () => {
    let classes: TrainClass[] = [];
    let countries: Country[] = [];
    if (type === StepType.Destination) {
      const dest = Object.values(destinations).find(
        d => d.resourceId == resourceId
      );
      classes = dest?.classes ?? [
        TrainClass.Common,
        TrainClass.Rare,
        TrainClass.Epic,
        TrainClass.Legendary,
      ];
      countries = [dest?.country ?? Country.Britain];
    }
    if (type === StepType.Delivery) {
      const order = getOrder(orderId) as StoryOrder | undefined;

      classes = order?.classes ?? [
        TrainClass.Common,
        TrainClass.Rare,
        TrainClass.Epic,
        TrainClass.Legendary,
      ];
      countries = [order?.country ?? Country.Britain];
    }

    return useBestTrains({
      level,
      amount: 1,
      allowedClasses: classes,
      allowedCountries: countries,
    }).bestTrains;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!resourceId) {
      alert('Please select a resource');
      return;
    }

    if ((type === StepType.Delivery || type === StepType.Submit) && !orderId) {
      alert('Please select an order');
      return;
    }

    if (
      (type === StepType.Destination || type === StepType.Delivery) &&
      !trainId
    ) {
      alert('Please select a train');
      return;
    }

    const newStep: Step = {
      id: job?.id ?? generateId('step'),
      name: resourceId,
      type: type,
      resourceId: resourceId,
      levelId: level.level,
      timeRequired: 0,
      ...(type === StepType.Delivery && { orderId: orderId, trainId: trainId }),
      ...(type === StepType.Destination && { trainId: trainId }),
      ...(type === StepType.Submit && { orderId: orderId }),
    } as Step;

    onSubmit(newStep);

    // Reset form
    setResourceId('');
    setOrderId('');
    setTrainId('');
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">
          <i className="bi bi-plus-circle me-2"></i>
          {isAddMode ? 'Add New Step' : 'Edit Step'}
        </h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor="type" className="form-label">
                <i className="bi bi-gear me-1"></i>Step Type
              </label>
              <select
                id="type"
                value={type}
                onChange={e => setType(e.target.value as StepType)}
                className={`form-select`}
              >
                <option value="">Choose step type...</option>
                {Object.values(StepType).map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label htmlFor="resourceId" className="form-label">
                <i className="bi bi-box me-1"></i>Resource
              </label>
              <select
                id="resourceId"
                value={resourceId}
                onChange={e => setResourceId(e.target.value)}
                className={`form-select`}
              >
                <option value="">Select a resource...</option>
                {type === StepType.Destination &&
                  Object.values(destinations).map(destination => (
                    <option
                      key={destination.resourceId}
                      value={destination.resourceId}
                    >
                      {resources[destination.resourceId].name}
                    </option>
                  ))}
                {type === StepType.Factory &&
                  Object.values(factories)
                    .flatMap(factory => factory.recipes)
                    .map(recipe => (
                      <option key={recipe.resourceId} value={recipe.resourceId}>
                        {resources[recipe.resourceId].name}
                      </option>
                    ))}
                {(type === StepType.Submit || type === StepType.Delivery) &&
                  orderId &&
                  getOrder(orderId)?.resources.map(resource => (
                    <option
                      key={resource.resourceId}
                      value={resource.resourceId}
                    >
                      {resources[resource.resourceId].name}
                    </option>
                  ))}
                {(type === StepType.Submit || type === StepType.Delivery) &&
                  !orderId &&
                  Object.values(resources).map(resource => (
                    <option key={resource.id} value={resource.id}>
                      {resource.name}
                    </option>
                  ))}
              </select>
            </div>

            {type === StepType.Delivery && (
              <div className="col-12">
                <label htmlFor="order" className="form-label">
                  <i className="bi bi-clipboard me-1"></i>Order
                </label>
                <select
                  id="order"
                  value={orderId}
                  onChange={e => setOrderId(e.target.value)}
                  className={`form-select`}
                >
                  <option value="">Select an order...</option>
                  {orders.map(order => (
                    <option key={order.id} value={order.id}>
                      {order.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(type === StepType.Destination || type === StepType.Delivery) && (
              <div className="col-12">
                <label htmlFor="trainId" className="form-label">
                  <i className="bi bi-train-front me-1"></i>Train
                </label>
                <select
                  id="trainId"
                  value={trainId}
                  onChange={e => setTrainId(e.target.value)}
                  className={`form-select`}
                >
                  <option value="">Select a train...</option>
                  {getTrains().map((train: Train) => (
                    <option key={train.id} value={train.id}>
                      {train.name} ({train.capacity} capacity)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="d-flex gap-2 mt-4">
            <button type="submit" className="btn btn-primary">
              <i className="bi bi-check-lg me-1"></i>
              {isAddMode ? 'Add Step' : 'Save Changes'}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onClose}
            >
              <i className="bi bi-x-lg me-1"></i>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
