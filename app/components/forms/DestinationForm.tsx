import {
  TrainClass,
  type Resource,
  type Destination,
  Country,
} from '../../../types';
import React, { type FormEvent, useState } from 'react';
import { generateId } from '../../../utils';
import { useDestinations } from '~/hooks/useDestinations';
import { useResources } from '~/hooks/useResources';

interface DestinationFormProps {
  destination?: Destination;
  onSubmit: (destination: Destination) => void;
  onClose: () => void;
}
export const DestinationForm: React.FC<DestinationFormProps> = ({
  destination,
  onSubmit,
  onClose,
}) => {
  const isAddMode = !destination;
  const { data: destinations = {} } = useDestinations();
  const { data: resources = {} } = useResources();

  const [travelTime, setTravelTime] = useState<number>(
    destination?.travelTime ?? 60
  );
  const [name, setName] = useState<string>(destination?.name ?? '');
  const [resourceId, setResourceId] = useState<string>(
    destination?.resourceId ?? ''
  );
  const [classes, setClasses] = useState<TrainClass[]>(
    destination?.classes ?? [
      TrainClass.Common,
      TrainClass.Rare,
      TrainClass.Epic,
      TrainClass.Legendary,
    ]
  );
  const [country, setCountry] = useState<Country>(
    destination?.country ?? Country.Britain
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!resourceId) {
      alert('Please add a destination resource id');
      return;
    }

    const newDestination: Destination = {
      id: destination?.id ?? generateId('destination'),
      name: name ?? '',
      travelTime: travelTime,
      resourceId: resourceId,
      classes: classes,
      country: country,
    } as Destination;

    onSubmit(newDestination);

    // Reset form
    setTravelTime(60);
    setResourceId('');
    setClasses([
      TrainClass.Common,
      TrainClass.Rare,
      TrainClass.Epic,
      TrainClass.Legendary,
    ]);
    setCountry(Country.Britain);
  };

  return (
    <div className="card mb-2">
      <div className="card-header">
        <h5 className="mb-0">
          <i className="bi bi-plus-circle me-2"></i>
          {isAddMode ? 'Add New Destination' : 'Edit Destination'}
        </h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-1">
            <label htmlFor="name">Name:</label>
            <input
              className="form-control"
              id="name"
              name="name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-1">
            <label htmlFor="resourceId">Resource:</label>
            <select
              className="form-control"
              id="resourceId"
              name="resourceId"
              value={resourceId}
              onChange={e => setResourceId(e.target.value)}
              required
            >
              <option value="">Select a resource</option>
              {Object.values(resources).map(resource => (
                <option key={resource.id} value={resource.id}>
                  {resource.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-1">
            <label htmlFor="travelTime">Travel Time (seconds):</label>
            <input
              id="travelTime"
              type="number"
              className="form-control"
              name="travelTime"
              value={travelTime}
              onChange={e => setTravelTime(parseInt(e.target.value) || 60)}
              required
            />
          </div>
          <div className="mb-1">
            <label htmlFor="classes">Classes:</label>
            <select
              className="form-control"
              id="classes"
              name="classes"
              value={classes}
              multiple
              onChange={e =>
                setClasses(
                  Array.from(
                    e.target.selectedOptions,
                    option => option.value as TrainClass
                  )
                )
              }
              required
            >
              {Object.values(TrainClass).map(trainClass => (
                <option key={trainClass} value={trainClass}>
                  {trainClass.charAt(0).toUpperCase() + trainClass.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-1">
            <label htmlFor="country">Country:</label>
            <select
              className="form-control"
              id="country"
              name="country"
              value={country}
              onChange={e => setCountry(e.target.value as Country)}
              required
            >
              {Object.values(Country).map(country => (
                <option key={country} value={country}>
                  {country.charAt(0).toUpperCase() + country.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="d-flex gap-2 mt-4">
            <button type="submit" className="btn btn-primary">
              <i className="bi bi-check-lg me-1"></i>
              {isAddMode ? 'Add Destination' : 'Save Changes'}
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
