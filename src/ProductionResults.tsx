import React from 'react';
import { ProductionPlan, Worker } from './types';
import { ProductionCalculator } from './calculator';

interface ProductionResultsProps {
  productionPlan: ProductionPlan | null;
  workers: Worker[];
}

export const ProductionResults: React.FC<ProductionResultsProps> = ({ productionPlan, workers }) => {
  if (!productionPlan) {
    return (
      <div className="card">
        <h2>Production Results</h2>
        <p>No production plan calculated yet.</p>
      </div>
    );
  }

  const getWorkerName = (workerId: string) => {
    return workers.find(w => w.id === workerId)?.name || workerId;
  };

  const getWorkerCapacity = (workerId: string) => {
    return workers.find(w => w.id === workerId)?.capacity || 0;
  };

  return (
    <div className="card">
      <h2>🚀 Production Plan</h2>
      
      <div className="summary">
        <div className="summary-item">
          <strong>Total Time:</strong> {ProductionCalculator.formatTime(productionPlan.totalTime)}
        </div>
        <div className="summary-item">
          <strong>Max Concurrent Workers:</strong> {productionPlan.maxConcurrentWorkers}
        </div>
        <div className="summary-item">
          <strong>Production Levels:</strong> {productionPlan.levels.length}
        </div>
      </div>

      <div className="production-levels">
        <h3>📋 Production Levels</h3>
        {productionPlan.levels.map((level) => (
          <div key={level.level} className="level-card">
            <div className="level-header">
              <h4>Level {level.level}</h4>
              <span className="level-time">
                Est. Time: {ProductionCalculator.formatTime(level.estimatedTime)}
              </span>
            </div>
            
            <p className="level-description">{level.description}</p>
            
            <div className="level-steps">
              {level.steps.map((step) => {
                const workerId = productionPlan.workerAssignments.get(step.id);
                const workerName = workerId ? getWorkerName(workerId) : 'Unassigned';
                const workerCapacity = workerId ? getWorkerCapacity(workerId) : 0;
                
                return (
                  <div key={step.id} className="step-item">
                    <div className="step-info">
                      <span className="step-type">{step.stepType}</span>
                      <span className="step-resource">{step.resourceId}</span>
                      <span className="step-time">
                        {ProductionCalculator.formatTime(step.timeRequired)}
                      </span>
                      <span className="step-amount">
                        Amount: {step.amountProcessed}
                      </span>
                    </div>
                    
                    {workerId && (
                      <div className="worker-info">
                        <span className="worker-name">{workerName}</span>
                        <span className="worker-capacity">Capacity: {workerCapacity}</span>
                        {step.startTime !== undefined && step.endTime !== undefined && (
                          <span className="step-timing">
                            {ProductionCalculator.formatTime(step.startTime)} - {ProductionCalculator.formatTime(step.endTime)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="timeline">
        <h3>⏰ Timeline</h3>
        <div className="timeline-events">
          {productionPlan.timeline.map((event, index) => (
            <div key={index} className="timeline-event">
              <span className="event-time">
                {ProductionCalculator.formatTime(event.time)}
              </span>
              <span className="event-type">{event.type}</span>
              <span className="event-description">{event.description}</span>
              {event.workerName && (
                <span className="event-worker">({event.workerName})</span>
              )}
              {event.inventoryChange !== undefined && (
                <span className={`inventory-change ${event.inventoryChange > 0 ? 'positive' : 'negative'}`}>
                  {event.inventoryChange > 0 ? '+' : ''}{event.inventoryChange}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {productionPlan.warehouseUpdates.length > 0 && (
        <div className="warehouse-updates">
          <h3>🏪 Warehouse Updates</h3>
          <div className="warehouse-updates-list">
            {productionPlan.warehouseUpdates.map((update, index) => (
              <div key={index} className="warehouse-update-item">
                <span className="update-time">
                  {new Date(update.timestamp).toLocaleTimeString()}
                </span>
                <span className="update-resource">{update.resourceId}</span>
                <span className={`update-change ${update.change > 0 ? 'positive' : 'negative'}`}>
                  {update.change > 0 ? '+' : ''}{update.change}
                </span>
                <span className="update-source">{update.source}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="worker-utilization">
        <h3>👥 Worker Utilization</h3>
        <div className="worker-stats">
          {workers.map((worker) => {
            const assignedSteps = Array.from(productionPlan.workerAssignments.entries())
              .filter(([_, workerId]) => workerId === worker.id)
              .map(([stepId]) => stepId);
            
            return (
              <div key={worker.id} className="worker-stat">
                <div className="worker-header">
                  <span className="worker-name">{worker.name}</span>
                  <span className="worker-capacity">Capacity: {worker.capacity}</span>
                </div>
                <div className="worker-assignments">
                  {assignedSteps.length > 0 ? (
                    <span>Assigned to {assignedSteps.length} step(s)</span>
                  ) : (
                    <span className="no-assignments">No assignments</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
