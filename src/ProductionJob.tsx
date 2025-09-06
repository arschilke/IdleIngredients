import React, { useState } from 'react';
import {
  Factory,
  Destination,
  Resource,
  Train,
  Step,
  FactoryStep,
  SubmitStep,
  DeliveryStep,
  DestinationStep,
  ResourceRequirement,
} from './types';
import { formatTime, generateId } from './utils';
import { inputAmounts, outputAmount } from './data';

interface ProductionJobProps {
  job: Step;
  resources: Record<string, Resource>;
  factories: Record<string, Factory>;
  destinations: Record<string, Destination>;
  trains: Record<string, Train>;
  maxConcurrentTrains: number;
  onJobUpdate: (updatedJob: Step) => void;
  onAddJobToLevel: (newStep: Step, targetLevel: number) => void;
  onRemoveJob: (stepId: string) => void;
  onReorderJob?: (jobId: string, newIndex: number) => void;
  onMoveToLevel?: (jobId: string, targetLevel: number) => void;
  getBestTrains: (amount: number, trains: Record<string, Train>) => Train[];
  isDragging?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

export const ProductionJob: React.FC<ProductionJobProps> = ({
  job,
  resources,
  factories,
  destinations,
  trains,
  onJobUpdate,
  onAddJobToLevel,
  onRemoveJob,
  getBestTrains,
  isDragging,
  dragHandleProps,
}) => {
  const [editingJob, setEditingJob] = useState<boolean>(false);
  const [editingJobData, setEditingJobData] = useState<Partial<Step>>({});

  const startEditingJob = () => {
    setEditingJob(true);
    setEditingJobData({
      type: job.type,
      trainId:
        job.type === 'destination' || job.type === 'delivery'
          ? job.trainId
          : undefined,
      recipe: job.type === 'factory' ? job.recipe : undefined,
      destination: job.type === 'destination' ? job.destination : undefined,
    });
  };

  const saveJobEdit = () => {
    const updatedJob = {
      ...job,
      ...editingJobData,
    };

    onJobUpdate(updatedJob as Step);
    setEditingJob(false);
    setEditingJobData({});
  };

  const cancelJobEdit = () => {
    setEditingJob(false);
    setEditingJobData({});
  };

  const handleResourceClick = (requirement: ResourceRequirement) => {
    const resourceId = requirement.resourceId;
    const targetLevel = job.levelId - 1;
    const recipe = Object.values(factories)
      .flatMap(f => f.recipes)
      .find(r => r.resourceId === resourceId);
    const destination = Object.values(destinations).find(
      d => d.resourceId === resourceId
    );

    let newStep: Step | null = null;
    if (recipe) {
      // Create factory job
      newStep = {
        id: generateId('step'),
        type: 'factory',
        resourceId: recipe.resourceId,
        levelId: targetLevel,
        recipe: recipe,
        timeRequired: recipe.timeRequired,
      };
    } else if (destination) {
      // Create destination job
      const bestTrain = getBestTrains(requirement.amount, trains)[0];
      newStep = {
        id: generateId('step'),
        type: 'destination',
        resourceId,
        levelId: targetLevel,
        timeRequired: destination.travelTime,
        destination,
        trainId: bestTrain.id,
      };
    }
    if (newStep === null) {
      return;
    }
    onAddJobToLevel(newStep, targetLevel);
  };

  const renderJobEditForm = () => {
    if (!editingJob) return null;

    return (
      <div className="job-edit-form p-3 border rounded mt-2">
        <h6 className="mb-2">
          Edit Job:{' '}
          {(job.type === 'delivery' && job.order?.name) ||
            resources[job.resourceId].name}
        </h6>

        {job.type !== 'delivery' && (
          <div className="d-flex gap-2">
            <label className="form-label">Job Type:</label>
            <select
              value={job.type}
              onChange={e =>
                setEditingJobData(prev => {
                  return {
                    ...prev,
                    type: e.target.value as
                      | 'factory'
                      | 'destination'
                      | 'delivery'
                      | 'submit',
                  } as Partial<
                    FactoryStep | DestinationStep | DeliveryStep | SubmitStep
                  >;
                })
              }
            >
              <option value="factory">Factory</option>
              <option value="destination">Destination</option>
              <option value="delivery">Delivery</option>
              <option value="submit">Submit</option>
            </select>
          </div>
        )}
        {/* Train Assignment */}
        {(job.type === 'destination' || job.type === 'delivery') && (
          <div className="mb-2">
            <label className="form-label">Assign Train:</label>
            <select
              className="form-select form-select-sm"
              value={
                (editingJobData as Partial<DestinationStep | DeliveryStep>)
                  .trainId || ''
              }
              onChange={e =>
                setEditingJobData(prev => ({
                  ...prev,
                  trainId: e.target.value || undefined,
                }))
              }
            >
              <option value="">No Train Assigned</option>
              {Object.values(trains).map(train => (
                <option key={train.id} value={train.id}>
                  {train.name} (Capacity: {train.capacity})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Recipe Selection for Factory Jobs */}
        {job.type === 'factory' && (
          <div className="mb-2">
            <label className="form-label">Recipe:</label>
            <select
              className="form-select form-select-sm"
              value={(editingJobData as FactoryStep).recipe?.resourceId || ''}
              onChange={e => {
                const selectedRecipe = Object.values(factories)
                  .flatMap(f => f.recipes)
                  .find(r => r.resourceId === e.target.value);
                setEditingJobData(prev => ({
                  ...prev,
                  recipe: selectedRecipe,
                }));
              }}
            >
              {Object.values(factories)
                .flatMap(f => f.recipes)
                .filter(r => r.resourceId === job.resourceId)
                .map(recipe => (
                  <option key={recipe.resourceId} value={recipe.resourceId}>
                    {recipe.requires
                      .map(
                        req => `${req.amount} ${resources[req.resourceId].name}`
                      )
                      .join(' + ')}{' '}
                    → {recipe.outputAmount} {resources[recipe.resourceId].name}
                  </option>
                ))}
            </select>
          </div>
        )}

        <div className="d-flex gap-2">
          <button className="btn btn-success btn-sm" onClick={saveJobEdit}>
            <i className="bi bi-check"></i> Save
          </button>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={cancelJobEdit}
          >
            <i className="bi bi-x"></i> Cancel
          </button>
        </div>
      </div>
    );
  };

  const renderJobDetails = () => {
    return (
      <div className="job-details">
        <div className="d-flex justify-content-between align-items-center gap-1">
          <div>
            <span className="badge bg-secondary ms-2">
              {job.type.toLocaleUpperCase()}
            </span>
            <strong className="ms-2">
              {(job.type === 'delivery' && job.order?.name) ||
                resources[job.resourceId].name}
            </strong>

            {/* Train Assignment Display */}
            {'trainId' in job && job.trainId && (
              <span className="badge bg-info ms-2">
                <i className="bi bi-train-front"></i> {trains[job.trainId].name}
              </span>
            )}
          </div>

          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={startEditingJob}
            >
              <i className="bi bi-pencil"></i> Edit
            </button>
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={() => onRemoveJob(job.id)}
              title="Remove this job from the level"
            >
              <i className="bi bi-trash"></i> Remove
            </button>
          </div>
        </div>
        <div className="d-flex justify-content-between align-items-center gap-1 mt-2">
          {/* Recipe Information */}
          {'recipe' in job && job.recipe && (
            <div>
              <small className="text-muted d-block">Recipe:</small>
              <div className="d-flex flex-wrap gap-1 mb-2">
                {job.recipe.requires.map((req, index) => (
                  <button
                    key={index}
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => handleResourceClick(req)}
                  >
                    {req.amount} {resources[req.resourceId].name}
                  </button>
                ))}
              </div>
              <small className="text-muted">
                Output: {outputAmount(job)}{' '}
                {resources[job.recipe.resourceId].name}
              </small>
            </div>
          )}
          {'order' in job && job.order && (
            <div>
              <small className="text-muted d-block">Resources:</small>
              <div className="d-flex flex-wrap gap-1 mb-2">
                {job.order?.resources.map((req, index) => (
                  <button
                    key={index}
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => handleResourceClick(req)}
                  >
                    {resources[req.resourceId].name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Destination Information */}
          {'destination' in job && job.destination && (
            <div>
              <small className="text-muted">
                Travel time: {formatTime(job.destination.travelTime)}
              </small>
            </div>
          )}

          {/* Time and Amount */}
          {job.type == 'delivery' && (
            <div className="text-end">
              <div className="text-muted small">
                {formatTime(job.order?.travelTime || 0)}
              </div>
              <div className="text-muted small">
                Amount: {inputAmounts(job).get(job.resourceId) || 0}
              </div>
            </div>
          )}

          {job.type === 'submit' && (
            <div className="text-end">
              <div className="text-muted small">
                Amount: {outputAmount(job)}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`job-item p-2 mb-1 border rounded ${isDragging ? 'dragging' : ''}`}
    >
      {/* Drag Handle */}
      <div className="d-flex align-items-start">
        <div
          className="drag-handle me-2 cursor-grab"
          style={{ cursor: 'grab' }}
          {...dragHandleProps}
          title="Drag to reorder or move to different level"
        >
          <i className="bi bi-grip-vertical text-muted"></i>
        </div>

        <div className="flex-grow-1">
          {renderJobDetails()}
          {renderJobEditForm()}
        </div>
      </div>
    </div>
  );
};
