import React from 'react';
import { GameState, ProductionPlan } from './types';

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
    for (const warehouse of gameState.warehouses) {
      for (const [resourceId, amount] of warehouse.inventory) {
        const current = inventory.get(resourceId) || 0;
        inventory.set(resourceId, current + amount);
      }
    }
    
    // Apply inventory changes from completed levels
    if (productionPlan) {
      for (const level of productionPlan.levels) {
        if (level.level < activeLevel && level.done) {
          for (const [resourceId, change] of level.inventoryChanges) {
            const current = inventory.get(resourceId) || 0;
            inventory.set(resourceId, current + change);
          }
        }
      }
    }
    
    return inventory;
  };

  const getResourceName = (resourceId: string): string => {
    return gameState.resources.find(r => r.id === resourceId)?.name || resourceId;
  };

  const getInventoryStatus = (amount: number): { class: string; text: string } => {
    if (amount === 0) return { class: 'text-danger', text: 'Empty' };
    if (amount < 10) return { class: 'text-warning', text: 'Low' };
    return { class: 'text-success', text: 'OK' };
  };

  const getActiveLevelInventoryChanges = () => {
    if (!productionPlan) return new Map();
    
    const activeLevelData = productionPlan.levels.find(level => level.level === activeLevel);
    return activeLevelData?.inventoryChanges || new Map();
  };

  const currentInventory = getCurrentInventory();
  const activeLevelChanges = getActiveLevelInventoryChanges();

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title mb-0">
          <i className="bi bi-box-seam"></i> Current Inventory
        </h3>
      </div>
      <div className="card-body">
        <div className="mb-3">
          <h6 className="text-muted">Active Level: {activeLevel}</h6>
          {productionPlan && (
            <div className="alert alert-info">
              <small>
                <i className="bi bi-info-circle"></i> 
                Showing inventory after completing levels 1-{activeLevel - 1}
              </small>
            </div>
          )}
        </div>

        {activeLevelChanges.size > 0 && (
          <div className="mb-3">
            <h6 className="text-muted">Level {activeLevel} Changes:</h6>
            <div className="d-flex flex-wrap gap-1">
              {Array.from(activeLevelChanges.entries()).map(([resourceId, change]) => (
                <span 
                  key={resourceId}
                  className={`badge ${change > 0 ? 'bg-success' : 'bg-danger'}`}
                >
                  {getResourceName(resourceId)} {change > 0 ? '+' : ''}{change}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="inventory-list">
          {Array.from(currentInventory.entries()).map(([resourceId, amount]) => {
            const status = getInventoryStatus(amount);
            return (
              <div key={resourceId} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                <div>
                  <span className="fw-medium">{getResourceName(resourceId)}</span>
                  <span className={`badge ms-2 ${status.class.replace('text-', 'bg-')}`}>
                    {status.text}
                  </span>
                </div>
                <span className="fw-bold">{amount}</span>
              </div>
            );
          })}
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
