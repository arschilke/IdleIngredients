import React, { useRef, useEffect } from 'react';
import {
  ProductionPlan as ProductionPlanType,
  Inventory,
  PlanningLevel,
  PlannedStep,
  Order,
  Factory,
  Destination,
  Train,
  Resource,
} from './types';
import { ProductionLevel } from './ProductionLevel';

import { importOrdersAndPlan } from './exportUtils';

interface ProductionPlanProps {
  productionPlan: ProductionPlanType | null;
  resources: Resource[];
  activeLevel: number;
  factories: Factory[];
  destinations: Destination[];
  trains: Train[];
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
  maxConcurrentTrains,
  activeLevel,
  onActiveLevelChange,
  onProductionPlanChange,
  onOrdersChange,
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

    const levelIndex = productionPlan.levels.findIndex(
      l => l.level === levelNumber
    );
    if (levelIndex === -1) return;

    const level = productionPlan.levels[levelIndex];
    const jobIndex = level.steps.findIndex(s => s.id === jobId);
    if (jobIndex === -1) return;

    // Remove the job from its current position
    const [movedJob] = level.steps.splice(jobIndex, 1);

    // Insert it at the new position
    level.steps.splice(newIndex, 0, movedJob);

    // Update the production plan
    const updatedLevels = [...productionPlan.levels];
    updatedLevels[levelIndex] = level;

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

    const fromLevelIndex = productionPlan.levels.findIndex(
      l => l.level === fromLevel
    );
    const toLevelIndex = productionPlan.levels.findIndex(
      l => l.level === toLevel
    );

    if (fromLevelIndex === -1 || toLevelIndex === -1) return;

    const fromLevelObj = productionPlan.levels[fromLevelIndex];
    const toLevelObj = productionPlan.levels[toLevelIndex];

    // Find and remove the job from the source level
    const jobIndex = fromLevelObj.steps.findIndex(s => s.id === jobId);
    if (jobIndex === -1) return;

    const [movedJob] = fromLevelObj.steps.splice(jobIndex, 1);

    // Update the job's level
    movedJob.level = toLevel;

    // Add the job to the target level
    toLevelObj.steps.push(movedJob);

    // Update warehouse states for both levels
    const updatedLevels = [...productionPlan.levels];
    updatedLevels[fromLevelIndex] = fromLevelObj;
    updatedLevels[toLevelIndex] = toLevelObj;

