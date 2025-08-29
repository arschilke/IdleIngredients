import React, { useState } from 'react';
import { PlanningLevel, PlannedStep, GameState, Recipe, Destination } from './types';
import { ProductionJob } from './ProductionJob';
import { formatTime } from './utils';
import { getBestTrains, checkLevelResourceSufficiency } from './trainUtils';

interface ProductionLevelProps {
  level: PlanningLevel;
  gameState: GameState;
  isActiveLevel: boolean;
  previousLevelWarehouseState: Map<string, number>; // Warehouse state at the end of the previous level
  onLevelClick: (levelNumber: number) => void;
  onRemoveLevel: (levelNumber: number) => void;
  onLevelChange: (updatedLevel: PlanningLevel) => void;
  onAddStepToLevel: (step: PlannedStep, targetLevel: number) => void;
}

export const ProductionLevel: React.FC<ProductionLevelProps> = ({
  level,
  gameState,
  isActiveLevel,
  previousLevelWarehouseState,
  onLevelClick,
  onRemoveLevel,
  onLevelChange,
  onAddStepToLevel
}) => {
  const [showAddJobModal, setShowAddJobModal] = useState<boolean>(false);
  const [newJobType, setNewJobType] = useState<'factory' | 'destination' | 'delivery'>('factory');
  const [selectedResource, setSelectedResource] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);

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

  const onAddJobToLevel = (newStep: PlannedStep) => {
    level.steps.push(newStep);
    level.endTime = Math.max(...level.steps.map(s => s.endTime || 0))
    level.estimatedTime = Math.max(...level.steps.map(s => s.endTime || 0))
    level.trainCount = level.steps.filter(step => step.trainId !== undefined).length;
    onLevelChange(level);
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

  return (
    <div
      className={`level-container mb-2 p-3 border rounded bg-opacity-10 ${level.done ? 'bg-secondary border-secondary text-muted' :
          level.trainCount > gameState.maxConcurrentTrains ? 'bg-danger border-danger' :
            'bg-light'
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

      {/* Inventory insufficiency alert */}
      {checkInventorySufficiency().length > 0 && (
        <div className="alert alert-warning alert-sm mb-2">
          <i className="bi bi-exclamation-triangle me-2"></i>
          <strong>Insufficient Resources:</strong>
          <ul className="mb-0 mt-1">
            {checkInventorySufficiency().map((resource, index) => (
              <li key={index} className="small">
                <span
                  className="text-primary cursor-pointer text-decoration-underline"
                  onClick={() => createProductionStep(resource.resourceId)}
                  title={`Click to create production step for ${resource.name}`}
                >
                  {resource.name}
                </span>
                {' '}(need {resource.required}, have {resource.available})
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="level-steps">
        {level.steps.length === 0 ? (
          <p className="text-muted fst-italic">No steps in this level</p>
        ) : (
          level.steps.map((step) => (
            <ProductionJob
              key={step.id}
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
            />
          ))
        )}
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
