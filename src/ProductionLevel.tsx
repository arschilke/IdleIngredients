import React, { useState } from 'react';
import {
  PlanningLevel,
  PlannedStep,
  Recipe,
  Destination,
  Resource,
  Factory,
  Train,
} from './types';
import { ProductionJob } from './ProductionJob';
import { formatTime } from './utils';
//import { getBestTrains } from './trainUtils';
import { checkLevelResourceSufficiency } from './inventoryUtils';

interface ProductionLevelProps {
  level: PlanningLevel;
  resources: Resource[];
  factories: Factory[];
  destinations: Destination[];
  trains: Train[];
  maxConcurrentTrains: number;
  isActiveLevel: boolean;
  onLevelClick: (levelNumber: number) => void;
  onRemoveLevel: (levelNumber: number) => void;
  onLevelChange: (updatedLevel: PlanningLevel) => void;
  onAddStepToLevel: (step: PlannedStep, targetLevel: number) => void;
  onReorderJob?: (levelNumber: number, jobId: string, newIndex: number) => void;
  onMoveJobToLevel?: (
    jobId: string,
    fromLevel: number,
    toLevel: number
  ) => void;
}

export const ProductionLevel: React.FC<ProductionLevelProps> = ({
  level,
  resources,
  factories,
  destinations,
  trains,
  maxConcurrentTrains,
  isActiveLevel,
  previousLevelWarehouseState,
  onLevelClick,
  onRemoveLevel,
  onLevelChange,
  onReorderJob,
  onMoveJobToLevel,
}) => {
  const [showAddJobModal, setShowAddJobModal] = useState<boolean>(false);
  const [newJobType, setNewJobType] = useState<
    'factory' | 'destination' | 'delivery'
  >('factory');
  const [selectedResource, setSelectedResource] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedDestination, setSelectedDestination] =
    useState<Destination | null>(null);
  const [draggedJobId, setDraggedJobId] = useState<string | null>(null);
  const [dragOverLevel, setDragOverLevel] = useState<number | null>(null);
  const [dragOverJobIndex, setDragOverJobIndex] = useState<number | null>(null);

  // Check if inventory has enough resources for all jobs in this level
  const checkInventorySufficiency = () => {
    // Use the utility function to check resource sufficiency based on previous level's warehouse state
    const insufficientResources = checkLevelResourceSufficiency(
      level,
      previousLevelWarehouseState
    );

    // Add resource names to the insufficient resources
    return insufficientResources.map(resource => ({
      ...resource,
      name:
        resources.find((r: Resource) => r.id === resource.resourceId)?.name ||
        resource.resourceId,
    }));
  };

  const updateInventory = () => {
    const updatedInventory = new Map(resources.map(r => [r.id, 0]));
    level.steps.forEach(step => {
      switch (step.type) {
        case 'factory':
          step.recipe?.requires.forEach(req => {
            var currentAmount =
              updatedInventory.get(req.resourceId) ?? 0 - req.amount;
            updatedInventory.set(req.resourceId, currentAmount);
          });
          updatedInventory.set(
            step.resourceId,
            updatedInventory.get(step.resourceId) ?? 0 + step.amountProcessed
          );
          break;
        case 'delivery':
          updatedInventory.set(
            step.resourceId,
            updatedInventory.get(step.resourceId) ?? 0 - step.amountProcessed
          );
          break;
        case 'destination':
          updatedInventory.set(
            step.resourceId,
            updatedInventory.get(step.resourceId) ?? 0 + step.amountProcessed
          );
          break;
      }
    });

    return updatedInventory;
  };

  const onAddJobToLevel = (newStep: PlannedStep) => {
    level.steps.push(newStep);
    level.endTime = Math.max(...level.steps.map(s => s.endTime || 0));
    level.estimatedTime = Math.max(...level.steps.map(s => s.endTime || 0));
    level.trainCount = level.steps.filter(
      step => step.trainId !== undefined
    ).length;
    level.inventoryChanges = updateInventory();
    onLevelChange(level);
  };

  const onRemoveStep = (stepId: string) => {
    const updatedSteps = level.steps.filter(step => step.id !== stepId);
    const updatedLevel = {
      ...level,
      steps: updatedSteps,
      inventoryChanges: updateInventory(),
    };
    onLevelChange(updatedLevel);
  };

  // Handle job reordering within the same level
  const handleReorderJob = (jobId: string, newIndex: number) => {
    if (onReorderJob) {
      onReorderJob(level.level, jobId, newIndex);
    }
  };

  // Handle moving a job to a different level
  const handleMoveJobToLevel = (jobId: string, targetLevel: number) => {
    if (onMoveJobToLevel && targetLevel !== level.level) {
      onMoveJobToLevel(jobId, level.level, targetLevel);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, jobId: string) => {
    setDraggedJobId(jobId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', jobId);
  };

  const handleDragOver = (e: React.DragEvent, jobIndex?: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (jobIndex !== undefined) {
      setDragOverJobIndex(jobIndex);
    }
    setDragOverLevel(level.level);
  };

  const handleDragLeave = () => {
    setDragOverJobIndex(null);
    setDragOverLevel(null);
  };

  const handleDrop = (e: React.DragEvent, targetJobIndex?: number) => {
    e.preventDefault();
    const draggedJobId = e.dataTransfer.getData('text/plain');

    if (draggedJobId && draggedJobId !== '') {
      if (targetJobIndex !== undefined) {
        // Reordering within the same level
        handleReorderJob(draggedJobId, targetJobIndex);
      } else {
        // Moving to this level (at the end)
        handleMoveJobToLevel(draggedJobId, level.level);
      }
    }

    setDraggedJobId(null);
    setDragOverJobIndex(null);
    setDragOverLevel(null);
  };

  return (
    <div
      className={`level-container mb-2 p-3 border rounded bg-opacity-10 ${
        level.done
          ? 'bg-secondary border-secondary text-muted'
          : level.trainCount > maxConcurrentTrains
            ? 'bg-danger border-danger'
            : 'bg-light'
      } ${isActiveLevel ? 'border-primary border-2 shadow-lg' : ''} ${showAddJobModal ? 'modal-open' : ''} ${dragOverLevel === level.level ? 'drag-over' : ''}`}
      onDragOver={e => handleDragOver(e)}
      onDragLeave={handleDragLeave}
      onDrop={e => handleDrop(e)}
    >
      <div className="level-header d-flex justify-content-between align-items-center mb-2">
        <div className="d-flex align-items-center gap-2">
          <h5
            className={`mb-0 cursor-pointer ${isActiveLevel ? 'text-primary fw-bold' : ''}`}
            onClick={() => onLevelClick(level.level)}
          >
            Level {level.level}
          </h5>
          {level.done && (
            <span className="badge bg-secondary">
              <i className="bi bi-check-circle"></i> Done
            </span>
          )}
          {level.trainCount > maxConcurrentTrains && (
            <span className="badge bg-danger">
              <i className="bi bi-exclamation-triangle"></i> Over Capacity
            </span>
          )}
          {checkInventorySufficiency().length > 0 && (
            <span className="badge bg-warning">
              <i className="bi bi-exclamation-triangle"></i> Insufficient
              Resources
            </span>
          )}
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowAddJobModal(true)}
            disabled={level.done}
            title="Add a new job to this level"
          >
            <i className="bi bi-plus-circle"></i> Add Job
          </button>
          <button
            className={`btn btn-sm ${level.done ? 'btn-outline-secondary' : 'btn-success'}`}
            onClick={() => onLevelChange({ ...level, done: !level.done })}
          >
            {level.done ? (
              <>
                <i className="bi bi-check-circle"></i> Done
              </>
            ) : (
              <>
                <i className="bi bi-check"></i> Mark Done
              </>
            )}
          </button>
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={() => onRemoveLevel(level.level)}
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>
      </div>

      <div className="level-info mb-2">
        <small className="text-muted">
          {level.description} • {level.trainCount} trains •{' '}
          {formatTime(level.estimatedTime)}
        </small>
      </div>

      <div className="level-steps">
        {level.steps.length === 0 ? (
          <div
            className="drop-zone p-3 text-center text-muted border-2 border-dashed rounded"
            onDragOver={e => handleDragOver(e)}
            onDrop={e => handleDrop(e)}
          >
            <i className="bi bi-arrow-down-circle fs-1"></i>
            <p className="mb-0">Drop jobs here to move them to this level</p>
          </div>
        ) : (
          level.steps.map((step, stepIndex) => (
            <React.Fragment key={step.id}>
              {/* Drop zone above each job */}
              <div
                className={`drop-zone ${dragOverJobIndex === stepIndex ? 'bg-primary bg-opacity-25' : ''}`}
                style={{ height: '8px', margin: '2px 0' }}
                onDragOver={e => handleDragOver(e, stepIndex)}
                onDrop={e => handleDrop(e, stepIndex)}
              />

              <ProductionJob
                job={step}
                resources={resources}
                factories={factories}
                destinations={destinations}
                trains={trains}
                maxConcurrentTrains={maxConcurrentTrains}
                onJobUpdate={updatedJob => {
                  const updatedSteps = level.steps.map(s =>
                    s.id === updatedJob.id ? updatedJob : s
                  );
                  const updatedLevel = {
                    ...level,
                    steps: updatedSteps,
                    inventoryChanges: updateInventory(),
                  };
                  onLevelChange(updatedLevel);
                }}
                onAddJobToLevel={onAddJobToLevel}
                onRemoveJob={onRemoveStep}
                onReorderJob={handleReorderJob}
                onMoveToLevel={handleMoveJobToLevel}
                isDragging={draggedJobId === step.id}
                dragHandleProps={{
                  draggable: true,
                  onDragStart: (e: React.DragEvent) =>
                    handleDragStart(e, step.id),
                }}
              />
            </React.Fragment>
          ))
        )}

        {/* Drop zone at the end of all jobs */}
        <div
          className={`drop-zone ${dragOverJobIndex === level.steps.length ? 'bg-primary bg-opacity-25' : ''}`}
          style={{ height: '8px', margin: '2px 0' }}
          onDragOver={e => handleDragOver(e, level.steps.length)}
          onDrop={e => handleDrop(e, level.steps.length)}
        />
      </div>

      {/* Add Job Modal */}
      {showAddJobModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Job to Level {level.level}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddJobModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Job Type:</label>
                  <select
                    className="form-select"
                    value={newJobType}
                    onChange={e =>
                      setNewJobType(
                        e.target.value as 'factory' | 'destination' | 'delivery'
                      )
                    }
                  >
                    <option value="factory">Factory Production</option>
                    <option value="destination">Resource Gathering</option>
                    <option value="delivery">Delivery</option>
                  </select>
                </div>

                {newJobType === 'factory' && (
                  <div className="mb-3">
                    <label className="form-label">Resource to Produce:</label>
                    <select
                      className="form-select"
                      value={selectedResource}
                      onChange={e => {
                        setSelectedResource(e.target.value);
                        const recipe = factories
                          .flatMap((f: Factory) => f.recipes)
                          .find((r: Recipe) => r.resourceId === e.target.value);
                        setSelectedRecipe(recipe || null);
                      }}
                    >
                      <option value="">Select a resource...</option>
                      {factories
                        .flatMap((f: Factory) => f.recipes)
                        .map((recipe: Recipe) => (
                          <option
                            key={recipe.resourceId}
                            value={recipe.resourceId}
                          >
                            {resources.find(
                              (r: Resource) => r.id === recipe.resourceId
                            )?.name || recipe.resourceId}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                {newJobType === 'destination' && (
                  <div className="mb-3">
                    <label className="form-label">Destination:</label>
                    <select
                      className="form-select"
                      value={selectedDestination?.id || ''}
                      onChange={e => {
                        const dest = destinations.find(
                          (d: Destination) => d.id === e.target.value
                        );
                        setSelectedDestination(dest || null);
                      }}
                    >
                      <option value="">Select a destination...</option>
                      {destinations.map((dest: Destination) => (
                        <option key={dest.id} value={dest.id}>
                          {dest.resourceId} ({dest.travelTime}s)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {newJobType === 'delivery' && (
                  <div className="mb-3">
                    <label className="form-label">Delivery Job:</label>
                    <p className="text-muted small">
                      Delivery jobs are typically created when planning
                      production for orders.
                    </p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddJobModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    if (newJobType === 'factory' && selectedRecipe) {
                      const newStep: PlannedStep = {
                        id: `factory_${selectedRecipe.resourceId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        type: 'factory',
                        resourceId: selectedRecipe.resourceId,
                        level: level.level,
                        timeRequired: selectedRecipe.timeRequired,
                        amountProcessed: selectedRecipe.outputAmount,
                        dependencies: [],
                        recipe: selectedRecipe,
                      };
                      onAddJobToLevel(newStep);
                    } else if (
                      newJobType === 'destination' &&
                      selectedDestination
                    ) {
                      const newStep: PlannedStep = {
                        id: `destination_${selectedDestination.resourceId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        type: 'destination',
                        resourceId: selectedDestination.resourceId,
                        level: level.level,
                        timeRequired: selectedDestination.travelTime,
                        amountProcessed: 0,
                        dependencies: [],
                        destination: selectedDestination,
                      };
                      onAddJobToLevel(newStep);
                    }
                    setShowAddJobModal(false);
                    setSelectedResource('');
                    setSelectedRecipe(null);
                    setSelectedDestination(null);
                  }}
                  disabled={
                    (newJobType === 'factory' && !selectedRecipe) ||
                    (newJobType === 'destination' && !selectedDestination)
                  }
                >
                  Add Job
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
