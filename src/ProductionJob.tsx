import React, { useState } from 'react';
import {
  Factory,
  Resource,
  Train,
  Step,
  ResourceRequirement,
  ProductionPlan,
  Order,
  Recipe,
  StoryOrder,
  Destination,
  StepType,
} from './types';
import { formatTime } from './utils';
import { inputAmounts, outputAmount } from './data';
import { JobForm } from './JobForm';

interface ProductionJobProps {
  job: Step;
  plan: ProductionPlan;
  orders: Order[];
  factories: Record<string, Factory>;
  resources: Record<string, Resource>;
  trains: Record<string, Train>;
  destinations: Record<string, Destination>;
  maxConcurrentTrains: number;
  onJobUpdate: (updatedJob: Step) => void;
  onRemoveJob: (stepId: string) => void;
  onMoveToLevel?: (jobId: string, targetLevel: number) => void;
  createResourceJob: (requirement: ResourceRequirement) => void;
}

export const ProductionJob: React.FC<ProductionJobProps> = ({
  job,
  resources,
  orders,
  plan,
  factories,
  trains,
  destinations,
  onJobUpdate,
  onRemoveJob,
  createResourceJob,
}) => {
  const [editingJob, setEditingJob] = useState<boolean>(false);

  const startEditingJob = () => {
    setEditingJob(true);
  };

  const saveJobEdit = (updatedJob: Step) => {
    onJobUpdate(updatedJob);
    setEditingJob(false);
  };

  const cancelJobEdit = () => {
    setEditingJob(false);
  };

  const renderJobEditForm = () => {
    if (!editingJob) return null;

    return (
      <JobForm
        job={job}
        level={plan.levels[job.levelId]}
        orders={orders}
        onSubmit={saveJobEdit}
        onClose={cancelJobEdit}
      />
    );
  };

  const renderJobDetails = () => {
    return (
      <div className="job-details">
        <div className="d-flex justify-content-between align-items-center gap-1">
          <div>
            <span className="badge bg-secondary ms-2">
              {job.type.toLocaleUpperCase()}
            </span>
            <strong className="ms-2">
              {(job.type === 'delivery' &&
                orders.find(o => o.id === job.orderId)?.name) ||
                resources[job.resourceId].name}
            </strong>

            {/* Train Assignment Display */}
            {'trainId' in job && job.trainId && (
              <span className="badge bg-info ms-2">
                <i className="bi bi-train-front"></i> {trains[job.trainId].name}
              </span>
            )}
          </div>

          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={startEditingJob}
            >
              <i className="bi bi-pencil"></i> Edit
            </button>
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={() => onRemoveJob(job.id)}
              title="Remove this job from the level"
            >
              <i className="bi bi-trash"></i> Remove
            </button>
          </div>
        </div>
        <div className="d-flex justify-content-between align-items-center gap-1 mt-2">
          {/* Recipe Information */}
          {(job.type === StepType.Factory &&
            (() => {
              const recipe = Object.values(factories)
                .flatMap((f: Factory) => f.recipes)
                .find((r: Recipe) => r.resourceId === job.resourceId);
              return (
                <div>
                  <small className="text-muted d-block">Recipe:</small>
                  <div className="d-flex flex-wrap gap-1 mb-2">
                    {recipe?.requires.map((req, index) => (
                      <button
                        key={index}
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => createResourceJob(req)}
                      >
                        {req.amount} {resources[req.resourceId].name}
                      </button>
                    ))}
                  </div>
                  <small className="text-muted">
                    Output: {outputAmount(job)} {resources[job.resourceId].name}
                  </small>
                </div>
              );
            })()) ||
            null}

          {job.type === StepType.Delivery && (
            <div>
              <small className="text-muted d-block">Resources:</small>
              <div className="d-flex flex-wrap gap-1 mb-2">
                {(
                  orders.find(o => o.id === job.orderId) as StoryOrder
                )?.resources.map((req, index) => (
                  <button
                    key={index}
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => createResourceJob(req)}
                  >
                    {resources[req.resourceId].name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Destination Information */}
          {job.type === StepType.Destination && (
            <div>
              <small className="text-muted">
                Travel time:{' '}
                {formatTime(
                  Object.values(destinations).find(
                    x => x.resourceId == job.resourceId
                  )?.travelTime || 0
                )}
              </small>
            </div>
          )}

          {/* Time and Amount */}
          {job.type === StepType.Delivery && job.orderId && (
            <div className="text-end">
              <div className="text-muted small">
                {formatTime(
                  (orders.find(o => o.id === job.orderId) as StoryOrder)
                    ?.travelTime || 0
                )}
              </div>
              <div className="text-muted small">
                Amount: {inputAmounts(job).get(job.resourceId) || 0}
              </div>
            </div>
          )}

          {job.type === 'submit' && (
            <div className="text-end">
              <div className="text-muted small">
                Amount: {outputAmount(job)}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="job-item">
      <div className="flex-grow-1">
        {renderJobDetails()}
        {renderJobEditForm()}
      </div>
    </div>
  );
};