    onProductionPlanChange({
      ...productionPlan,
      levels: updatedLevels,
    });
  };

  const createNewLevel = () => {
    if (!productionPlan) return;

    const newLevelNumber = productionPlan.levels.length + 1;
    const newLevel = {
      level: newLevelNumber,
      steps: [],
      inventoryChanges: new Map(),
      trainCount: 0,
      description: 'New Level',
      estimatedTime: 0,
      done: false,
      startTime: 0,
      endTime: 0,
    };

    const newPlan: ProductionPlanType = {
      ...productionPlan,
      levels: [...productionPlan.levels, newLevel],
    };

    onProductionPlanChange(newPlan);
    onActiveLevelChange(newLevelNumber);
  };

  const onRemoveLevel = (levelNumber: number) => {
    if (!productionPlan) return;

    var levelIndex = productionPlan.levels.findIndex(
      x => x.level === levelNumber
    );
    if (levelIndex === -1) return;

    var updatedLevels = productionPlan.levels
      .splice(levelIndex, 1)
      .map((level, index) => ({ ...level, level: index + 1 }));

    onProductionPlanChange({
      ...productionPlan,
      levels: updatedLevels,
    });

    // Adjust active level if needed
    if (activeLevel === levelNumber) {
      onActiveLevelChange(updatedLevels.length > 0 ? 1 : 1);
    } else if (activeLevel > levelNumber) {
      onActiveLevelChange(activeLevel - 1);
    }
  };

  const handleLevelClick = (levelNumber: number) => {
    onActiveLevelChange(levelNumber);
  };

  const handleExport = () => {
    //exportOrdersAndPlan(null, productionPlan);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    importOrdersAndPlan(file)
      .then(data => {
        onOrdersChange(data.orders);
        if (data.productionPlan) {
          onProductionPlanChange(data.productionPlan);
        }
        // Show success message
        alert(
          `Successfully imported ${data.orders.length} orders${data.productionPlan ? ' and production plan' : ''}`
        );
        // Reset the file input
        event.target.value = '';
      })
      .catch(error => {
        alert(`Import failed: ${error.message}`);
        event.target.value = '';
      });
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
          <button className="btn btn-info btn-sm" onClick={handleExport}>
            <i className="bi bi-download me-1"></i>
            Export
          </button>
          <label className="btn btn-primary btn-sm mb-0">
            <i className="bi bi-upload me-1"></i>
            Import
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
          </label>
          <button className="btn btn-danger btn-sm" onClick={onClearPlan}>
            <i className="bi bi-trash"></i> Clear Plan
          </button>
        </div>
      </div>
      <div className="card-body">
        {productionPlan.levels.map(level => (
          <div
            key={level.level}
            ref={el => {
              levelRefs.current[level.level] = el;
            }}
          >
            <ProductionLevel
              level={level}
              factories={factories}
              destinations={destinations}
              trains={trains}
              resources={resources}
              maxConcurrentTrains={maxConcurrentTrains}
              isActiveLevel={level.level === activeLevel}
              onLevelClick={handleLevelClick}
              onRemoveLevel={onRemoveLevel}
              onLevelChange={(updatedLevel: PlanningLevel) => {
                const updatedLevels = productionPlan.levels.map(l =>
                  l.level === updatedLevel.level ? updatedLevel : l
                );

                // Update the production plan first
                const updatedPlan = {
                  ...productionPlan,
                  levels: updatedLevels,
                };
                onProductionPlanChange(updatedPlan);

                // Then check if we need to change the active level
                if (updatedLevel.level === activeLevel && updatedLevel.done) {
                  // If the current active level was marked done, move to next incomplete level
                  const nextIncompleteLevel = updatedLevels.find(
                    l => !l.done && l.level > activeLevel
                  );
                  if (nextIncompleteLevel) {
                    onActiveLevelChange(nextIncompleteLevel.level);
                  }
                }
              }}
              onReorderJob={handleReorderJob}
              onMoveJobToLevel={handleMoveJobToLevel}
              onAddStepToLevel={(step: PlannedStep, targetLevel: number) => {
                let updatedLevels = [...productionPlan.levels];

                if (targetLevel === -1) {
                  // Create a new level at the beginning of the plan
                  const newLevel: PlanningLevel = {
                    level: 1,
                    startTime: 0,
                    endTime: 0,
                    steps: [step],
                    inventoryChanges: new Map([
                      [step.resourceId, step.amountProcessed],
                    ]),
                    trainCount: 0,
                    description: `Production: ${step.resourceId}`,
                    estimatedTime: step.timeRequired,
                    done: false,
                  };

                  // Add the new level at the beginning
                  updatedLevels.unshift(newLevel);

                  // Renumber all levels while keeping active level the same
                  const currentActiveLevel = activeLevel;
                  updatedLevels = updatedLevels.map((level, index) => ({
                    ...level,
                    level: index + 1,
                  }));

                  // Update the step's level to match the new level number
                  step.level = 1;

                  // Make the step ID more unique
                  step.id = `factory_${step.resourceId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

                  // Update the production plan with renumbered levels
                  onProductionPlanChange({
                    ...productionPlan,
                    levels: updatedLevels,
                  });
                  setActiveLevel(currentActiveLevel + 1);
                } else if (targetLevel > 0) {
                  // Find the target level and add the step to it
                  const targetLevelIndex = updatedLevels.findIndex(
                    l => l.level === targetLevel
                  );
                  if (targetLevelIndex !== -1) {
                    const targetLevelObj = updatedLevels[targetLevelIndex];

                    // Add the step to the target level
                    targetLevelObj.steps.push(step);

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
