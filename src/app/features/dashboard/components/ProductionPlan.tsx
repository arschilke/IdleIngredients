import React, { useRef, useEffect } from 'react';
import type {
  ProductionPlan as ProductionPlanType,
  PlanningLevel,
  Order,
  Step,
  ResourceRequirement,
} from '../../../types';
import { StepType } from '../../../types';
import { ProductionLevel } from './ProductionLevel';
import { generateId } from '../../../utils';
import { getBestTrains } from '../../../trains';
import { getInventoryChanges } from '../../../hooks/useInventory';
import { useOrders } from '../../../hooks/useOrders';
import { useFactories } from '../../../hooks/useFactories';
import { useTrains } from '../../../hooks/useTrains';
import { useDestinations } from '../../../hooks/useDestinations';
import { InsertNewLevelIntoPlan } from '../../../plan';

interface ProductionPlanProps {
  productionPlan: ProductionPlanType;
  activeLevel: number;
  maxConcurrentTrains: number;
  onActiveLevelChange: (levelNumber: number) => void;
  onProductionPlanChange: (newPlan: ProductionPlanType) => void;
  onOrdersChange: (orders: Order[]) => void;
  onClearPlan: () => void;
}

export const ProductionPlan: React.FC<ProductionPlanProps> = ({
  productionPlan,
  maxConcurrentTrains,
  activeLevel,
  onActiveLevelChange,
  onProductionPlanChange,
  onClearPlan,
}) => {
  const { data: factories, isLoading: factoriesLoading } = useFactories();
  const { data: trains, isLoading: trainsLoading } = useTrains();
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { data: destinations, isLoading: destinationsLoading } =
    useDestinations();
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

  if (
    factoriesLoading ||
    trainsLoading ||
    ordersLoading ||
    destinationsLoading
  ) {
    return <div>Loading...</div>;
  }
  // Handle moving a job from one level to another
  const moveJobToLevel = (
    jobId: string,
    fromLevel: number,
    toLevel: number
  ) => {
    if (fromLevel === toLevel) return;

    let updatedPlan = productionPlan;

    // Handle level creation if needed
    if (toLevel < 1) {
      updatedPlan = InsertNewLevelIntoPlan(updatedPlan, 1);
      toLevel = 1;
      fromLevel = 2;
    } else if (toLevel > Object.keys(productionPlan.levels).length) {
      // Create a new level at the end
      const newLevelNumber = Object.keys(productionPlan.levels).length + 1;
      updatedPlan = InsertNewLevelIntoPlan(updatedPlan, newLevelNumber);
      toLevel = newLevelNumber;
    }

    const fromLevelObj = updatedPlan.levels[fromLevel];
    const toLevelObj = updatedPlan.levels[toLevel];

    if (!fromLevelObj || !toLevelObj) return;

    // Find and remove the job from the source level
    const jobIndex = fromLevelObj.steps.findIndex(s => s.id === jobId);
    if (jobIndex === -1) return;

    const [movedJob] = fromLevelObj.steps.splice(jobIndex, 1);

    // Update the job's level
    movedJob.levelId = toLevel;

    // Add the job to the target level
    toLevelObj.steps.push(movedJob);

    updatedPlan.levels[fromLevel] = fromLevelObj;
    updatedPlan.levels[toLevel] = toLevelObj;

    onProductionPlanChange(updatedPlan);
  };

  const addJobToLevel = (job: Step, toLevel: number) => {
    let updatedPlan = productionPlan;
    let actualToLevel = toLevel;

    // Handle level creation if needed
    if (toLevel < 1) {
      updatedPlan = InsertNewLevelIntoPlan(updatedPlan, 1);
      actualToLevel = 1;
    } else if (toLevel > Object.keys(productionPlan.levels).length) {
      // Create a new level at the end
      const newLevelNumber = Object.keys(productionPlan.levels).length + 1;
      updatedPlan = InsertNewLevelIntoPlan(updatedPlan, newLevelNumber);
      actualToLevel = newLevelNumber;
    }

    const toLevelObj = updatedPlan.levels[actualToLevel];

    if (!toLevelObj) return;

    // Update the job's level
    job.levelId = actualToLevel;

    // Add the job to the target level
    toLevelObj.steps.push(job);

    updatedPlan.levels[actualToLevel] = toLevelObj;

    onProductionPlanChange(updatedPlan);
    onActiveLevelChange(actualToLevel);
  };

  const createNewLevel = (insertBeforeLevel: number) => {
    if (!productionPlan) return;

    const newLevel: PlanningLevel = {
      level: insertBeforeLevel,
      steps: [],
      inventoryChanges: new Map<string, number>(),
      done: false,
    };

    // Create new level object with the inserted level number
    const newLevels: Record<number, PlanningLevel> = {};

    // Add levels that come before the insertion point
    Object.values(productionPlan.levels).forEach(level => {
      if (level.level < insertBeforeLevel) {
        newLevels[level.level] = level;
      }
    });

    // Add the new level at the insertion point
    newLevels[insertBeforeLevel] = newLevel;

    // Add levels that come after the insertion point, renumbering them
    Object.values(productionPlan.levels).forEach(level => {
      if (level.level >= insertBeforeLevel) {
        const newLevelNumber = level.level + 1;
        const updatedLevel = {
          ...level,
          level: newLevelNumber,
          steps: level.steps.map(step => ({
            ...step,
            levelId: newLevelNumber,
          })),
        };
        newLevels[newLevelNumber] = updatedLevel;
      }
    });

    const newPlan: ProductionPlanType = {
      ...productionPlan,
      levels: newLevels,
    };

    onProductionPlanChange(newPlan);
    onActiveLevelChange(insertBeforeLevel);
  };

  const onRemoveLevel = (levelNumber: number) => {
    if (!productionPlan) return;

    const levelIndex = Object.values(productionPlan.levels).find(
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

  const createResourceJob = (
    requirement: ResourceRequirement,
    targetLevel: number
  ) => {
    let updatedPlan = productionPlan;
    if (targetLevel < 1) {
      updatedPlan = InsertNewLevelIntoPlan(productionPlan, 1);
      targetLevel = 1;
    }

    const recipe = Object.values(factories!)
      .flatMap(f => f.recipes)
      .find(r => r.resourceId === requirement.resourceId);
    const destination = Object.values(destinations!).find(
      dest => dest.resourceId === requirement.resourceId
    );

    let newStep: Step | null = null;
    const level = updatedPlan.levels[targetLevel];
    if (
      destination &&
      level.steps.filter((s: Step) => 'trainId' in s).length <
        maxConcurrentTrains
    ) {
      newStep = {
        id: generateId('step'),
        name: destination.name,
        type: StepType.Destination,
        resourceId: requirement.resourceId,
        levelId: targetLevel,
        trainId: getBestTrains(
          level,
          requirement.amount,
          trains!,
          destination.classes,
          [destination.country]
        )[0].id,
        timeRequired: destination.travelTime,
      };
    } else if (recipe) {
      newStep = {
        id: generateId('step'),
        name: `Make ${recipe.resourceId}`,
        type: StepType.Factory,
        resourceId: requirement.resourceId,
        levelId: targetLevel,
        timeRequired: recipe.timeRequired,
      };
    } else if (
      destination &&
      level.steps.filter((s: Step) => 'trainId' in s).length >=
        maxConcurrentTrains
    ) {
      targetLevel--;
      createResourceJob(requirement, targetLevel);
      return;
    }
    level.steps.push(newStep as Step);
    level.inventoryChanges = getInventoryChanges(
      level,
      factories!,
      trains!,
      orders!
    );
    if (newStep) {
      onProductionPlanChange({
        ...updatedPlan,
        levels: {
          ...updatedPlan.levels,
          [targetLevel]: {
            ...level,
          },
        },
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
          <button className="btn btn-primary" onClick={() => createNewLevel(1)}>
            Create First Level
          </button>
        </div>
      </div>
    );
  }

  const simplifyProductionPlan = (): void => {
    //TODO: This doesnt work.
    for (const level of Object.values(productionPlan.levels)) {
      let trainCount = 0;
      level.steps.map(step => {
        if ('trainId' in step) {
          trainCount++;
        }
      });
      if (trainCount < maxConcurrentTrains) {
        const moveableSteps = productionPlan.levels[
          level.level + 1
        ].steps.filter(
          step =>
            'trainId' in step &&
            !(step.trainId in level.steps.map(s => 'trainId' in s && s.trainId))
        );
        let i = 0;
        do {
          moveJobToLevel(moveableSteps[i].id, level.level + 1, level.level);
          i++;
          trainCount++;
        } while (trainCount < maxConcurrentTrains && moveableSteps.length > i);
      }
    }
    onProductionPlanChange({ ...productionPlan });
  };

  return (
    <div className="card h-100">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h3 className="card-title mb-0">Production Plan</h3>
        <div className="d-flex gap-2">
          <button
            className="btn btn-success btn-sm"
            onClick={() =>
              createNewLevel(Object.keys(productionPlan.levels).length + 1)
            }
          >
            <i className="bi bi-plus-circle"></i> Add Level
          </button>
          <button
            className="btn btn-info btn-sm"
            onClick={() => simplifyProductionPlan()}
          >
            <i className="bi bi-math me-1"></i>
            Simplify
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
              productionPlan={productionPlan}
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
              onCreateResourceJob={createResourceJob}
              onMoveJobToLevel={moveJobToLevel}
              onAddJobToLevel={addJobToLevel}
              onInsertLevel={createNewLevel}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
