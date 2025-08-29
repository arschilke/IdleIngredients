import React, { useRef, useEffect } from 'react';
import { ProductionPlan as ProductionPlanType, GameState, Order } from './types';

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
              level.isOverCapacity ? 'bg-danger  border-danger' : 
              ''
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
                  <div key={step.id} className="job-item p-2 mb-1 border rounded">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{step.resourceName}</strong>
                        <span className="badge bg-secondary ms-2">{step.stepType}</span>
                        {step.recipe && (
                          <small className="d-block text-muted">
                            Recipe: {step.recipe.requires.map(r => `${r.amount} ${getResourceName(r.resourceId)}`).join(', ')}
                          </small>
                        )}
                        {step.destination && (
                          <small className="d-block text-muted">
                            Travel time: {formatTime(step.destination.travelTime)}
                          </small>
                        )}
                      </div>
                      <div className="text-end">
                        <div className="text-muted small">{formatTime(step.timeRequired)}</div>
                        <div className="text-muted small">Amount: {step.amountProcessed}</div>
                      </div>
                    </div>
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
