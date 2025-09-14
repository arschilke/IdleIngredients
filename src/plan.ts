import { PlanningLevel, ProductionPlan } from './types';

export const InsertNewLevelIntoPlan = (plan: ProductionPlan, level: number) => {
  const newLevel: PlanningLevel = {
    level: level,
    steps: [],
    inventoryChanges: new Map(),
    done: false,
  };
  const levels = { ...plan.levels };
  Object.values(levels)
    .filter(l => l.level <= level)
    .forEach(l => {
      levels[l.level + 1] = l;
    });
  levels[level] = newLevel;
  return {
    ...plan,
    levels: levels,
  };
};
