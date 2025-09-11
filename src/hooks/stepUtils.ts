import { 
  type Step, 
  type FactoryStep, 
  type DestinationStep, 
  type DeliveryStep, 
  type SubmitStep, 
  type Recipe,
  type Train, 
  StepType
} from '../../types';
import { useFactories } from './useFactories';
import { useTrains } from './useTrains';

/**
 * Hook to get recipe by resource ID
 */
export const useRecipe = (resourceId: string) => {
  const { data: factories } = useFactories();
  
  return factories ? Object.values(factories)
    .flatMap(f => f.recipes)
    .find(r => r.resourceId === resourceId) : undefined;
};

/**
 * Hook to get train by ID
 */
export const useTrain = (trainId: string) => {
  const { data: trains } = useTrains();
  
  return trains ? trains[trainId] : undefined;
};

/**
 * Hook to calculate output amount for a step
 */
export const useStepOutputAmount = (step: Step) => {
  const recipe = useRecipe(step.resourceId);
  const train = useTrain((step as DestinationStep | DeliveryStep).trainId);
  
  if (step.type === StepType.Destination) {
    return train?.capacity ?? 0;
  }
  if (step.type === StepType.Factory) {
    return recipe?.outputAmount ?? 0;
  }
  return 0;
};

/**
 * Hook to calculate input amounts for a step
 */
export const useStepInputAmounts = (step: Step) => {
  const recipe = useRecipe(step.resourceId);
  const train = useTrain((step as DeliveryStep).trainId);
  
  if (step.type === StepType.Factory) {
    if (!recipe) return new Map();
    
    return new Map(
      recipe.requires.map(req => [req.resourceId, req.amount])
    );
  }
  if (step.type === StepType.Delivery) {
    if (!train) return new Map();
    
    return new Map([[(step as DeliveryStep).resourceId, train.capacity]]);
  }
  return new Map();
};

// Legacy functions for backward compatibility - these should be replaced with hooks
/**
 * @deprecated Use useRecipe hook instead
 */
export const getRecipe = (resourceId: string): Recipe | undefined => {
  console.warn('getRecipe is deprecated, use useRecipe hook instead');
  return undefined;
};

/**
 * @deprecated Use useTrain hook instead
 */
export const getTrain = (trainId: string): Train | undefined => {
  console.warn('getTrain is deprecated, use useTrain hook instead');
  return undefined;
};

/**
 * @deprecated Use useStepOutputAmount hook instead
 */
export const getStepOutputAmount = (step: Step): number => {
  console.warn('getStepOutputAmount is deprecated, use useStepOutputAmount hook instead');
  return 0;
};

/**
 * @deprecated Use useStepInputAmounts hook instead
 */
export const getStepInputAmounts = (step: Step): Map<string, number> => {
  console.warn('getStepInputAmounts is deprecated, use useStepInputAmounts hook instead');
  return new Map();
};
