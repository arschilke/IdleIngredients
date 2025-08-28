import { GameState } from './types';

interface CurrentInventoryProps {
  gameState: GameState;
  activeLevel: number;
}

export function CurrentInventory({ gameState, activeLevel }: CurrentInventoryProps) {
  const getCurrentInventory = () => {
    const inventory = new Map<string, number>();
    
    for (const warehouse of gameState.warehouses) {
      for (const [resourceId, amount] of warehouse.inventory) {
        const current = inventory.get(resourceId) || 0;
        inventory.set(resourceId, current + amount);
      }
    }
    
    return inventory;
  };

  const getResourceName = (resourceId: string): string => {
    const resource = gameState.resources.find(r => r.id === resourceId);
    return resource?.name || resourceId;
  };

  const currentInventory = getCurrentInventory();

  return (
    <div className="current-inventory">
      <h2>Current Inventory</h2>
      <div className="level-indicator">
        <span>Active Level: {activeLevel}</span>
      </div>
      
      <div className="inventory-grid">
        {Array.from(currentInventory.entries()).map(([resourceId, amount]) => (
          <div key={resourceId} className="inventory-item">
            <div className="resource-info">
              <span className="resource-name">{getResourceName(resourceId)}</span>
              <span className="resource-amount">{amount}</span>
            </div>
            <div className="resource-status">
              {amount === 0 && <span className="status-empty">Empty</span>}
              {amount > 0 && amount < 50 && <span className="status-low">Low</span>}
              {amount >= 50 && <span className="status-ok">OK</span>}
            </div>
          </div>
        ))}
      </div>
      
      <div className="inventory-summary">
        <p>Total Resources: {currentInventory.size}</p>
        <p>Total Items: {Array.from(currentInventory.values()).reduce((sum, amount) => sum + amount, 0)}</p>
      </div>
    </div>
  );
}
