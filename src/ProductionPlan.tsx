import React, { useRef, useEffect, useState } from 'react';
import { ProductionPlan as ProductionPlanType, GameState, Order, PlannedStep } from './types';

interface ProductionPlanProps {
  orders: Order[];
  productionPlan: ProductionPlanType | null;
  calculator: any;
  gameState: GameState;
  activeLevel: number;
  onActiveLevelChange: (level: number) => void;
  onProductionPlanChange: (newPlan: ProductionPlanType) => void;
  onMarkLevelDone: (levelNumber: number) => void;
  onRemoveLevel: (levelNumber: number) => void;
  onClearPlan: () => void;
}

export const ProductionPlan: React.FC<ProductionPlanProps> = ({
  productionPlan,
  gameState,
  activeLevel,
  onActiveLevelChange,
  onProductionPlanChange,
  onMarkLevelDone,
  onRemoveLevel,
  onClearPlan
}) => {
  const levelRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const [editingJob, setEditingJob] = useState<string | null>(null);
  const [editingJobData, setEditingJobData] = useState<Partial<PlannedStep>>({});

  // Auto-scroll to active level when it changes
  useEffect(() => {
    if (productionPlan && activeLevel && levelRefs.current[activeLevel]) {
      levelRefs.current[activeLevel]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeLevel, productionPlan]);

  const getResourceName = (resourceId: string): string => {
    return gameState.resources.find(r => r.id === resourceId)?.name || resourceId;
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const createNewLevel = () => {
    if (!productionPlan) return;

    const newLevelNumber = productionPlan.levels.length + 1;
    const newLevel = {
      level: newLevelNumber,
      steps: [],
      inventoryChanges: new Map(),
      workerCount: 0,
      isOverCapacity: false,
      description: 'New Level',
      estimatedTime: 0,
      done: false
    };

    const newPlan = {
      ...productionPlan,
      levels: [...productionPlan.levels, newLevel]
    };

    onProductionPlanChange(newPlan);
  };

  const handleLevelClick = (levelNumber: number) => {
    onActiveLevelChange(levelNumber);
  };

  const startEditingJob = (job: PlannedStep) => {
    setEditingJob(job.id);
    setEditingJobData({
      trainId: job.trainId,
      recipe: job.recipe,
      destination: job.destination
    });
  };

  const saveJobEdit = (jobId: string) => {
    if (!productionPlan) return;

    const updatedLevels = productionPlan.levels.map(level => ({
      ...level,
      steps: level.steps.map(step => 
        step.id === jobId 
          ? { ...step, ...editingJobData }
          : step
      )
    }));

    onProductionPlanChange({
      ...productionPlan,
      levels: updatedLevels
    });

    setEditingJob(null);
    setEditingJobData({});
  };

  const cancelJobEdit = () => {
    setEditingJob(null);
    setEditingJobData({});
  };

  const handleResourceClick = (resourceId: string, currentLevel: number) => {
    if (!productionPlan || currentLevel <= 1) return;

    const targetLevel = currentLevel - 1;
    const recipe = gameState.factories.flatMap(f => f.recipes).find(r => r.resourceId === resourceId);
    const destination = gameState.destinations.find(d => d.resourceId === resourceId);

    if (recipe) {
      // Create factory job
      const newStep: PlannedStep = {
        id: `step_${Date.now()}_${Math.random()}`,
        type: 'factory',
        stepType: 'factory',
        resourceName: getResourceName(resourceId),
        resourceId,
        level: targetLevel,
        timeRequired: recipe.timeRequired,
        amountProcessed: 0,
        dependencies: [],
        recipe
      };

      addJobToLevel(newStep, targetLevel);
    } else if (destination) {
      // Create destination job
      const newStep: PlannedStep = {
        id: `step_${Date.now()}_${Math.random()}`,
        type: 'destination',
        resourceId,
        level: targetLevel,
        timeRequired: destination.travelTime,
        amountProcessed: 0,
        dependencies: [],
        destination
      };

      addJobToLevel(newStep, targetLevel);
    }
  };

  const addJobToLevel = (newStep: PlannedStep, targetLevel: number) => {
    if (!productionPlan) return;

    const levelExists = productionPlan.levels.find(l => l.level === targetLevel);
    
    if (levelExists) {
      // Add to existing level
      const updatedLevels = productionPlan.levels.map(level => 
        level.level === targetLevel 
          ? { ...level, steps: [...level.steps, newStep] }
          : level
      );
      
      onProductionPlanChange({
        ...productionPlan,
        levels: updatedLevels
      });
    } else {
      // Create new level and insert it
      const newLevel = {
        level: targetLevel,
        steps: [newStep],
        inventoryChanges: new Map(),
        workerCount: newStep.type === 'destination' ? 1 : 0,
        isOverCapacity: false,
        description: `${newStep.type === 'factory' ? 'Production' : 'Gathering'} Level`,
        estimatedTime: newStep.timeRequired,
        done: false
      };

      // Insert the new level and renumber existing levels
      const updatedLevels = [
        ...productionPlan.levels.filter(l => l.level < targetLevel),
        newLevel,
        ...productionPlan.levels.filter(l => l.level >= targetLevel).map(l => ({
          ...l,
          level: l.level + 1
        }))
      ];

      onProductionPlanChange({
        ...productionPlan,
        levels: updatedLevels
      });
    }
  };

  const renderJobEditForm = (job: PlannedStep) => {
    if (editingJob !== job.id) return null;

    return (
      <div className="job-edit-form p-3 border rounded mt-2">
        <h6 className="mb-3">Edit Job: {job.resourceName}</h6>
        
        {/* Train Assignment */}
        {job.type === 'destination' && (
          <div className="mb-3">
            <label className="form-label">Assign Train:</label>
            <select
              className="form-select form-select-sm"
              value={editingJobData.trainId || ''}
              onChange={(e) => setEditingJobData(prev => ({ ...prev, trainId: e.target.value || undefined }))}
            >
              <option value="">No Train Assigned</option>
              {gameState.trains.map(train => (
                <option key={train.id} value={train.id}>
                  {train.name} (Capacity: {train.capacity})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Recipe Selection for Factory Jobs */}
        {job.type === 'factory' && (
          <div className="mb-3">
            <label className="form-label">Recipe:</label>
            <select
              className="form-select form-select-sm"
              value={editingJobData.recipe?.resourceId || ''}
              onChange={(e) => {
                const selectedRecipe = gameState.factories
                  .flatMap(f => f.recipes)
                  .find(r => r.resourceId === e.target.value);
                setEditingJobData(prev => ({ ...prev, recipe: selectedRecipe }));
              }}
            >
              {gameState.factories.flatMap(f => f.recipes)
                .filter(r => r.resourceId === job.resourceId)
                .map(recipe => (
                  <option key={recipe.resourceId} value={recipe.resourceId}>
                    {recipe.requires.map(req => `${req.amount} ${getResourceName(req.resourceId)}`).join(' + ')} → {recipe.outputAmount} {getResourceName(recipe.resourceId)}
                  </option>
                ))}
            </select>
          </div>
        )}

        {/* Destination Selection for Destination Jobs */}
        {job.type === 'destination' && (
          <div className="mb-3">
            <label className="form-label">Destination:</label>
            <select
              className="form-select form-select-sm"
              value={editingJobData.destination?.id || ''}
              onChange={(e) => {
                const selectedDestination = gameState.destinations.find(d => d.id === e.target.value);
                setEditingJobData(prev => ({ ...prev, destination: selectedDestination }));
              }}
            >
              {gameState.destinations
                .filter(d => d.resourceId === job.resourceId)
                .map(destination => (
                  <option key={destination.id} value={destination.id}>
                    {destination.id} (Travel: {formatTime(destination.travelTime)})
                  </option>
                ))}
            </select>
          </div>
        )}

        <div className="d-flex gap-2">
          <button
            className="btn btn-success btn-sm"
            onClick={() => saveJobEdit(job.id)}
          >
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

  const renderJobDetails = (job: PlannedStep) => {
    return (
      <div className="job-details">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <strong>{job.resourceName}</strong>
            <span className="badge bg-secondary ms-2">{job.stepType}</span>
            
            {/* Train Assignment Display */}
            {job.trainId && (
              <span className="badge bg-info ms-2">
                <i className="bi bi-train-front"></i> {gameState.trains.find(t => t.id === job.trainId)?.name}
              </span>
            )}
          </div>
          
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => startEditingJob(job)}
            >
              <i className="bi bi-pencil"></i> Edit
            </button>
          </div>
        </div>

        {/* Recipe Information */}
        {job.recipe && (
          <div className="mt-2">
            <small className="text-muted d-block">Recipe:</small>
            <div className="d-flex flex-wrap gap-1 mb-2">
              {job.recipe.requires.map((req, index) => (
                <span
                  key={index}
                  className="badge bg-outline-secondary cursor-pointer"
                  onClick={() => handleResourceClick(req.resourceId, job.level)}
                  style={{ cursor: 'pointer' }}
                >
                  {req.amount} {getResourceName(req.resourceId)}
                </span>
              ))}
            </div>
            <small className="text-muted">Output: {job.recipe.outputAmount} {getResourceName(job.recipe.resourceId)}</small>
          </div>
        )}

        {/* Destination Information */}
        {job.destination && (
          <div className="mt-2">
            <small className="text-muted">Travel time: {formatTime(job.destination.travelTime)}</small>
          </div>
        )}

        {/* Time and Amount */}
        <div className="mt-2 text-end">
          <div className="text-muted small">{formatTime(job.timeRequired)}</div>
          <div className="text-muted small">Amount: {job.amountProcessed}</div>
        </div>
      </div>
    );
  };

  if (!productionPlan) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Production Plan</h3>
        </div>
        <div className="card-body text-center py-5">
          <p className="text-muted">No production plan created yet.</p>
          <button 
            className="btn btn-primary"
            onClick={createNewLevel}
          >
            Create First Level
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h3 className="card-title mb-0">Production Plan</h3>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-success btn-sm"
            onClick={createNewLevel}
          >
            <i className="bi bi-plus-circle"></i> Add Level
          </button>
          <button 
            className="btn btn-danger btn-sm"
            onClick={onClearPlan}
          >
            <i className="bi bi-trash"></i> Clear Plan
          </button>
        </div>
      </div>
      <div className="card-body">
        {productionPlan.levels.map((level) => (
          <div 
            key={level.level} 
            ref={(el) => { levelRefs.current[level.level] = el; }}
            className={`level-container mb-3 p-3 border rounded bg-opacity-10 ${
              level.done ? 'bg-secondary border-secondary text-muted' : 
              level.isOverCapacity ? 'bg-danger border-danger' : 
              'bg-light'
            } ${activeLevel === level.level ? 'border-primary border-2' : ''}`}
          >
            <div className="level-header d-flex justify-content-between align-items-center mb-2">
              <div className="d-flex align-items-center gap-2">
                <h5 
                  className={`mb-0 cursor-pointer ${activeLevel === level.level ? 'text-primary fw-bold' : ''}`}
                  onClick={() => handleLevelClick(level.level)}
                >
                  Level {level.level}
                </h5>
                {level.done && (
                  <span className="badge bg-secondary">
                    <i className="bi bi-check-circle"></i> Done
                  </span>
                )}
                {level.isOverCapacity && (
                  <span className="badge bg-danger">
                    <i className="bi bi-exclamation-triangle"></i> Over Capacity
                  </span>
                )}
              </div>
              <div className="d-flex gap-2">
                <button
                  className={`btn btn-sm ${level.done ? 'btn-outline-secondary' : 'btn-success'}`}
                  onClick={() => onMarkLevelDone(level.level)}
                  disabled={level.done}
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
                {level.description} • {level.workerCount} trains • {formatTime(level.estimatedTime)}
              </small>
            </div>

            <div className="level-steps">
              {level.steps.length === 0 ? (
                <p className="text-muted fst-italic">No steps in this level</p>
              ) : (
                level.steps.map((step) => (
                  <div key={step.id} className="job-item p-2 mb-1 border rounded ">
                    {renderJobDetails(step)}
                    {renderJobEditForm(step)}
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
