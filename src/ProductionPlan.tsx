import React, { useRef, useEffect } from 'react';
import { ProductionPlan as ProductionPlanType, GameState, PlannedStep } from './types';
import { ProductionLevel } from './ProductionLevel';

interface ProductionPlanProps {
  productionPlan: ProductionPlanType | null;
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



  const createNewLevel = () => {
    if (!productionPlan) return;

    const newLevelNumber = productionPlan.levels.length + 1;
    const newLevel = {
      level: newLevelNumber,
      steps: [],
      inventoryChanges: new Map(),
      trainCount: 0,
      isOverCapacity: false,
      description: 'New Level',
      estimatedTime: 0,
      done: false,
      startTime: 0,
      endTime: 0
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
        trainCount: newStep.type === 'destination' ? 1 : 0,
        isOverCapacity: false,
        description: `${newStep.type === 'factory' ? 'Production' : 'Gathering'} Level`,
        estimatedTime: newStep.timeRequired,
        done: false,
        startTime: 0,
        endTime: 0
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
          <div key={level.level} ref={(el) => { levelRefs.current[level.level] = el; }}>
            <ProductionLevel
              level={level}
              activeLevel={activeLevel}
              gameState={gameState}
              onLevelClick={handleLevelClick}
              onMarkLevelDone={onMarkLevelDone}
              onRemoveLevel={onRemoveLevel}
              onProductionPlanChange={(updatedLevel) => {
                const updatedLevels = productionPlan.levels.map(l => 
                  l.level === updatedLevel.level ? updatedLevel : l
                );
                onProductionPlanChange({
                  ...productionPlan,
                  levels: updatedLevels
                });
              }}
              onAddJobToLevel={addJobToLevel}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
