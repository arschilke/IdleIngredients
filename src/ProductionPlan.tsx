import { useState, useEffect } from 'react';
import { Order, GameState, Recipe, Destination } from './types';
import { ProductionCalculator } from './calculator';

interface ProductionPlanProps {
  order: Order | null;
  calculator: ProductionCalculator;
  gameState: GameState;
  activeLevel: number;
  onActiveLevelChange: (level: number) => void;
}

interface ProductionJob {
  id: string;
  type: 'factory' | 'destination' | 'delivery';
  level: number;
  recipe?: Recipe;
  destination?: Destination;
  orderId?: string;
  orderName?: string;
  timeRequired: number;
  timeRemaining?: number;
  status: 'waiting' | 'in-progress' | 'completed';
  inputResources?: Array<{ resourceId: string; amount: number }>;
  outputResources?: Array<{ resourceId: string; amount: number }>;
  deliveryAmount?: number;
  deliveryRemaining?: number;
}

export function ProductionPlan({ 
  order, 
  gameState, 
  activeLevel, 
  onActiveLevelChange 
}: ProductionPlanProps) {
  const [jobs, setJobs] = useState<ProductionJob[]>([]);
  const [draggedJob, setDraggedJob] = useState<string | null>(null);

  useEffect(() => {
    if (order) {
      // Generate sample jobs for the order
      generateJobsForOrder(order);
    }
  }, [order]);

  const generateJobsForOrder = (order: Order) => {
    const newJobs: ProductionJob[] = [];
    
    // Generate factory jobs for each resource
    order.resources.forEach((resourceReq, index) => {
      const recipe = findRecipeForResource(resourceReq.resourceId);
      if (recipe) {
        newJobs.push({
          id: `factory_${resourceReq.resourceId}_${index}`,
          type: 'factory',
          level: 2,
          recipe,
          timeRequired: recipe.timeRequired,
          status: 'waiting',
          inputResources: recipe.requires,
          outputResources: [{ resourceId: resourceReq.resourceId, amount: recipe.outputAmount || 0 }]
        });
      }
      
      // Generate destination job if no recipe found
      const destination = findDestinationForResource(resourceReq.resourceId);
      if (destination && !recipe) {
        newJobs.push({
          id: `destination_${resourceReq.resourceId}_${index}`,
          type: 'destination',
          level: 1,
          destination,
          timeRequired: destination.travelTime,
          status: 'waiting',
          outputResources: [{ resourceId: resourceReq.resourceId, amount: resourceReq.amount }]
        });
      }
    });
    
    // Add delivery job
    newJobs.push({
      id: `delivery_${order.id}`,
      type: 'delivery',
      level: 3,
      orderId: order.id,
      orderName: order.name,
      timeRequired: 60, // 1 minute per unit
      status: 'waiting',
      deliveryAmount: order.resources.reduce((sum, req) => sum + req.amount, 0),
      deliveryRemaining: order.resources.reduce((sum, req) => sum + req.amount, 0)
    });
    
    setJobs(newJobs);
  };

  const findRecipeForResource = (resourceId: string): Recipe | undefined => {
    for (const factory of gameState.factories) {
      const recipe = factory.recipes.find(r => r.resourceId === resourceId);
      if (recipe) return recipe;
    }
    return undefined;
  };

  const findDestinationForResource = (resourceId: string): Destination | undefined => {
    return gameState.destinations.find(d => d.resourceId === resourceId);
  };

  const getResourceName = (resourceId: string): string => {
    const resource = gameState.resources.find(r => r.id === resourceId);
    return resource?.name || resourceId;
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

  const handleDragStart = (e: React.DragEvent, jobId: string) => {
    setDraggedJob(jobId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetLevel: number) => {
    e.preventDefault();
    if (draggedJob) {
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === draggedJob ? { ...job, level: targetLevel } : job
        )
      );
      setDraggedJob(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedJob(null);
  };

  const handleResourceClick = (resourceId: string, currentLevel: number) => {
    const targetLevel = Math.max(1, currentLevel - 1);
    
    // Check if job already exists for this resource
    const existingJob = jobs.find(job => 
      (job.type === 'factory' && job.recipe?.resourceId === resourceId) ||
      (job.type === 'destination' && job.destination?.resourceId === resourceId)
    );
    
    if (existingJob) {
      // Move existing job to previous level
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === existingJob.id ? { ...job, level: targetLevel } : job
        )
      );
    } else {
      // Create new job for this resource
      const recipe = findRecipeForResource(resourceId);
      const destination = findDestinationForResource(resourceId);
      
      if (recipe) {
        const newJob: ProductionJob = {
          id: `factory_${resourceId}_${Date.now()}`,
          type: 'factory',
          level: targetLevel,
          recipe,
          timeRequired: recipe.timeRequired,
          status: 'waiting',
          inputResources: recipe.requires,
          outputResources: [{ resourceId, amount: recipe.outputAmount || 0 }]
        };
        setJobs(prevJobs => [...prevJobs, newJob]);
      } else if (destination) {
        const newJob: ProductionJob = {
          id: `destination_${resourceId}_${Date.now()}`,
          type: 'destination',
          level: targetLevel,
          destination,
          timeRequired: destination.travelTime,
          status: 'waiting',
          outputResources: [{ resourceId, amount: 100 }] // Default amount
        };
        setJobs(prevJobs => [...prevJobs, newJob]);
      }
    }
  };

  const getJobsByLevel = (level: number) => {
    return jobs.filter(job => job.level === level);
  };

  const getLevels = () => {
    const levels = new Set(jobs.map(job => job.level));
    return Array.from(levels).sort((a, b) => a - b);
  };

  if (!order) {
    return (
      <div className="card h-100">
        <div className="card-header">
          <h2 className="h4 mb-0">Production Plan</h2>
        </div>
        <div className="card-body text-center">
          <p className="text-muted mb-0">Select an order to view production plan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card h-100">
      <div className="card-header">
        <h2 className="h4 mb-0">Production Plan</h2>
      </div>
      <div className="card-body">
        <div className="alert alert-info mb-3">
          <h3 className="h6 mb-1">{order.name}</h3>
          <p className="small mb-0">Type: {order.type}</p>
        </div>
        
        <div className="d-flex flex-column gap-3">
          {getLevels().map(level => (
            <div 
              key={level}
              className={`card ${level === activeLevel ? 'border-primary' : ''}`}
              onDragOver={(e) => handleDragOver(e)}
              onDrop={(e) => handleDrop(e, level)}
              onClick={() => onActiveLevelChange(level)}
            >
              <div className="card-header d-flex justify-content-between align-items-center">
                <h4 className="h6 mb-0">Level {level}</h4>
                <span className="badge bg-success">{getJobsByLevel(level).length} jobs</span>
              </div>
              
              <div className="card-body">
                <div className="d-flex flex-column gap-2">
                  {getJobsByLevel(level).map(job => (
                    <div 
                      key={job.id}
                      className={`card ${draggedJob === job.id ? 'opacity-50' : ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, job.id)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="card-body">
                        {job.type === 'factory' && job.recipe && (
                          <div>
                            <h5 className="h6 mb-2">
                              <i className="bi bi-gear me-2"></i>
                              {job.recipe.resourceId}
                            </h5>
                            <p className="small text-muted mb-2">Time: {formatTime(job.timeRequired)}</p>
                            <div className="row">
                              <div className="col-6">
                                <small className="text-muted d-block mb-1">Inputs:</small>
                                {job.inputResources?.map((input, idx) => (
                                  <span 
                                    key={idx} 
                                    className="badge bg-outline-primary me-1 mb-1 cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleResourceClick(input.resourceId, level);
                                    }}
                                  >
                                    {getResourceName(input.resourceId)}: {input.amount}
                                  </span>
                                ))}
                              </div>
                              <div className="col-6">
                                <small className="text-muted d-block mb-1">Outputs:</small>
                                {job.outputResources?.map((output, idx) => (
                                  <span key={idx} className="badge bg-success me-1 mb-1">
                                    {getResourceName(output.resourceId)}: {output.amount}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {job.type === 'destination' && job.destination && (
                          <div>
                            <h5 className="h6 mb-2">
                              <i className="bi bi-geo-alt me-2"></i>
                              {job.destination.id}
                            </h5>
                            <p className="small text-muted mb-1">Travel: {formatTime(job.timeRequired)}</p>
                            <p className="small text-muted mb-0">Resource: {getResourceName(job.destination.resourceId)}</p>
                          </div>
                        )}
                        
                        {job.type === 'delivery' && (
                          <div>
                            <h5 className="h6 mb-2">
                              <i className="bi bi-box me-2"></i>
                              Delivery
                            </h5>
                            <p className="small text-muted mb-1">Order: {job.orderName}</p>
                            <p className="small text-muted mb-0">
                              Remaining: {job.deliveryRemaining}/{job.deliveryAmount}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
