import type { Recipe, ResourceRequirement } from '../../types';
import React, { type FormEvent, useState } from 'react';
import { generateId } from '../../../utils';
import { useResources } from '../../hooks/useResources';

interface RecipeFormProps {
  recipe?: Recipe;
  onSubmit: (recipe: Recipe) => void;
  onClose: () => void;
}
export const RecipeForm: React.FC<RecipeFormProps> = ({
  recipe,
  onSubmit,
  onClose,
}) => {
  const isAddMode = !recipe;
  const { data: resources = {} } = useResources();
  const [resourceId, setResourceId] = useState<string>(
    recipe?.resourceId ?? ''
  );
  const [timeRequired, setTimeRequired] = useState<number>(
    recipe?.timeRequired ?? 0
  );
  const [outputAmount, setOutputAmount] = useState<number>(
    recipe?.outputAmount ?? 0
  );
  const [requirements, setRequires] = useState<ResourceRequirement[]>(
    recipe?.requires ?? [{ resourceId: '', amount: 0 }]
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!resourceId) {
      alert('Please add a resource name');
      return;
    }

    if (!timeRequired) {
      alert('Please add a recipe time required');
      return;
    }

    const newRecipe: Recipe = {
      resourceId: resourceId,
      timeRequired: timeRequired,
      outputAmount: outputAmount,
      requires: requirements,
    } as Recipe;

    onSubmit(newRecipe);

    // Reset form
    setResourceId('');
    setTimeRequired(0);
    setOutputAmount(0);
    setRequires([{ resourceId: '', amount: 0 }]);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">
          <i className="bi bi-plus-circle me-2"></i>
          {isAddMode ? 'Add New Recipe' : 'Edit Recipe'}
        </h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-1">
            <label htmlFor="recipeResource">Resource:</label>
            <select
              className="form-control"
              id="recipeResource"
              name="resourceId"
              required
              value={resourceId}
              onChange={e => setResourceId(e.target.value)}
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
            <label htmlFor="requirements">Requirements:</label>
          
          {requirements.map((resource, index) => (
            <div key={index} className="d-flex gap-2 mb-2">
              <select
                className="form-control flex-grow-1"
                value={resource.resourceId}
                onChange={e =>
                  setRequires(
                    requirements.map((r, i) =>
                      i === index ? { ...r, resourceId: e.target.value } : r
                    )
                  )
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
                  setRequires(
                    requirements.map((r, i) =>
                      i === index ? { ...r, amount: Number(e.target.value) } : r
                    )
                  )
                }
                placeholder="Amount"
                required
              />
              {requirements.length > 1 && (
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={() =>
                    setRequires(requirements.filter((_, i) => i !== index))
                  }
                >
                  <i className="bi bi-trash"></i>
                </button>
              )}
            </div>
          ))}
          </div>
          <div className="mb-1">
            <label htmlFor="timeRequired">Time Required:</label>
            <input
              className="form-control"
              type="number"
              name="timeRequired"
              value={timeRequired}
              onChange={e => setTimeRequired(parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="mb-1">
            <label htmlFor="recipeOutput">Output Amount:</label>
            <input
              id="recipeOutput"
              type="number"
              className="form-control"
              name="outputAmount"
              value={outputAmount}
              onChange={e => setOutputAmount(parseInt(e.target.value) || 0)}
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
