import React, { useState } from 'react';
import {
  PlanningLevel,
  Recipe,
  Destination,
  Resource,
  Factory,
  Train,
  Step,
  FactoryStep,
  DestinationStep,
  ProductionPlan,
  ResourceRequirement,
} from './types';
import { ProductionJob } from './ProductionJob';
import { getInventoryAtLevel, getInventoryChanges } from './inventoryUtils';

interface ProductionLevelProps {
  level: PlanningLevel;
  resources: Record<string, Resource>;
  factories: Record<string, Factory>;
  destinations: Record<string, Destination>;
  productionPlan: ProductionPlan;
  trains: Record<string, Train>;
  maxConcurrentTrains: number;
  isActiveLevel: boolean;
  onLevelClick: (levelNumber: number) => void;
  onRemoveLevel: (levelNumber: number) => void;
  onLevelChange: (updatedLevel: PlanningLevel) => void;
  onAddJobToLevel: (step: Step, targetLevel: number) => void;
  onMoveJobToLevel: (jobId: string, fromLevel: number, toLevel: number) => void;
  onInsertLevel: (levelNumber: number) => void;
  onCreateResourceJob: (
    requirement: ResourceRequirement,
    targetLevel: number
  ) => void;
}

export const ProductionLevel: React.FC<ProductionLevelProps> = ({
  level,
  resources,
  factories,
  destinations,
  productionPlan,
  trains,
  maxConcurrentTrains,
  isActiveLevel,
  onLevelClick,
  onRemoveLevel,
  onCreateResourceJob,
  onLevelChange,
  onMoveJobToLevel,
  onAddJobToLevel: onAddStepToLevel,
}) => {
  const [showAddJobModal, setShowAddJobModal] = useState<boolean>(false);
  const [showJobControls, setShowJobControls] = useState<boolean>(false);
 

  // Check if inventory has enough resources for all jobs in this level
  const checkInventorySufficiency = () => {
    var insufficientResources: string[] = [];
    const inventory = getInventoryAtLevel(productionPlan, level.level);
    Object.keys(inventory).forEach(resourceId => {
      if (inventory[resourceId] < 0) {
        insufficientResources.push(resourceId);
      }
    });
    return insufficientResources;
  };

  const onAddJobToLevel = (newStep: Step) => {
    onAddStepToLevel(newStep, newStep.levelId);
  };

  const onRemoveStep = (stepId: string) => {
    const updatedSteps = level.steps.filter(step => step.id !== stepId);
    const updatedLevel = {
      ...level,
      steps: updatedSteps,
    };
    updatedLevel.inventoryChanges = getInventoryChanges(updatedLevel);
    onLevelChange(updatedLevel);
  };
  // Handle moving a job to a different level
  const handleMoveJobToLevel = (jobId: string, targetLevel: number) => {
    if (targetLevel !== level.level) {
      onMoveJobToLevel(jobId, level.level, targetLevel);
    }
  };

  // Handle moving a job within the current level (back/forward)
  const handleMoveJobWithinLevel = (
    jobId: string,
    direction: 'back' | 'forward'
  ) => {
    const currentIndex = level.steps.findIndex(step => step.id === jobId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'back' ? currentIndex - 1 : currentIndex + 1;

    // Check bounds
    if (newIndex < 0 || newIndex >= level.steps.length) return;

    const newSteps = [...level.steps];
    const [movedJob] = newSteps.splice(currentIndex, 1);
    newSteps.splice(newIndex, 0, movedJob);

    const updatedLevel = {
      ...level,
      steps: newSteps,
    };
    updatedLevel.inventoryChanges = getInventoryChanges(updatedLevel);
    onLevelChange(updatedLevel);
  };

  // Handle moving a job to the end of previous level (rewind)
  const handleRewindJob = (jobId: string) => {
    const previousLevel = level.level - 1;
    onMoveJobToLevel(jobId, level.level, previousLevel);
  };

  // Handle moving a job to the beginning of next level (fast forward)
  const handleFastForwardJob = (jobId: string) => {
    const nextLevel = level.level + 1;
    onMoveJobToLevel(jobId, level.level, nextLevel);
  };

  const createResourceJob = (requirement: ResourceRequirement) => {
    onCreateResourceJob(requirement, level.level - 1);
  };

  const tooManyTrains =
    level.steps.filter(
      step =>
        (step.type === 'destination' || step.type === 'delivery') &&
        step.trainId !== undefined
    ).length > maxConcurrentTrains;

  return (
    <div
      className={`level-container mb-2 p-3 border rounded bg-opacity-10 ${
        level.done
          ? 'bg-secondary border-secondary text-muted'
          : tooManyTrains
            ? 'bg-danger border-danger'
            : 'bg-light'
      } ${isActiveLevel ? 'border-primary border-2 shadow-lg' : ''} ${showAddJobModal ? 'modal-open' : ''}`}
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
          {tooManyTrains && (
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
            className={`btn btn-sm ${showJobControls ? 'btn-outline-primary' : 'btn-outline-secondary'}`}
            onClick={() => setShowJobControls(!showJobControls)}
            title="Toggle job control buttons"
          >
            <i
              className={`bi ${showJobControls ? 'bi-eye-slash' : 'bi-eye'}`}
            ></i>
          </button>
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

      <div className="level-steps">
        {level.steps.length === 0 ? (
          <div className="p-3 text-center text-muted border-2 border-dashed rounded">
            <i className="bi bi-plus-circle fs-1"></i>
            <p className="mb-0">No jobs in this level</p>
          </div>
        ) : (
          <div>
            {level.steps.map((step, index) => (
              <div key={`${step.id}-container`} className="d-flex gap-1">
                {showJobControls && (
                  <div className="job-controls">
                    {/* Rewind button - move to end of previous level */}
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => handleRewindJob(step.id)}
                      title="Move to end of previous level"
                    >
                      <i className="bi bi-skip-backward"></i>
                    </button>

                    {/* Back button - move before sibling */}
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => handleMoveJobWithinLevel(step.id, 'back')}
                      disabled={index === 0}
                      title="Move before previous job"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </button>

                    {/* Forward button - move after sibling */}
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() =>
                        handleMoveJobWithinLevel(step.id, 'forward')
                      }
                      disabled={index === level.steps.length - 1}
                      title="Move after next job"
                    >
                      <i className="bi bi-arrow-right"></i>
                    </button>

                    {/* Fast forward button - move to beginning of next level */}
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => handleFastForwardJob(step.id)}
                      title="Move to beginning of next level"
                    >
                      <i className="bi bi-skip-forward"></i>
                    </button>
                  </div>
                )}
                <ProductionJob
                  key={step.id}
                  job={step}
                  resources={resources}
                  factories={factories}
                  trains={trains}
                  maxConcurrentTrains={maxConcurrentTrains}
                  onJobUpdate={updatedJob => {
                    const updatedSteps = level.steps.map(s =>
                      s.id === updatedJob.id ? updatedJob : s
                    );
                    const updatedLevel = {
                      ...level,
                      steps: updatedSteps,
                    };
                    updatedLevel.inventoryChanges =
                      getInventoryChanges(updatedLevel);

                    onLevelChange(updatedLevel);
                  }}
                  onRemoveJob={onRemoveStep}
                  onMoveToLevel={handleMoveJobToLevel}
                  createResourceJob={createResourceJob}
                />
              </div>
            ))}
          </div>
        )}
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
                        const recipe = Object.values(factories)
                          .flatMap((f: Factory) => f.recipes)
                          .find((r: Recipe) => r.resourceId === e.target.value);
                        setSelectedRecipe(recipe || null);
                      }}
                    >
                      <option value="">Select a resource...</option>
                      {Object.values(factories)
                        .flatMap((f: Factory) => f.recipes)
                        .map((recipe: Recipe) => (
                          <option
                            key={recipe.resourceId}
                            value={recipe.resourceId}
                          >
                            {resources[recipe.resourceId]?.name ||
                              recipe.resourceId}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                {newJobType === 'destination' && (
                  <div>
                    <div className="mb-3">
                      <label className="form-label">Destination:</label>
                      <select
                        className="form-select"
                        value={selectedDestination?.id || ''}
                        onChange={e => {
                          const dest = destinations[e.target.value];
                          setSelectedDestination(dest || null);
                        }}
                      >
                        <option value="">Select a destination...</option>
                        {Object.values(destinations).map(
                          (dest: Destination) => (
                            <option key={dest.id} value={dest.id}>
                              {dest.resourceId} ({dest.travelTime}s)
                            </option>
                          )
                        )}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Train:</label>
                      <select
                        className="form-select"
                        value={selectedTrain?.id || ''}
                        onChange={e => {
                          const train = trains[e.target.value];
                          setSelectedTrain(train || null);
                        }}
                      >
                        <option value="">Select a Train...</option>
                        {Object.values(trains).map((train: Train) => (
                          <option key={train.id} value={train.id}>
                            {train.name} ({train.capacity})
                          </option>
                        ))}
                      </select>
                    </div>
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
                      const newStep: FactoryStep = {
                        id: `factory_${selectedRecipe.resourceId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        type: 'factory',
                        resourceId: selectedRecipe.resourceId,
                        levelId: level.level,
                        timeRequired: selectedRecipe.timeRequired,
                        recipe: selectedRecipe,
                      };
                      onAddJobToLevel(newStep);
                    } else if (
                      newJobType === 'destination' &&
                      selectedDestination &&
                      selectedTrain
                    ) {
                      const newStep: DestinationStep = {
                        id: `destination_${selectedDestination.resourceId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        type: 'destination',
                        resourceId: selectedDestination.resourceId,
                        levelId: level.level,
                        timeRequired: selectedDestination.travelTime,
                        destination: selectedDestination,
                        trainId: selectedTrain?.id,
                      };
                      onAddJobToLevel(newStep);
                    }
                    setShowAddJobModal(false);
                    setSelectedResource('');
                    setSelectedTrain(null);
                    setSelectedRecipe(null);
                    setSelectedDestination(null);
                  }}
                  disabled={
                    (newJobType === 'factory' && !selectedRecipe) ||
                    (newJobType === 'destination' && !selectedTrain) ||
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
