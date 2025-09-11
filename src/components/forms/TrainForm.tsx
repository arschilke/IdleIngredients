import {
  Country,
  TrainClass,
  TrainEngine,
  type Resource,
  type Train,
} from '../../types';
import React, { type FormEvent, useState } from 'react';
import { generateId } from '../../../utils';
import { useResources } from '../../hooks/useResources';

interface TrainFormProps {
  train?: Train;
  onSubmit: (train: Train) => void;
  onClose: () => void;
}
export const TrainForm: React.FC<TrainFormProps> = ({
  train,
  onSubmit,
  onClose,
}) => {
  const isAddMode = !train;
  const { data: resources = {} } = useResources();

  const [name, setName] = useState<string>(train?.name ?? '');
  const [capacity, setCapacity] = useState<number>(train?.capacity ?? 10);
  const [trainClass, setTrainClass] = useState<TrainClass>(
    train?.class ?? TrainClass.Common
  );
  const [engine, setEngine] = useState<TrainEngine>(
    train?.engine ?? TrainEngine.Steam
  );
  const [country, setCountry] = useState<Country>(
    train?.country ?? Country.Britain
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!name) {
      alert('Please add a train name');
      return;
    }

    const newTrain: Train = {
      id: train?.id ?? generateId('train'),
      name: name,
      capacity: capacity,
      class: trainClass as TrainClass,
      engine: engine,
      country: country,
    } as Train;

    onSubmit(newTrain);

    // Reset form
    setName('');
    setCapacity(10);
    setTrainClass(TrainClass.Common);
    setEngine(TrainEngine.Steam);
    setCountry(Country.Britain);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">
          <i className="bi bi-plus-circle me-2"></i>
          {isAddMode ? 'Add New Train' : 'Edit Train'}
        </h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-1">
            <label htmlFor="trainName">Train Name:</label>
            <input
              className="form-control"
              id="trainName"
              type="text"
              name="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter train name"
              required
            />
          </div>
          <div className="mb-1">
            <label htmlFor="capacity">Capacity:</label>
            <input
              className="form-control"
              id="capacity"
              type="number"
              name="capacity"
              value={capacity}
              onChange={e => setCapacity(parseInt(e.target.value) || 0)}
              placeholder="Enter capacity"
              required
            />
          </div>

          <div className="mb-1">
            <label htmlFor="trainClass">Class:</label>
            <select
              className="form-control"
              id="trainClass"
              name="class"
              value={trainClass}
              onChange={e => setTrainClass(e.target.value as TrainClass)}
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
            <label htmlFor="engine">Engine:</label>
            <select
              className="form-control"
              id="engine"
              name="engine"
              value={engine}
              onChange={e => setEngine(e.target.value as TrainEngine)}
              required
            >
              {Object.values(TrainEngine).map(engine => (
                <option key={engine} value={engine}>
                  {engine.charAt(0).toUpperCase() + engine.slice(1)}
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
