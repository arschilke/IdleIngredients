import React, { useState } from 'react';
import { PlanningLevel, PlannedStep, GameState, Recipe, Destination } from './types';
import { ProductionJob } from './ProductionJob';
import { formatTime } from './utils';
import { getBestTrains } from './trainUtils';
import { checkLevelResourceSufficiency } from './inventoryUtils';

interface ProductionLevelProps {
  level: PlanningLevel;
  gameState: GameState;
  isActiveLevel: boolean;
  previousLevelWarehouseState: Map<string, number>; // Warehouse state at the end of the previous level
  onLevelClick: (levelNumber: number) => void;
  onRemoveLevel: (levelNumber: number) => void;
  onLevelChange: (updatedLevel: PlanningLevel) => void;
  onAddStepToLevel: (step: PlannedStep, targetLevel: number) => void;
  onReorderJob?: (levelNumber: number, jobId: string, newIndex: number) => void;
  onMoveJobToLevel?: (jobId: string, fromLevel: number, toLevel: number) => void;
}

export const ProductionLevel: React.FC<ProductionLevelProps> = ({
  level,
  gameState,
  isActiveLevel,
  previousLevelWarehouseState,
  onLevelClick,
  onRemoveLevel,
  onLevelChange,
  onAddStepToLevel,
  onReorderJob,
  onMoveJobToLevel
}) => {
  const [showAddJobModal, setShowAddJobModal] = useState<boolean>(false);
  const [newJobType, setNewJobType] = useState<'factory' | 'destination' | 'delivery'>('factory');
  const [selectedResource, setSelectedResource] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [draggedJobId, setDraggedJobId] = useState<string | null>(null);
  const [dragOverLevel, setDragOverLevel] = useState<number | null>(null);
  const [dragOverJobIndex, setDragOverJobIndex] = useState<number | null>(null);

  // Check if inventory has enough resources for all jobs in this level
  const checkInventorySufficiency = () => {
    // Use the utility function to check resource sufficiency based on previous level's warehouse state
    const insufficientResources = checkLevelResourceSufficiency(level, previousLevelWarehouseState);
    
    // Add resource names to the insufficient resources
    return insufficientResources.map(resource => ({
      ...resource,
      name: gameState.resources.find(r => r.id === resource.resourceId)?.name || resource.resourceId
    }));
  };

  // Calculate which steps would run out of resources when completed in order
  const calculateResourceDepletionSteps = () => {
    const insufficientResources = checkInventorySufficiency();
    if (insufficientResources.length === 0) return [];

    const depletionSteps: Array<{
      stepIndex: number;
      step: PlannedStep;
      resourceId: string;
      resourceName: string;
      required: number;
      available: number;
      remainingAfterStep: number;
    }> = [];

    let currentInventory = new Map(previousLevelWarehouseState);

    level.steps.forEach((step, stepIndex) => {
      if (step.recipe) {
        // Check if this step would deplete any resources
        step.recipe.requires.forEach(req => {
          const currentAmount = currentInventory.get(req.resourceId) || 0;
          if (currentAmount < req.amount) {
            depletionSteps.push({
              stepIndex,
              step,
              resourceId: req.resourceId,
              resourceName: gameState.resources.find(r => r.id === req.resourceId)?.name || req.resourceId,
              required: req.amount,
              available: currentAmount,
              remainingAfterStep: 0
            });
          } else {
            // Update inventory after this step
            currentInventory.set(req.resourceId, currentAmount - req.amount);
          }
        });
      }
      if (step.type === 'delivery') {
        const currentAmount = currentInventory.get(step.resourceId) || 0;
        if (currentAmount < step.amountProcessed) {
          depletionSteps.push({
            stepIndex,
            step,
            resourceId: step.resourceId,
            resourceName: gameState.resources.find(r => r.id === step.resourceId)?.name || step.resourceId,
            required: step.amountProcessed,
            available: currentAmount,
            remainingAfterStep: 0
          });
        } else {
          currentInventory.set(step.resourceId, currentAmount - step.amountProcessed);
        }
      }
    });

    return depletionSteps;
  };

  const onAddJobToLevel = (newStep: PlannedStep) => {
    level.steps.push(newStep);
    level.endTime = Math.max(...level.steps.map(s => s.endTime || 0))
    level.estimatedTime = Math.max(...level.steps.map(s => s.endTime || 0))
    level.trainCount = level.steps.filter(step => step.trainId !== undefined).length;
    onLevelChange(level);
  };

  const onRemoveStep = (stepId: string) => {
    const updatedSteps = level.steps.filter(step => step.id !== stepId);
    const updatedLevel = {
      ...level,
      steps: updatedSteps
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

  // Create a production step for a resource
  const createProductionStep = (resourceId: string) => {
    // Find a factory that can produce this resource
    const factory = gameState.factories.find(f =>
      f.recipes.some(recipe => recipe.resourceId === resourceId)
    );

    if (factory) {
      const recipe = factory.recipes.find(r => r.resourceId === resourceId);
      if (recipe) {
        const newStep: PlannedStep = {
          id: `factory_${resourceId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'factory',
          resourceId: resourceId,
          level: level.level - 1, // Create on previous level
          timeRequired: recipe.timeRequired,
          amountProcessed: recipe.outputAmount,
          dependencies: [],
          recipe: recipe
        };

        // If we're at level 1, create a new level at the beginning
        // Otherwise, add to the previous level
        const targetLevel = level.level === 1 ? -1 : level.level - 1;
        onAddStepToLevel(newStep, targetLevel);
      }
    }

    const destination = gameState.destinations.find(d => d.resourceId === resourceId);
    if (destination) {
      var neededAmount = checkInventorySufficiency().find(r => r.resourceId === resourceId);
      if (neededAmount) {
        const trains = getBestTrains(level, neededAmount.required, gameState.trains);
        for (let train of trains) {
          const newStep: PlannedStep = {
            id: `destination_${resourceId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'destination',
            resourceId: resourceId,
            level: level.level - 1,
            timeRequired: destination.travelTime,
            trainId: train.id,
            amountProcessed: train.capacity,
            dependencies: []
          };
          // If we're at level 1, create a new level at the beginning
          // Otherwise, add to the previous level
          const targetLevel = level.level === 1 ? -1 : level.level - 1;
          onAddStepToLevel(newStep, targetLevel);
        }
      }
    }
  };

  const resourceDepletionSteps = calculateResourceDepletionSteps();

  return (
    <div
      className={`level-container mb-2 p-3 border rounded bg-opacity-10 ${level.done ? 'bg-secondary border-secondary text-muted' :
          level.trainCount > gameState.maxConcurrentTrains ? 'bg-danger border-danger' :
            'bg-light'
        } ${isActiveLevel ? 'border-primary border-2 shadow-lg' : ''} ${showAddJobModal ? 'modal-open' : ''} ${dragOverLevel === level.level ? 'drag-over' : ''}`}
      onDragOver={(e) => handleDragOver(e)}
      onDragLeave={handleDragLeave}
      onDrop={(e) => handleDrop(e)}
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
          {level.trainCount > gameState.maxConcurrentTrains && (
            <span className="badge bg-danger">
              <i className="bi bi-exclamation-triangle"></i> Over Capacity
            </span>
          )}
          {checkInventorySufficiency().length > 0 && (
            <span className="badge bg-warning">
              <i className="bi bi-exclamation-triangle"></i> Insufficient Resources
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
          {level.description} • {level.trainCount} trains • {formatTime(level.estimatedTime)}
        </small>
      </div>

      {/* Resource insufficiency display with step-by-step breakdown */}
      {resourceDepletionSteps.length > 0 && (
        <div className="alert alert-warning alert-sm mb-2">
          <i className="bi bi-exclamation-triangle me-2"></i>
          <strong>Resource Depletion Analysis:</strong>
          <div className="mt-2">
            {resourceDepletionSteps.map((depletion, index) => (
              <div key={index} className="mb-2 p-2 border-start border-warning border-3 ps-3 bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-bold">
                    Step {depletion.stepIndex + 1}: {depletion.step.type === 'factory' ? 'Factory' : 'Delivery'}
                  </span>
                  <span className="badge bg-danger">
                    <i className="bi bi-x-circle"></i> Resource Depleted
                  </span>
                </div>
                <div className="small text-muted mt-1">
                  <strong>{depletion.resourceName}</strong> will run out here
                </div>
                <div className="small">
                  Required: {depletion.required} | Available: {depletion.available}
                </div>
                <button
                  className="btn btn-sm btn-outline-primary mt-1"
                  onClick={() => createProductionStep(depletion.resourceId)}
                  title={`Click to create production step for ${depletion.resourceName}`}
                >
                  <i className="bi bi-plus-circle"></i> Add Production
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="level-steps">
        {level.steps.length === 0 ? (
          <div 
            className="drop-zone p-3 text-center text-muted border-2 border-dashed rounded"
            onDragOver={(e) => handleDragOver(e)}
            onDrop={(e) => handleDrop(e)}
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
                onDragOver={(e) => handleDragOver(e, stepIndex)}
                onDrop={(e) => handleDrop(e, stepIndex)}
              />
              
              <ProductionJob
                job={step}
                gameState={gameState}
                onJobUpdate={(updatedJob) => {
                  const updatedSteps = level.steps.map(s =>
                    s.id === updatedJob.id ? updatedJob : s
                  );
                  const updatedLevel = {
                    ...level,
                    steps: updatedSteps
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
                  onDragStart: (e: React.DragEvent) => handleDragStart(e, step.id)
                }}
              />
            </React.Fragment>
          ))
        )}
        
        {/* Drop zone at the end of all jobs */}
        <div 
          className={`drop-zone ${dragOverJobIndex === level.steps.length ? 'bg-primary bg-opacity-25' : ''}`}
          style={{ height: '8px', margin: '2px 0' }}
          onDragOver={(e) => handleDragOver(e, level.steps.length)}
          onDrop={(e) => handleDrop(e, level.steps.length)}
        />
      </div>

      {/* Add Job Modal */}
      {showAddJobModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
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
                    onChange={(e) => setNewJobType(e.target.value as 'factory' | 'destination' | 'delivery')}
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
                      onChange={(e) => {
                        setSelectedResource(e.target.value);
                        const recipe = gameState.factories
                          .flatMap(f => f.recipes)
                          .find(r => r.resourceId === e.target.value);
                        setSelectedRecipe(recipe || null);
                      }}
                    >
                      <option value="">Select a resource...</option>
                      {gameState.factories.flatMap(f => f.recipes).map(recipe => (
                        <option key={recipe.resourceId} value={recipe.resourceId}>
                          {gameState.resources.find(r => r.id === recipe.resourceId)?.name || recipe.resourceId}
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
                      onChange={(e) => {
                        const dest = gameState.destinations.find(d => d.id === e.target.value);
                        setSelectedDestination(dest || null);
                      }}
                    >
                      <option value="">Select a destination...</option>
                      {gameState.destinations.map(dest => (
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
                      Delivery jobs are typically created when planning production for orders.
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
                        recipe: selectedRecipe
                      };
                      onAddJobToLevel(newStep);
                    } else if (newJobType === 'destination' && selectedDestination) {
                      const newStep: PlannedStep = {
                        id: `destination_${selectedDestination.resourceId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        type: 'destination',
                        resourceId: selectedDestination.resourceId,
                        level: level.level,
                        timeRequired: selectedDestination.travelTime,
                        amountProcessed: 0,
                        dependencies: [],
                        destination: selectedDestination
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
