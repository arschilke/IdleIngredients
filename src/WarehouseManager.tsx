import React, { useState } from 'react';
import { Warehouse, Resource } from './types';

interface WarehouseManagerProps {
  warehouses: Warehouse[];
  onWarehousesChange: (warehouses: Warehouse[]) => void;
  resources: Resource[];
}

export const WarehouseManager: React.FC<WarehouseManagerProps> = ({
  warehouses,
  onWarehousesChange,
  resources,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    maxCapacity: 1000,
  });

  const resetForm = () => {
    setFormData({ name: '', maxCapacity: 1000 });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      alert('Please fill in the warehouse name.');
      return;
    }

    const warehouse: Warehouse = {
      id: editingId || `warehouse_${Date.now()}`,
      name: formData.name.trim(),
      maxCapacity: formData.maxCapacity,
      inventory: new Map(),
    };

    if (editingId) {
      onWarehousesChange(
        warehouses.map(w => (w.id === editingId ? warehouse : w))
      );
    } else {
      onWarehousesChange([...warehouses, warehouse]);
    }

    resetForm();
  };

  const deleteWarehouse = (id: string) => {
    if (confirm('Are you sure you want to delete this warehouse?')) {
      onWarehousesChange(warehouses.filter(w => w.id !== id));
    }
  };

  const startEdit = (warehouse: Warehouse) => {
    setFormData({ name: warehouse.name, maxCapacity: warehouse.maxCapacity });
    setEditingId(warehouse.id);
    setIsAdding(true);
  };

  const updateInventory = (
    warehouseId: string,
    resourceId: string,
    change: number
  ) => {
    const updatedWarehouses = warehouses.map(warehouse => {
      if (warehouse.id === warehouseId) {
        const current = warehouse.inventory.get(resourceId) || 0;
        const newAmount = Math.max(0, current + change);
        const newInventory = new Map(warehouse.inventory);
        newInventory.set(resourceId, newAmount);

        return {
          ...warehouse,
          inventory: newInventory,
        };
      }
      return warehouse;
    });

    onWarehousesChange(updatedWarehouses);
  };

  const getResourceName = (resourceId: string) => {
    return resources.find(r => r.id === resourceId)?.name || resourceId;
  };

  const getTotalInventory = (resourceId: string) => {
    return warehouses.reduce((total, warehouse) => {
      return total + (warehouse.inventory.get(resourceId) || 0);
    }, 0);
  };

  return (
    <div className="warehouse-manager">
      <h2>🏪 Warehouse Management</h2>

      <button
        className="btn btn-primary"
        onClick={() => setIsAdding(true)}
        disabled={isAdding}
      >
        Add New Warehouse
      </button>

      {isAdding && (
        <div className="card">
          <h3>{editingId ? 'Edit Warehouse' : 'Add New Warehouse'}</h3>

          <form onSubmit={handleSubmit} className="form">
            <div className="form-group">
              <label htmlFor="warehouseName">Warehouse Name:</label>
              <input
                id="warehouseName"
                type="text"
                value={formData.name}
                onChange={e =>
                  setFormData(prev => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., Main Warehouse, Storage Depot"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="maxCapacity">Maximum Capacity:</label>
              <input
                id="maxCapacity"
                type="number"
                value={formData.maxCapacity}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    maxCapacity: parseInt(e.target.value) || 1000,
                  }))
                }
                placeholder="e.g., 1000"
                min="1"
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update Warehouse' : 'Add Warehouse'}
              </button>
              <button type="button" onClick={resetForm} className="btn">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="warehouses-overview">
        <h3>Warehouses Overview</h3>
        <div className="warehouses-grid">
          {warehouses.map(warehouse => (
            <div key={warehouse.id} className="warehouse-card">
              <div className="warehouse-header">
                <h4>{warehouse.name}</h4>
                <div className="warehouse-actions">
                  <button onClick={() => startEdit(warehouse)} className="btn">
                    Edit
                  </button>
                  <button
                    onClick={() => deleteWarehouse(warehouse.id)}
                    className="btn btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="warehouse-info">
                <p>Max Capacity: {warehouse.maxCapacity.toLocaleString()}</p>
                <p>
                  Current Usage:{' '}
                  {Array.from(warehouse.inventory.values())
                    .reduce((sum, amount) => sum + amount, 0)
                    .toLocaleString()}
                </p>
              </div>

              <div className="inventory-section">
                <h5>Inventory</h5>
                <div className="inventory-list">
                  {Array.from(warehouse.inventory.entries()).map(
                    ([resourceId, amount]) => (
                      <div key={resourceId} className="inventory-item">
                        <span className="resource-name">
                          {getResourceName(resourceId)}
                        </span>
                        <span className="resource-amount">
                          {amount.toLocaleString()}
                        </span>
                        <div className="inventory-controls">
                          <button
                            className="btn btn-small"
                            onClick={() =>
                              updateInventory(warehouse.id, resourceId, 1)
                            }
                            title="Add 1"
                          >
                            +
                          </button>
                          <button
                            className="btn btn-small"
                            onClick={() =>
                              updateInventory(warehouse.id, resourceId, -1)
                            }
                            title="Remove 1"
                          >
                            -
                          </button>
                          <button
                            className="btn btn-small"
                            onClick={() =>
                              updateInventory(warehouse.id, resourceId, 10)
                            }
                            title="Add 10"
                          >
                            +10
                          </button>
                          <button
                            className="btn btn-small"
                            onClick={() =>
                              updateInventory(warehouse.id, resourceId, -10)
                            }
                            title="Remove 10"
                          >
                            -10
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="global-inventory">
        <h3>Global Inventory Summary</h3>
        <div className="global-inventory-grid">
          {resources.map(resource => {
            const totalAmount = getTotalInventory(resource.id);
            return (
              <div key={resource.id} className="global-inventory-item">
                <span className="resource-name">{resource.name}</span>
                <span className="resource-amount">
                  {totalAmount.toLocaleString()}
                </span>
                <div className="resource-status">
                  {totalAmount === 0 && (
                    <span className="status-empty">Empty</span>
                  )}
                  {totalAmount > 0 && totalAmount < 100 && (
                    <span className="status-low">Low</span>
                  )}
                  {totalAmount >= 100 && <span className="status-ok">OK</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
