import { useState, useEffect } from 'react';
import { Order, ProductionPlan, PlannedStep, GameState, Recipe, Destination } from './types';
import { ProductionCalculator } from './calculator';

interface ProductionResultsProps {
  order: Order;
  calculator: ProductionCalculator;
  gameState: GameState;
  onPlanChange: (plan: ProductionPlan | null) => void;
}

export function ProductionResults({ order, calculator, gameState, onPlanChange }: ProductionResultsProps) {
  const [productionPlan, setProductionPlan] = useState<ProductionPlan | null>(null);
  const [selectedSteps, setSelectedSteps] = useState<PlannedStep[]>([]);
  const [recipeTrees, setRecipeTrees] = useState<any[]>([]);

  useEffect(() => {
    // Build recipe trees for the order
    const trees = calculator.buildRecipeTree(order);
    setRecipeTrees(trees);
  }, [order, calculator]);

  const createStepFromRecipe = (resourceId: string, recipe: Recipe, level: number): PlannedStep => {
    const orderResource = order.resources.find(r => r.resourceId === resourceId);
    
    return {
      id: `step_${Date.now()}_${Math.random()}`,
      type: 'factory',
      resourceId,
      timeRequired: recipe.timeRequired,
      dependencies: [],
      level,
      amountProcessed: orderResource?.amount || 0,
      recipe
    };
  };

  const createStepFromDestination = (destination: Destination, level: number): PlannedStep => {
    const orderResource = order.resources.find(r => r.resourceId === destination.resourceId);
    
    return {
      id: `step_${Date.now()}_${Math.random()}`,
      type: 'destination',
      resourceId: destination.resourceId,
      timeRequired: destination.travelTime,
      dependencies: [],
      level,
      amountProcessed: orderResource?.amount || 0,
      destination
    };
  };

  const addStepToLevel = (step: PlannedStep, level: number) => {
    const newStep = { ...step, level };
    const newSteps = [...selectedSteps, newStep];
    setSelectedSteps(newSteps);
    
    // Create production plan
    const plan = calculator.createProductionPlan(order, newSteps);
    setProductionPlan(plan);
    onPlanChange(plan);
  };

  const moveStepToLevel = (stepId: string, fromLevel: number, toLevel: number) => {
    if (!productionPlan) return;
    
    const newPlan = calculator.moveStepToLevel(stepId, fromLevel, toLevel, productionPlan);
    setProductionPlan(newPlan);
    onPlanChange(newPlan);
    
    // Update selected steps
    const updatedSteps = selectedSteps.map(step => 
      step.id === stepId ? { ...step, level: toLevel } : step
    );
    setSelectedSteps(updatedSteps);
  };

  const removeStep = (stepId: string, level: number) => {
    if (!productionPlan) return;
    
    const newPlan = calculator.removeStepFromLevel(stepId, level, productionPlan);
    setProductionPlan(newPlan);
    onPlanChange(newPlan);
    
    // Update selected steps
    const updatedSteps = selectedSteps.filter(step => step.id !== stepId);
    setSelectedSteps(updatedSteps);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getResourceName = (resourceId: string): string => {
    return gameState.resources.find(r => r.id === resourceId)?.name || resourceId;
  };

  if (!productionPlan) {
    return (
      <div className="production-results">
        <h2>Production Planning for: {order.name}</h2>
        
        <div className="planning-section">
          <h3>Available Recipes and Destinations</h3>
          
          {recipeTrees.map((tree, treeIndex) => (
            <div key={treeIndex} className="recipe-tree">
              <h4>{tree.resourceName} (Need: {tree.requiredAmount})</h4>
              
              {tree.availableRecipes.length > 0 && (
                <div className="recipes-section">
                  <h5>Factory Recipes:</h5>
                  <div className="recipes-grid">
                    {tree.availableRecipes.map((recipe: Recipe, recipeIndex: number) => (
                      <div key={recipeIndex} className="recipe-card">
                        <h6>Recipe {recipeIndex + 1}</h6>
                        <p>Time: {formatTime(recipe.timeRequired)}</p>
                        <p>Output: {recipe.outputAmount || 'Unknown'}</p>
                        {recipe.requires.length > 0 && (
                          <div>
                            <strong>Requires:</strong>
                            {recipe.requires.map((req, reqIndex) => (
                              <span key={reqIndex} className="requirement-tag">
                                {getResourceName(req.resourceId)}: {req.amount}
                              </span>
                            ))}
                          </div>
                        )}
                        <button
                          className="btn btn-primary"
                          onClick={() => addStepToLevel(createStepFromRecipe(tree.resourceId, recipe, 1), 1)}
                        >
                          Add to Level 1
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {tree.availableDestinations.length > 0 && (
                <div className="destinations-section">
                  <h5>Gathering Destinations:</h5>
                  <div className="destinations-grid">
                    {tree.availableDestinations.map((destination: Destination, destIndex: number) => (
                      <div key={destIndex} className="destination-card">
                        <h6>{destination.id}</h6>
                        <p>Travel Time: {formatTime(destination.travelTime)}</p>
                        <p>Resource: {getResourceName(destination.resourceId)}</p>
                        <button
                          className="btn btn-primary"
                          onClick={() => addStepToLevel(createStepFromDestination(destination, 1), 1)}
                        >
                          Add to Level 1
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="production-results">
      <h2>Production Plan for: {order.name}</h2>
      
      <div className="plan-summary">
        <div className="summary-item">
          <strong>Total Time:</strong> {formatTime(productionPlan.totalTime)}
        </div>
        <div className="summary-item">
          <strong>Max Concurrent Workers:</strong> {productionPlan.maxConcurrentWorkers}
        </div>
        <div className="summary-item">
          <strong>Levels:</strong> {productionPlan.levels.length}
        </div>
      </div>

      <div className="planning-levels">
        {productionPlan.levels.map((level) => (
          <div 
            key={level.level} 
            className={`planning-level ${level.isOverCapacity ? 'over-capacity' : ''}`}
          >
            <div className="level-header">
              <h3>Level {level.level}</h3>
              <div className="level-info">
                <span className={`worker-count ${level.isOverCapacity ? 'over-capacity' : ''}`}>
                  Workers: {level.trainCount}/{productionPlan.maxConcurrentWorkers}
                </span>
                <span className="level-time">Time: {formatTime(level.estimatedTime)}</span>
              </div>
            </div>
            
            <p className="level-description">{level.description}</p>
            
            <div className="level-steps">
              {level.steps.map((step) => (
                <div key={step.id} className="planning-step">
                  <div className="step-info">
                    <span className="step-type">{step.type}</span>
                    <span className="step-resource">{getResourceName(step.resourceId)}</span>
                    <span className="step-time">{formatTime(step.timeRequired)}</span>
                    <span className="step-amount">Amount: {step.amountProcessed}</span>
                  </div>
                  
                  <div className="step-actions">
                    <select
                      value={step.level}
                      onChange={(e) => moveStepToLevel(step.id, step.level, Number(e.target.value))}
                      className="level-select"
                    >
                      {Array.from({ length: 5 }, (_, i) => i + 1).map(levelNum => (
                        <option key={levelNum} value={levelNum}>
                          Level {levelNum}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeStep(step.id, step.level)}
                      className="btn btn-danger btn-small"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="level-inventory">
              <h4>Inventory Changes:</h4>
              {level.inventoryChanges.size > 0 ? (
                <div className="inventory-changes">
                  {Array.from(level.inventoryChanges.entries()).map(([resourceId, change]) => (
                    <span 
                      key={resourceId} 
                      className={`inventory-change ${change > 0 ? 'positive' : 'negative'}`}
                    >
                      {getResourceName(resourceId)}: {change > 0 ? '+' : ''}{change}
                    </span>
                  ))}
                </div>
              ) : (
                <p>No inventory changes</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="plan-actions">
        <button
          className="btn btn-secondary"
          onClick={() => {
            setProductionPlan(null);
            setSelectedSteps([]);
            onPlanChange(null);
          }}
        >
          Reset Plan
        </button>
      </div>
    </div>
  );
}
