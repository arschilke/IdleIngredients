import React, { useState } from 'react';
import type {
  PlanningLevel,
  Destination,
  Resource,
  Factory,
  Train,
  Step,
  ProductionPlan,
  ResourceRequirement,
  Order,
} from '../../../../types';
import { StepType } from '../../../../types';
import { ProductionJob } from './ProductionJob';
import { getInventoryAtLevel, getInventoryChanges } from '../../../../inventoryUtils';
import { JobForm } from '../../../components/forms/JobForm';

interface ProductionLevelProps {
  level: PlanningLevel;
  resources: Record<string, Resource>;
  factories: Record<string, Factory>;
  destinations: Record<string, Destination>;
  orders: Order[];
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
  orders,
  productionPlan,
  trains,
  maxConcurrentTrains,
  isActiveLevel,
  onLevelClick,
  onRemoveLevel,
  onCreateResourceJob,
  onLevelChange,
  onMoveJobToLevel,
  onAddJobToLevel,
}) => {
  const [showAddJobCard, setShowAddJobCard] = useState<boolean>(false);
  const [showJobControls, setShowJobControls] = useState<boolean>(false);

  // Check if inventory has enough resources for all jobs in this level
  const checkInventorySufficiency = () => {
    const insufficientResources: string[] = [];
    const inventory = getInventoryAtLevel(productionPlan, level.level);
    Object.keys(inventory).forEach(resourceId => {
      if (inventory[resourceId] < 0) {
        insufficientResources.push(resourceId);
      }
    });
    return insufficientResources;
  };

  const addJobToLevel = (newStep: Step) => {
    onAddJobToLevel(newStep, newStep.levelId);
  };

  const removeStep = (stepId: string) => {
    const updatedSteps = level.steps.filter(step => step.id !== stepId);
    const updatedLevel = {
      ...level,
      steps: updatedSteps,
    };
    updatedLevel.inventoryChanges = getInventoryChanges(updatedLevel);
    onLevelChange(updatedLevel);
  };

  // Handle moving a job to a different level
  const moveJobToLevel = (jobId: string, targetLevel: number) => {
    if (targetLevel !== level.level) {
      onMoveJobToLevel(jobId, level.level, targetLevel);
    }
  };

  // Handle moving a job within the current level (back/forward)
  const moveJobWithinLevel = (jobId: string, direction: 'back' | 'forward') => {
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
  const rewindJob = (jobId: string) => {
    const previousLevel = level.level - 1;
    onMoveJobToLevel(jobId, level.level, previousLevel);
  };

  // Handle moving a job to the beginning of next level (fast forward)
  const fastForwardJob = (jobId: string) => {
    const nextLevel = level.level + 1;
    onMoveJobToLevel(jobId, level.level, nextLevel);
  };

  const createJob = (requirement: ResourceRequirement) => {
    onCreateResourceJob(requirement, level.level - 1);
  };

  const tooManyTrains =
    level.steps.filter(
      step =>
        (step.type === 'destination' || step.type === 'delivery') &&
        step.trainId !== undefined
    ).length > maxConcurrentTrains;

  // Check if factory steps exceed any factory's queue capacity
  const factoryStepsCount = (): Record<string, number> => {
    let counts: Record<string, number> = {};
    for (const factory of Object.values(factories)) {
      var outputResourceIds = factory.recipes.map(recipe => recipe.resourceId);
      var factorySteps = level.steps.filter(
        step =>
          step.type === StepType.Factory && step.resourceId in outputResourceIds
      );
      counts[factory.id] = factorySteps.length;
    }
    return counts;
  };

  const factoryQueueExceeded = Object.entries(factoryStepsCount()).some(
    ([id, count]) => count > factories[id].queueMaxSize
  );

  return (
    <div
      className={`level-container mb-2 p-3 border rounded bg-opacity-10 ${
        level.done
          ? 'bg-secondary border-secondary text-muted'
          : tooManyTrains
            ? 'bg-danger border-danger'
            : factoryQueueExceeded
              ? 'bg-warning border-warning'
              : 'bg-light'
      } ${isActiveLevel ? 'border-primary border-2 shadow-lg' : ''} ${showAddJobCard ? 'modal-open' : ''}`}
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
          {factoryQueueExceeded && (
            <span className="badge bg-warning">
              <i className="bi bi-exclamation-triangle"></i> Factory Queue Full
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
            onClick={() => setShowAddJobCard(true)}
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
        {showAddJobCard && (
          <JobForm
            level={level}
            orders={orders}
            onSubmit={addJobToLevel}
            onClose={() => setShowAddJobCard(false)}
          />
        )}

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
                      onClick={() => rewindJob(step.id)}
                      title="Move to end of previous level"
                    >
                      <i className="bi bi-skip-backward"></i>
                    </button>

                    {/* Back button - move before sibling */}
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => moveJobWithinLevel(step.id, 'back')}
                      disabled={index === 0}
                      title="Move before previous job"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </button>

                    {/* Forward button - move after sibling */}
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => moveJobWithinLevel(step.id, 'forward')}
                      disabled={index === level.steps.length - 1}
                      title="Move after next job"
                    >
                      <i className="bi bi-arrow-right"></i>
                    </button>

                    {/* Fast forward button - move to beginning of next level */}
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => fastForwardJob(step.id)}
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
                  destinations={destinations}
                  orders={orders}
                  plan={productionPlan}
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
                  onRemoveJob={removeStep}
                  onMoveToLevel={moveJobToLevel}
                  createResourceJob={createJob}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
