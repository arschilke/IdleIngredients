import React, { useRef, useEffect, useState } from 'react';
import { ProductionPlan as ProductionPlanType, GameState, PlanningLevel } from './types';
import { ProductionLevel } from './ProductionLevel';

interface ProductionPlanProps {
    productionPlan: ProductionPlanType | null;
    gameState: GameState;
    onProductionPlanChange: (newPlan: ProductionPlanType) => void;
    onClearPlan: () => void;
}


export const ProductionPlan: React.FC<ProductionPlanProps> = ({
    productionPlan,
    gameState,
    onProductionPlanChange,
    onClearPlan
}) => {
    const levelRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

    const [activeLevel, setActiveLevel] = useState<number>(0);

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
            description: 'New Level',
            estimatedTime: 0,
            done: false,
            startTime: 0,
            endTime: 0,
            isActive: true
        };

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
            setActiveLevel(updatedLevels.length > 0 ? 1 : 1);
        } else if (activeLevel > levelNumber) {
            setActiveLevel(activeLevel - 1);
        }

    };


    const handleLevelClick = (levelNumber: number) => {
        setActiveLevel(levelNumber);
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
                            gameState={gameState}
                            onLevelClick={handleLevelClick}
                            onRemoveLevel={onRemoveLevel}
                            onLevelChange={(updatedLevel: PlanningLevel) => {
                                const updatedLevels = productionPlan.levels.map(l =>
                                    l.level === updatedLevel.level ? updatedLevel : l
                                );
                                while (productionPlan.levels[activeLevel].done) {
                                    setActiveLevel(activeLevel + 1);
                                }
                                onProductionPlanChange({
                                    ...productionPlan,
                                    levels: updatedLevels
                                });
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};
