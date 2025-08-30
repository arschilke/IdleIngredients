import React, { useRef, useEffect } from 'react';
import { ProductionPlan as ProductionPlanType, GameState, PlanningLevel, PlannedStep } from './types';
import { ProductionLevel } from './ProductionLevel';
import { updateWarehouseStateAfterStepAddition, calculateWarehouseStateAtLevel } from './trainUtils';

interface ProductionPlanProps {
    productionPlan: ProductionPlanType | null;
    gameState: GameState;
    activeLevel: number;
    onActiveLevelChange: (levelNumber: number) => void;
    onProductionPlanChange: (newPlan: ProductionPlanType) => void;
    onClearPlan: () => void;
}


export const ProductionPlan: React.FC<ProductionPlanProps> = ({
    productionPlan,
    gameState,
    activeLevel,
    onActiveLevelChange,
    onProductionPlanChange,
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
            warehouseState: new Map(),
            trainCount: 0,
            description: 'New Level',
            estimatedTime: 0,
            done: false,
            startTime: 0,
            endTime: 0
        };

        // Initialize warehouse state for the new level
        newLevel.warehouseState = calculateWarehouseStateAtLevel(
            [...productionPlan.levels, newLevel],
            newLevelNumber,
            gameState.warehouse.inventory
        );

        const newPlan: ProductionPlanType = {
            ...productionPlan,
            activeLevel: newLevelNumber,
            levels: [...productionPlan.levels, newLevel]
        };

        onProductionPlanChange(newPlan);
    };

    const onRemoveLevel = (levelNumber: number) => {
        if (!productionPlan) return;

        const updatedLevels = productionPlan.levels
            .filter(level => level.level !== levelNumber)
            .map((level, index) => ({ ...level, level: index + 1 }));

        onProductionPlanChange({
            ...productionPlan,
            levels: updatedLevels
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
        <div className="card flex-fill">
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
                            gameState={gameState}
                            isActiveLevel={level.level === activeLevel}
                            previousLevelWarehouseState={
                                level.level === 1 
                                    ? gameState.warehouse.inventory 
                                    : productionPlan.levels.find(l => l.level === level.level - 1)?.warehouseState || gameState.warehouse.inventory
                            }
                            onLevelClick={handleLevelClick}
                            onRemoveLevel={onRemoveLevel}
                            onLevelChange={(updatedLevel: PlanningLevel) => {
                                const updatedLevels = productionPlan.levels.map(l =>
                                    l.level === updatedLevel.level ? updatedLevel : l
                                );
                                
                                // Update the production plan first
                                const updatedPlan = {
                                    ...productionPlan,
                                    levels: updatedLevels
                                };
                                onProductionPlanChange(updatedPlan);
                                
                                // Then check if we need to change the active level
                                if (updatedLevel.level === activeLevel && updatedLevel.done) {
                                    // If the current active level was marked done, move to next incomplete level
                                    const nextIncompleteLevel = updatedLevels.find(l => !l.done && l.level > activeLevel);
                                    if (nextIncompleteLevel) {
                                        onActiveLevelChange(nextIncompleteLevel.level);
                                    }
                                }
                            }}
                            onAddStepToLevel={(step: PlannedStep, targetLevel: number) => {
                                console.log('onAddStepToLevel called with:', { step, targetLevel, currentLevels: productionPlan.levels.length });
                                let updatedLevels = [...productionPlan.levels];
                                
                                if (targetLevel === -1) {
                                    console.log('Creating new level at beginning');
                                    // Create a new level at the beginning of the plan
                                    const newLevel: PlanningLevel = {
                                        level: 1,
                                        startTime: 0,
                                        endTime: 0,
                                        steps: [step],
                                        inventoryChanges: new Map([[step.resourceId, step.amountProcessed]]),
                                        warehouseState: new Map(),
                                        trainCount: 0,
                                        description: `Production: ${step.resourceId}`,
                                        estimatedTime: step.timeRequired,
                                        done: false
                                    };
                                    
                                    // Add the new level at the beginning
                                    updatedLevels.unshift(newLevel);
                                    
                                    // Renumber all levels while keeping active level the same
                                    const currentActiveLevel = productionPlan.activeLevel;
                                    updatedLevels = updatedLevels.map((level, index) => ({
                                        ...level,
                                        level: index + 1
                                    }));
                                    
                                    // Update the step's level to match the new level number
                                    step.level = 1;
                                    
                                    // Make the step ID more unique
                                    step.id = `factory_${step.resourceId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                                    
                                    // Update warehouse state for all levels after adding this step
                                    const updatedLevelsWithInventory = updateWarehouseStateAfterStepAddition(
                                        updatedLevels, 
                                        step, 
                                        1, // New level is level 1
                                        gameState.warehouse.inventory
                                    );
                                    
                                    console.log('New levels after renumbering:', updatedLevels.map(l => ({ level: l.level, description: l.description })));
                                    
                                    // Update the production plan with renumbered levels
                                    onProductionPlanChange({
                                        ...productionPlan,
                                        levels: updatedLevelsWithInventory,
                                        activeLevel: currentActiveLevel + 1 // Adjust active level for renumbering
                                    });
                                } else if (targetLevel > 0) {
                                    console.log('Adding step to existing level:', targetLevel);
                                    // Find the target level and add the step to it
                                    const targetLevelIndex = updatedLevels.findIndex(l => l.level === targetLevel);
                                    if (targetLevelIndex !== -1) {
                                        const targetLevelObj = updatedLevels[targetLevelIndex];
                                        
                                        // Add the step to the target level
                                        targetLevelObj.steps.push(step);
                                        
                                        // Update warehouse state for all levels after adding this step
                                        const updatedLevelsWithInventory = updateWarehouseStateAfterStepAddition(
                                            updatedLevels, 
                                            step, 
                                            targetLevel,
                                            gameState.warehouse.inventory
                                        );
                                        
                                        // Update the production plan
                                        onProductionPlanChange({
                                            ...productionPlan,
                                            levels: updatedLevelsWithInventory
                                        });
                                    } else {
                                        console.log('Target level not found:', targetLevel);
                                    }
                                } else {
                                    console.log('Invalid target level:', targetLevel);
                                }
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};
