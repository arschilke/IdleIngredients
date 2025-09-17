import React, { useState } from 'react';
import type { ProductionPlan, Resource } from '../../../types';
import { calculateInventoryAtLevel } from '../../../hooks/useProductionPlan';
import { InventoryForm } from '../../../components/forms/InventoryForm';
import { useLiveQuery } from '@tanstack/react-db';

interface CurrentInventoryProps {
  resources: Record<string, Resource>;
  activeLevel: number;
  productionPlan: ProductionPlan;
  initialInventory: Map<string, number>;
  onInitialInventoryChange: (inventory: Map<string, number>) => void;
}

export const CurrentInventory: React.FC<CurrentInventoryProps> = ({
  resources,
  activeLevel,
  productionPlan,
  initialInventory,
  onInitialInventoryChange,
}) => {
  const [showInitialInventoryForm, setShowInitialInventoryForm] =
    useState(false);

  const editInitialInventory = () => {
    setShowInitialInventoryForm(true);
  };

  const inventory: Map<string, number> = calculateInventoryAtLevel(
    initialInventory,
    activeLevel,
    productionPlan!
  );

  const getResourceNumberColor = (
    resourceId: string,
    amount: number
  ): string => {
    const hasChanged =
      productionPlan?.levels[activeLevel]?.inventoryChanges.has(resourceId) ??
      false;
    if (!hasChanged) return 'text-muted';
    if (amount > 0) return 'text-warning';
    if (amount < 0) return 'text-danger';

    return 'text-danger'; // No resources available
  };

  const getActiveLevelInventoryChanges = () => {
    if (!productionPlan) return new Map();

    const activeLevelData = productionPlan.levels[activeLevel];
    return activeLevelData?.inventoryChanges || new Map();
  };

  const activeLevelChanges = getActiveLevelInventoryChanges();
  const currentSize = Array.from(inventory.values()).reduce(
    (sum: number, val: number) => sum + val,
    0
  );

  if (showInitialInventoryForm) {
    return (
      <InventoryForm
        initialInventory={initialInventory}
        onInitialInventoryChange={onInitialInventoryChange}
        resources={resources}
        onClose={() => {
          setShowInitialInventoryForm(false);
        }}
      />
    );
  }

  return (
    <div className="card h-100 d-flex flex-column">
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="card-title">
            <i className="bi bi-box-seam"></i> Current Inventory
          </h5>
          <h4>Level {activeLevel}</h4>
        </div>
      </div>
      <div className="actions bg-dark p-2">
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={() => {
            editInitialInventory();
          }}
        >
          Edit Initial Inventory
        </button>
      </div>
      <div className="card-body flex-grow-1 overflow-auto">
        <div className="mb-2">
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
              <i className="bi bi-circle-fill text-warning me-1"></i>Changed
            </span>
            <span>
              <i className="bi bi-circle-fill text-danger me-1"></i>Insufficient
            </span>
            <span>
              <i className="bi bi-circle-fill text-muted me-1"></i>Not Needed
            </span>
          </div>
        </div>

        <div className="inventory-grid">
          <div className="row row-cols-6 g-2">
            {Array.from(inventory.entries()).map(([resourceId, amount]) => {
              const resource = resources[resourceId];
              return (
                <div key={resourceId} className="col">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body p-2 text-center">
                      <div className="d-flex justify-content-center flex-column">
                        <div className="flex-shrink-1">
                          <img
                            src={`${resource.icon}`}
                            alt={resource.name}
                            className="img-fluid"
                          />
                        </div>
                        <span className="fw-medium small text-truncate d-block">
                          {resource.name}
                        </span>
                        <span
                          className={`fw-bold ${getResourceNumberColor(resourceId, amount)}`}
                        >
                          {amount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
