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
    <div className="card h-100">
      <div className="card-header">
        <h2 className="h4 mb-0">Current Inventory</h2>
      </div>
      <div className="card-body">
        <div className="alert alert-success text-center mb-3">
          <strong>Active Level: {activeLevel}</strong>
        </div>
        
        <div className="d-flex flex-column gap-2 mb-3">
          {Array.from(currentInventory.entries()).map(([resourceId, amount]) => (
            <div key={resourceId} className="d-flex justify-content-between align-items-center p-2 border rounded">
              <div className="d-flex flex-column">
                <span className="fw-medium">{getResourceName(resourceId)}</span>
                <span className="text-warning fw-bold">{amount}</span>
              </div>
              <div>
                {amount === 0 && <span className="badge bg-danger">Empty</span>}
                {amount > 0 && amount < 50 && <span className="badge bg-warning">Low</span>}
                {amount >= 50 && <span className="badge bg-success">OK</span>}
              </div>
            </div>
          ))}
        </div>
        
        <div className="border-top pt-3 text-center">
          <p className="small text-muted mb-1">Total Resources: {currentInventory.size}</p>
          <p className="small text-muted mb-0">Total Items: {Array.from(currentInventory.values()).reduce((sum, amount) => sum + amount, 0)}</p>
        </div>
      </div>
    </div>
  );
}
