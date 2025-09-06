import React, { useRef, useEffect } from 'react';
import {
  ProductionPlan as ProductionPlanType,
  Inventory,
  PlanningLevel,
  Order,
  Factory,
  Destination,
  Train,
  Resource,
  Step,
} from './types';
import { ProductionLevel } from './ProductionLevel';
import { getInventoryChanges } from './inventoryUtils';

interface ProductionPlanProps {
  productionPlan: ProductionPlanType | null;
  resources: Record<string, Resource>;
  activeLevel: number;
  inventory: Inventory;
  factories: Record<string, Factory>;
  destinations: Record<string, Destination>;
  trains: Record<string, Train>;
  maxConcurrentTrains: number;
  onActiveLevelChange: (levelNumber: number) => void;
  onProductionPlanChange: (newPlan: ProductionPlanType) => void;
  onOrdersChange: (orders: Order[]) => void;
  onClearPlan: () => void;
}

export const ProductionPlan: React.FC<ProductionPlanProps> = ({
  productionPlan,
  factories,
  destinations,
  trains,
  resources,
  inventory,
  maxConcurrentTrains,
  activeLevel,
  onActiveLevelChange,
  onProductionPlanChange,
  onClearPlan,
}) => {
  const levelRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  // Auto-scroll to active level when it changes
  useEffect(() => {
    if (productionPlan && activeLevel && levelRefs.current[activeLevel]) {
      levelRefs.current[activeLevel]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeLevel, productionPlan]);

  // Handle reordering jobs within a level
  const handleReorderJob = (
    levelNumber: number,
    jobId: string,
    newIndex: number
  ) => {
    if (!productionPlan) return;

    const level = productionPlan.levels[levelNumber];
    if (!level) return;

    const jobIndex = level.steps.findIndex(s => s.id === jobId);
    if (jobIndex === -1) return;

    // Remove the job from its current position
    const [movedJob] = level.steps.splice(jobIndex, 1);

    // Insert it at the new position
    level.steps.splice(newIndex, 0, movedJob);

    // Update the production plan
    const updatedLevels = { ...productionPlan.levels };
    updatedLevels[levelNumber] = level;

    onProductionPlanChange({
      ...productionPlan,
      levels: updatedLevels,
    });
  };

  // Handle moving a job from one level to another
  const handleMoveJobToLevel = (
    jobId: string,
    fromLevel: number,
    toLevel: number
  ) => {
    if (!productionPlan || fromLevel === toLevel) return;

    const fromLevelObj = productionPlan.levels[fromLevel];
    const toLevelObj = productionPlan.levels[toLevel];

    // Find and remove the job from the source level
    const jobIndex = fromLevelObj.steps.findIndex(s => s.id === jobId);
    if (jobIndex === -1) return;

    const [movedJob] = fromLevelObj.steps.splice(jobIndex, 1);

    // Update the job's level
    movedJob.levelId = toLevel;

    // Add the job to the target level
    toLevelObj.steps.push(movedJob);

    // Update warehouse states for both levels
    const updatedLevels = { ...productionPlan.levels };
    updatedLevels[fromLevel] = fromLevelObj;
    updatedLevels[toLevel] = toLevelObj;

    onProductionPlanChange({
      ...productionPlan,
      levels: updatedLevels,
    });
  };

  const createNewLevel = () => {
    if (!productionPlan) return;

    const newLevelNumber = Object.keys(productionPlan.levels).length + 1;
    const newLevel: PlanningLevel = {
      level: newLevelNumber,
      steps: [],
      inventoryChanges: new Map(),
      done: false,
    };

    const newPlan: ProductionPlanType = {
      ...productionPlan,
      levels: { ...productionPlan.levels, [newLevelNumber]: newLevel },
    };

    onProductionPlanChange(newPlan);
    onActiveLevelChange(newLevelNumber);
  };

  const onRemoveLevel = (levelNumber: number) => {
    if (!productionPlan) return;

    var levelIndex = Object.values(productionPlan.levels).find(
      x => x.level === levelNumber
    )?.level;

    if (levelIndex === -1) return;

    const updatedLevels = { ...productionPlan.levels };
    delete updatedLevels[levelNumber];

    // Renumber levels to be consecutive after removal
    const sortedLevelNumbers = Object.keys(updatedLevels)
      .map(Number)
      .sort((a, b) => a - b);

    const newLevels: Record<number, PlanningLevel> = {};
    let newLevelNum = 1;
    for (const oldLevelNum of sortedLevelNumbers) {
      const level = { ...updatedLevels[oldLevelNum], level: newLevelNum };
      newLevels[newLevelNum] = level;
      newLevelNum++;
    }

    onProductionPlanChange({
      ...productionPlan,
      levels: newLevels,
    });

    // Adjust active level if needed
    const numLevels = Object.keys(newLevels).length;
    if (activeLevel === levelNumber) {
      onActiveLevelChange(numLevels > 0 ? 1 : 1);
    } else if (activeLevel > levelNumber) {
      onActiveLevelChange(activeLevel - 1);
    }
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
          <button className="btn btn-primary" onClick={createNewLevel}>
            Create First Level
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card h-100">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h3 className="card-title mb-0">Production Plan</h3>
        <div className="d-flex gap-2">
          <button className="btn btn-success btn-sm" onClick={createNewLevel}>
            <i className="bi bi-plus-circle"></i> Add Level
          </button>
          <button className="btn btn-info btn-sm" onClick={() => {}}>
            <i className="bi bi-download me-1"></i>
            Export
          </button>
          <label className="btn btn-primary btn-sm mb-0">
            <i className="bi bi-upload me-1"></i>
            Import
            <input
              type="file"
              accept=".json"
              onChange={() => {}}
              style={{ display: 'none' }}
            />
          </label>
          <button className="btn btn-danger btn-sm" onClick={onClearPlan}>
            <i className="bi bi-trash"></i> Clear Plan
          </button>
        </div>
      </div>
      <div className="card-body">
        {Object.values(productionPlan.levels).map(level => (
          <div
            key={level.level}
            ref={el => {
              levelRefs.current[level.level] = el;
            }}
          >
            <ProductionLevel
              level={level}
              factories={factories}
              inventory={inventory}
              destinations={destinations}
              trains={trains}
              resources={resources}
              maxConcurrentTrains={maxConcurrentTrains}
              isActiveLevel={level.level === activeLevel}
              onLevelClick={handleLevelClick}
              onRemoveLevel={onRemoveLevel}
              onLevelChange={(updatedLevel: PlanningLevel) => {
                const updatedLevels = { ...productionPlan.levels };
                updatedLevels[updatedLevel.level] = updatedLevel;

                // Update the production plan first
                const updatedPlan = {
                  ...productionPlan,
                  levels: updatedLevels,
                };
                onProductionPlanChange(updatedPlan);

                // Then check if we need to change the active level
                if (updatedLevel.level === activeLevel && updatedLevel.done) {
                  // If the current active level was marked done, move to next incomplete level
                  const nextIncompleteLevel = Object.values(updatedLevels).find(
                    l => !l.done && l.level > activeLevel
                  );
                  if (nextIncompleteLevel) {
                    onActiveLevelChange(nextIncompleteLevel.level);
                  }
                }
              }}
              onReorderJob={handleReorderJob}
              onMoveJobToLevel={handleMoveJobToLevel}
              updateInventory={getInventoryChanges}
              onAddStepToLevel={(step: Step, targetLevel: number) => {
                let updatedLevels = { ...productionPlan.levels };

                if (targetLevel <= 0) {
                  // Create a new level at the beginning of the plan
                  const newLevel: PlanningLevel = {
                    level: 1,
                    steps: [step],
                    inventoryChanges: new Map(),
                    done: false,
                  };
                  newLevel.inventoryChanges = getInventoryChanges(newLevel);

                  // Add the new level at the beginning
                  const newLevels: Record<number, PlanningLevel> = {
                    1: newLevel,
                  };

                  // Add existing levels with incremented level numbers
                  Object.values(updatedLevels).forEach(level => {
                    newLevels[level.level + 1] = {
                      ...level,
                      level: level.level + 1,
                    };
                  });

                  // Update step levelIds for all levels
                  Object.values(newLevels).forEach(level =>
                    level.steps.forEach(step => {
                      step.levelId = level.level;
                    })
                  );

                  updatedLevels = newLevels;

                  // Update the production plan with renumbered levels
                  onActiveLevelChange(activeLevel + 1);
                  onProductionPlanChange({
                    ...productionPlan,
                    levels: updatedLevels,
                  });
                } else if (targetLevel > 0) {
                  // Find the target level and add the step to it
                  const targetLevelObj = updatedLevels[targetLevel];
                  if (targetLevelObj) {
                    // Add the step to the target level
                    targetLevelObj.steps.push(step);
                    onActiveLevelChange(targetLevel);
                    // Update the production plan
                    onProductionPlanChange({
                      ...productionPlan,
                      levels: updatedLevels,
                    });
                  }
                }
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
