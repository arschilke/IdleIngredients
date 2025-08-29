import React from 'react';
import { PlanningLevel, PlannedStep, GameState } from './types';
import { ProductionJob } from './ProductionJob';
import { formatTime } from './utils';

interface ProductionLevelProps {
  level: PlanningLevel;
  gameState: GameState;
  onLevelClick: (levelNumber: number) => void;
  onRemoveLevel: (levelNumber: number) => void;
  onLevelChange: (updatedLevel: PlanningLevel) => void;
}

export const ProductionLevel: React.FC<ProductionLevelProps> = ({
  level,
  gameState,
  onLevelClick,
  onRemoveLevel,
  onLevelChange
}) => {


  const onAddJobToLevel = (newStep: PlannedStep) => {
    level.steps.push(newStep);
    level.endTime = Math.max(...level.steps.map(s => s.endTime || 0))
    level.estimatedTime = Math.max(...level.steps.map(s => s.endTime || 0))
    level.trainCount = level.steps.filter(step => step.trainId !== undefined).length;
    onLevelChange(level);
  };


return (
  <div
    className={`level-container mb-2 p-3 border rounded bg-opacity-10 ${level.done ? 'bg-secondary border-secondary text-muted' :
        level.trainCount > gameState.maxConcurrentTrains ? 'bg-danger border-danger' :
          'bg-light'
      } ${level.isActive ? 'border-primary border-2' : ''}`}
  >
    <div className="level-header d-flex justify-content-between align-items-center mb-2">
      <div className="d-flex align-items-center gap-2">
        <h5
          className={`mb-0 cursor-pointer ${level.isActive ? 'text-primary fw-bold' : ''}`}
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
      </div>
      <div className="d-flex gap-2">
        <button
          className={`btn btn-sm ${level.done ? 'btn-outline-secondary' : 'btn-success'}`}
          onClick={() => onLevelChange({...level, done: !level.done})}
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
  </div>
);
};
