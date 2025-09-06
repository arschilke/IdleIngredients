import React from 'react';
import { Inventory, ProductionPlan, Resource } from './types';

interface CurrentInventoryProps {
  inventory: Inventory;
  resources: Record<string, Resource>;
  activeLevel: number;
  productionPlan: ProductionPlan | null;
}

export const CurrentInventory: React.FC<CurrentInventoryProps> = ({
  resources,
  activeLevel,
  productionPlan,
  inventory,
}) => {
  const isDone = productionPlan?.levels[activeLevel]?.done ?? false;

  const getResourceNumberColor = (
    resourceId: string,
    amount: number
  ): string => {
    const neededAmount =
      productionPlan?.levels[activeLevel]?.inventoryChanges.get(resourceId) ||
      0;

    if (neededAmount === 0) return 'text-muted'; // No need for this resource
    if (amount >= neededAmount) return 'text-success'; // Sufficient resources
    if (amount < neededAmount) return 'text-warning'; // Some resources but not enough
    return 'text-danger'; // No resources available
  };

  const getActiveLevelInventoryChanges = () => {
    if (!productionPlan) return new Map();

    const activeLevelData = productionPlan.levels[activeLevel];
    return activeLevelData?.inventoryChanges || new Map();
  };

  const activeLevelChanges = getActiveLevelInventoryChanges();
  const currentSize = Object.values(inventory).reduce(
    (sum, val) => sum + val,
    0
  );

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">
          <i className="bi bi-box-seam"></i> Current Inventory
        </h5>
      </div>
      <div className="card-body">
        <div className="mb-2">
          {activeLevel && (
            <div
              className={`alert ${isDone ? 'alert-secondary' : 'alert-info'}`}
            >
              <small>
                <i
                  className={`bi ${isDone ? 'bi-check-circle' : 'bi-info-circle'}`}
                ></i>
                {isDone
                  ? ` Level ${activeLevel} is completed`
                  : ` Showing inventory at the end of level ${activeLevel}`}
              </small>
            </div>
          )}
          {!activeLevel && productionPlan && (
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
              {Array.from(activeLevelChanges.entries()).map(
                ([resourceId, change]) => (
                  <span
                    key={resourceId}
                    className={`badge ${change > 0 ? 'bg-success' : 'bg-danger'}`}
                  >
                    {resources[resourceId].name} {change > 0 ? '+' : ''}
                    {change}
                  </span>
                )
              )}
            </div>
          </div>
        )}

        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="text-muted mb-0">
              <i className="bi bi-grid-3x3-gap me-1"></i>
              Resource Overview
            </h6>
            <span className="badge bg-secondary">{currentSize} Resources</span>
          </div>
          <div className="d-flex flex-wrap gap-2 small text-muted">
            <span>
              <i className="bi bi-circle-fill text-success me-1"></i>Sufficient
            </span>
            <span>
              <i className="bi bi-circle-fill text-warning me-1"></i>
              Insufficient
            </span>
            <span>
              <i className="bi bi-circle-fill text-danger me-1"></i>Missing
            </span>
            <span>
              <i className="bi bi-circle-fill text-muted me-1"></i>Not Needed
            </span>
          </div>
        </div>

        <div className="inventory-grid">
          <div className="row row-cols-6 g-2">
            {Object.keys(inventory).map(resourceId => {
              const resource = resources[resourceId];
              return (
                <div key={resourceId} className="col">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body p-2 text-center">
                      <div className="d-flex justify-content-center flex-column">
                        <div className="flex-shrink-1">
                          <img
                            src={`/Assets/${resource.icon}`}
                            alt={resource.name}
                            className="img-fluid"
                          />
                        </div>
                        <span className="fw-medium small text-truncate d-block">
                          {resource.name}
                        </span>
                        <span
                          className={`fw-bold fs-4 ${getResourceNumberColor(resourceId, inventory[resourceId])}`}
                        >
                          {inventory[resourceId]}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {currentSize === 0 && (
          <div className="text-center text-muted py-4">
            <i className="bi bi-inbox display-4"></i>
            <p>No inventory found</p>
          </div>
        )}
      </div>
    </div>
  );
};
