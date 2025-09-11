import type {
  Resource,
  Factory,
  } from '../../types';
import React, { type FormEvent, useState } from 'react';
import { generateId } from '../../../utils';
import { useResources } from '../../hooks/useResources';
import { useFactories } from '../../hooks/useFactories';

interface FactoryFormProps {
  factory?: Factory;
  onSubmit: (factory: Factory) => void;
  onClose: () => void;
}
export const FactoryForm: React.FC<FactoryFormProps> = ({
  factory,
  onSubmit,
  onClose,
}) => {
  const isAddMode = !factory;
  const { data: factories = {} } = useFactories();
  const [name, setName] = useState<string>(factory?.name ?? '');
  const [queueMaxSize, setQueueMaxSize] = useState<number>(factory?.queueMaxSize ?? 2);
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert('Please add a factory name');
      return;
    }

    if (!queueMaxSize) {
      alert('Please add a factory queue max size');
      return;
    }

    const newFactory: Factory = {
      id: factory?.id ?? generateId('factory'),
      name: name,
      queueMaxSize: queueMaxSize,
      recipes: [],
    } as Factory;

    onSubmit(newFactory);

    // Reset form
    setName('');
    setQueueMaxSize(2);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">
          <i className="bi bi-plus-circle me-2"></i>
          {isAddMode ? 'Add New Factory' : 'Edit Factory'}
        </h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
        <div className="form-group">
              <label htmlFor="factoryName">Factory Name:</label>
              <input
                id="factoryName"
                type="text"
                className="form-control"
                name="name"
                value={name}
                onChange={e =>
                  setName(e.target.value)
                }
                placeholder="Enter factory name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="factoryQueueMaxSize">Queue Max Size:</label>
              <input
                id="factoryQueueMaxSize"
                type="number" 
                className="form-control"
                name="queueMaxSize"
                value={queueMaxSize}
                onChange={e =>
                  setQueueMaxSize(parseInt(e.target.value) || 0)
                }
                placeholder="Enter queue max size"
                required
              />
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
