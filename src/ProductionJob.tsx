import React, { useState } from 'react';
import { PlannedStep, GameState, PlannedStepType } from './types';
import { formatTime, getResourceName, generateId } from './utils';

interface ProductionJobProps {
  job: PlannedStep;
  gameState: GameState;
  onJobUpdate: (updatedJob: PlannedStep) => void;
  onAddJobToLevel: (newStep: PlannedStep, targetLevel: number) => void;
  onRemoveJob: (stepId: string) => void;
  onReorderJob?: (jobId: string, newIndex: number) => void;
  onMoveToLevel?: (jobId: string, targetLevel: number) => void;
  isDragging?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

export const ProductionJob: React.FC<ProductionJobProps> = ({
  job,
  gameState,
  onJobUpdate,
  onAddJobToLevel,
  onRemoveJob,
  isDragging,
  dragHandleProps,
}) => {
  const [editingJob, setEditingJob] = useState<boolean>(false);
  const [editingJobData, setEditingJobData] = useState<Partial<PlannedStep>>(
    {}
  );

  const startEditingJob = () => {
    setEditingJob(true);
    setEditingJobData({
      trainId: job.trainId,
      recipe: job.recipe,
      destination: job.destination,
    });
  };

  const saveJobEdit = () => {
    const updatedJob = {
      ...job,
      ...editingJobData,
    };

    onJobUpdate(updatedJob);
    setEditingJob(false);
    setEditingJobData({});
  };

  const cancelJobEdit = () => {
    setEditingJob(false);
    setEditingJobData({});
  };

  const handleResourceClick = (resourceId: string, currentLevel: number) => {
    if (currentLevel <= 1) return;

    const targetLevel = currentLevel - 1;
    const recipe = gameState.factories
      .flatMap(f => f.recipes)
      .find(r => r.resourceId === resourceId);
    const destination = gameState.destinations.find(
      d => d.resourceId === resourceId
    );

    if (recipe) {
      // Create factory job
      const newStep: PlannedStep = {
        id: generateId('step'),
        type: 'factory',
        resourceId: recipe.resourceId,
        level: targetLevel,
        timeRequired: recipe.timeRequired,
        amountProcessed: 0,
        dependencies: [],
        recipe: recipe,
      };

      onAddJobToLevel(newStep, targetLevel);
    } else if (destination) {
      // Create destination job
      const newStep: PlannedStep = {
        id: generateId('step'),
        type: 'destination',
        resourceId,
        level: targetLevel,
        timeRequired: destination.travelTime,
        amountProcessed: 0,
        dependencies: [],
        destination,
      };

      onAddJobToLevel(newStep, targetLevel);
    }
  };

  const renderJobEditForm = () => {
    if (!editingJob) return null;

    return (
      <div className="job-edit-form p-3 border rounded mt-2">
        <h6 className="mb-2">
          Edit Job:{' '}
          {(job.type === 'delivery' && job.order?.name) ||
            getResourceName(job.resourceId, gameState)}
        </h6>

        {job.type !== 'delivery' && (
          <div className="d-flex gap-2">
            <label className="form-label">Job Type:</label>
            <select
              className="form-select form-select-sm"
              value={job.type}
              onChange={e =>
                setEditingJobData(prev => ({
                  ...prev,
                  type: e.target.value as PlannedStepType,
                }))
              }
            >
              <option value="factory">Factory</option>
              <option value="destination">Destination</option>
            </select>
          </div>
        )}
        {/* Train Assignment */}
        {job.type === 'destination' ||
          (job.type === 'delivery' && (
            <div className="mb-2">
              <label className="form-label">Assign Train:</label>
              <select
                className="form-select form-select-sm"
                value={editingJobData.trainId || ''}
                onChange={e =>
                  setEditingJobData(prev => ({
                    ...prev,
                    trainId: e.target.value || undefined,
                  }))
                }
              >
                <option value="">No Train Assigned</option>
                {gameState.trains.map(train => (
                  <option key={train.id} value={train.id}>
                    {train.name} (Capacity: {train.capacity})
                  </option>
                ))}
              </select>
            </div>
          ))}

        {/* Recipe Selection for Factory Jobs */}
        {job.type === 'factory' && (
          <div className="mb-2">
            <label className="form-label">Recipe:</label>
            <select
              className="form-select form-select-sm"
              value={editingJobData.recipe?.resourceId || ''}
              onChange={e => {
                const selectedRecipe = gameState.factories
                  .flatMap(f => f.recipes)
                  .find(r => r.resourceId === e.target.value);
                setEditingJobData(prev => ({
                  ...prev,
                  recipe: selectedRecipe,
                }));
              }}
            >
              {gameState.factories
                .flatMap(f => f.recipes)
                .filter(r => r.resourceId === job.resourceId)
                .map(recipe => (
                  <option key={recipe.resourceId} value={recipe.resourceId}>
                    {recipe.requires
                      .map(
                        req =>
                          `${req.amount} ${getResourceName(req.resourceId, gameState)}`
                      )
                      .join(' + ')}{' '}
                    → {recipe.outputAmount}{' '}
                    {getResourceName(recipe.resourceId, gameState)}
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
                getResourceName(job.resourceId, gameState)}
            </strong>

            {/* Train Assignment Display */}
            {job.trainId && (
              <span className="badge bg-info ms-2">
                <i className="bi bi-train-front"></i>{' '}
                {gameState.trains.find(t => t.id === job.trainId)?.name}
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
          {job.recipe && (
            <div>
              <small className="text-muted d-block">Recipe:</small>
              <div className="d-flex flex-wrap gap-1 mb-2">
                {job.recipe.requires.map((req, index) => (
                  <span
                    key={index}
                    className="badge bg-outline-secondary cursor-pointer"
                    onClick={() =>
                      handleResourceClick(req.resourceId, job.level)
                    }
                    style={{ cursor: 'pointer' }}
                  >
                    {req.amount} {getResourceName(req.resourceId, gameState)}
                  </span>
                ))}
              </div>
              <small className="text-muted">
                Output: {job.recipe.outputAmount}{' '}
                {getResourceName(job.recipe.resourceId, gameState)}
              </small>
            </div>
          )}

          {/* Destination Information */}
          {job.destination && (
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
                {formatTime(job.timeRequired)}
              </div>
              <div className="text-muted small">
                Amount: {job.amountProcessed}
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
