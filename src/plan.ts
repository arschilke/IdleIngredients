import { PlanningLevel, ProductionPlan } from './types';

export function InsertNewLevelIntoPlan(
  productionPlan: ProductionPlan,
  insertBeforeLevel: number
) {
  const newLevel: PlanningLevel = {
    level: insertBeforeLevel,
    steps: [],
    inventoryChanges: new Map(),
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

  const newPlan: ProductionPlan = {
    ...productionPlan,
    levels: newLevels,
  };
  return newPlan;
}

export function RemoveLevelFromPlan(
  productionPlan: ProductionPlan,
  levelNumber: number
) {
  var levelIndex = productionPlan.levels[levelNumber];
  if (levelIndex === undefined) return productionPlan;

  const updatedPlan = { ...productionPlan };
  delete updatedPlan.levels[levelNumber];

  // Renumber levels to be consecutive after removal
  const sortedLevelNumbers = Object.keys(updatedPlan.levels)
    .map(Number)
    .sort((a, b) => a - b);

  const newLevels: Record<number, PlanningLevel> = {};
  let newLevelNum = 1;
  for (const oldLevelNum of sortedLevelNumbers) {
    const level = { ...updatedPlan.levels[oldLevelNum], level: newLevelNum };
    newLevels[newLevelNum] = level;
    newLevelNum++;
  }

  return { ...updatedPlan, levels: newLevels };
}
