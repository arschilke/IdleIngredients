import React from 'react';
import { GameState, ProductionPlan } from './types';
import { getResourceName } from './utils';

interface CurrentInventoryProps {
  gameState: GameState;
  activeLevel: number;
  productionPlan: ProductionPlan | null;
}

export const CurrentInventory: React.FC<CurrentInventoryProps> = ({
  gameState,
  activeLevel,
  productionPlan
}) => {
  const getCurrentInventory = () => {
    const inventory = new Map<string, number>();

    // Start with current warehouse inventory
    for (const [resourceId, amount] of gameState.warehouse.inventory) {
      const current = inventory.get(resourceId) || 0;
      inventory.set(resourceId, current + amount);
    }

    // Apply inventory changes from all levels up to the active level
    if (productionPlan) {
      for (const level of productionPlan.levels) {
        if (level.level <= activeLevel) {
          for (const [resourceId, change] of level.inventoryChanges) {
            const current = inventory.get(resourceId) || 0;
            inventory.set(resourceId, current + change);
          }
        }
      }
    }

    return inventory;
  };



  const getActiveLevelResourceNeeds = () => {
    if (!productionPlan) return new Map();
    
    const activeLevelData = productionPlan.levels.find(level => level.level === activeLevel);
    if (!activeLevelData) return new Map();
    
    const resourceNeeds = new Map<string, number>();
    
    // Calculate total resources needed for all jobs in the active level
    activeLevelData.steps.forEach(step => {
      if (step.recipe) {
        // For factory jobs, add up all required resources from recipes
        step.recipe.requires.forEach(req => {
          const current = resourceNeeds.get(req.resourceId) || 0;
          resourceNeeds.set(req.resourceId, current + req.amount);
        });
      }
              if (step.type === 'delivery') {
          const requiredAmount = step.amountProcessed;
          const current = resourceNeeds.get(step.resourceId) || 0;
          resourceNeeds.set(step.resourceId, current + requiredAmount);
        }
    });
    
    return resourceNeeds;
  };

  const getResourceNumberColor = (resourceId: string, amount: number): string => {
    const activeLevelNeeds = getActiveLevelResourceNeeds();
    const neededAmount = activeLevelNeeds.get(resourceId) || 0;
    
    if (neededAmount === 0) return 'text-muted'; // No need for this resource
    if (amount >= neededAmount) return 'text-success'; // Sufficient resources
    if (amount > 0) return 'text-warning'; // Some resources but not enough
    return 'text-danger'; // No resources available
  };

  const getActiveLevelInventoryChanges = () => {
    if (!productionPlan) return new Map();

    const activeLevelData = productionPlan.levels.find(level => level.level === activeLevel);
    return activeLevelData?.inventoryChanges || new Map();
  };

  const getActiveLevelStatus = () => {
    if (!productionPlan) return null;
    return productionPlan.levels.find(level => level.level === activeLevel);
  };

  const currentInventory = getCurrentInventory();
  const activeLevelChanges = getActiveLevelInventoryChanges();
  const activeLevelData = getActiveLevelStatus();

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">
          <i className="bi bi-box-seam"></i> Current Inventory
        </h5>
      </div>
      <div className="card-body">
        <div className="mb-2">
          {activeLevelData && (
            <div className={`alert ${activeLevelData.done ? 'alert-secondary' : 'alert-info'}`}>
              <small>
                <i className={`bi ${activeLevelData.done ? 'bi-check-circle' : 'bi-info-circle'}`}></i>
                {activeLevelData.done 
                  ? ` Level ${activeLevel} is completed`
                  : ` Showing inventory at the end of level ${activeLevel}`
                }
              </small>
            </div>
          )}
          {!activeLevelData && productionPlan && (
            <div className="alert alert-warning">
              <small>
                <i className="bi bi-exclamation-triangle"></i>
                Level {activeLevel} not found in production plan
              </small>
            </div>
          )}
        </div>

        {activeLevelChanges.size > 0 && (
          <div className="mb-3">
            <h6 className="text-muted mb-2">
              <i className="bi bi-arrow-repeat me-1"></i>
              Level {activeLevel} Changes:
            </h6>
            <div className="d-flex flex-wrap gap-1">
              {Array.from(activeLevelChanges.entries()).map(([resourceId, change]) => (
                <span
                  key={resourceId}
                  className={`badge ${change > 0 ? 'bg-success' : 'bg-danger'}`}
                >
                  {getResourceName(resourceId, gameState)} {change > 0 ? '+' : ''}{change}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="text-muted mb-0">
              <i className="bi bi-grid-3x3-gap me-1"></i>
              Resource Overview
            </h6>
            <span className="badge bg-secondary">
              {currentInventory.size} Resources
            </span>
          </div>
          <div className="d-flex flex-wrap gap-2 small text-muted">
            <span><i className="bi bi-circle-fill text-success me-1"></i>Sufficient</span>
            <span><i className="bi bi-circle-fill text-warning me-1"></i>Insufficient</span>
            <span><i className="bi bi-circle-fill text-danger me-1"></i>Missing</span>
            <span><i className="bi bi-circle-fill text-muted me-1"></i>Not Needed</span>
          </div>
        </div>

        <div className="inventory-grid">
          <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-2">
            {Array.from(currentInventory.entries()).map(([resourceId, amount]) => {
              return (
                <div key={resourceId} className="col">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body p-2 text-center">
                      <div className="mb-2">
                        <i className="bi bi-box-seam fs-4 text-muted"></i>
                      </div>
                      <div className="mb-1">
                        <span className="fw-medium small text-truncate d-block">{getResourceName(resourceId, gameState)}</span>
                      </div>
                      <div>
                        <span className={`fw-bold fs-4 ${getResourceNumberColor(resourceId, amount)}`}>{amount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {currentInventory.size === 0 && (
          <div className="text-center text-muted py-4">
            <i className="bi bi-inbox display-4"></i>
            <p>No inventory found</p>
          </div>
        )}
      </div>
    </div>
  );
};
