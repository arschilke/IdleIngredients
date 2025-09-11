import type {
  Resource,
} from '../../types';
import React, { type FormEvent, useState } from 'react';
import { generateId } from '../../../utils';
import { useResources } from '../../hooks/useResources';

interface ResourceFormProps {
  resource?: Resource;
  onSubmit: (resource: Resource) => void;
  onClose: () => void;
}
export const ResourceForm: React.FC<ResourceFormProps> = ({
  resource,
  onSubmit,
  onClose,
}) => {
  const isAddMode = !resource;
  const { data: resources = {} } = useResources();
  const [name, setName] = useState<string>(resource?.name ?? '');
  const [icon, setIcon] = useState<string>(resource?.icon ?? '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert('Please add a resource name');
      return;
    }

    if (!icon) {
      alert('Please add a resource icon');
      return;
    }

    const newResource: Resource = {
      id: resource?.id ?? generateId('resource'),
      name: name,
      icon: icon,
    } as Resource;

    onSubmit(newResource);

    // Reset form
    setName('');
    setIcon('');
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">
          <i className="bi bi-plus-circle me-2"></i>
          {isAddMode ? 'Add New Resource' : 'Edit Resource'}
        </h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-1">
            <label htmlFor="resourceName">Resource Name:</label>
            <input
              className="form-control"
              id="resourceName"
              type="text"
              name="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter resource name"
              required
            />
          </div>
          <div className="mb-1">
            <label htmlFor="resourceIcon">Icon:</label>
            <input
              className="form-control"
              id="resourceIcon"
              type="text"
              name="icon"
              value={icon}
              onChange={e => setIcon(e.target.value)}
              placeholder="Enter icon filename (e.g., Icon_Coal.png)"
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
