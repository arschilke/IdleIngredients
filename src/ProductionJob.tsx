import React, { useState } from 'react';
import {
  Factory,
  DestinationStep,
  Resource,
  Train,
  Step,
  FactoryStep,
  SubmitStep,
  DeliveryStep,
  ResourceRequirement,
} from './types';
import { formatTime } from './utils';
import { inputAmounts, outputAmount } from './data';
import { JobForm } from './JobForm';

interface ProductionJobProps {
  job: Step;
  resources: Record<string, Resource>;
  factories: Record<string, Factory>;
  trains: Record<string, Train>;
  maxConcurrentTrains: number;
  onJobUpdate: (updatedJob: Step) => void;
  onRemoveJob: (stepId: string) => void;
  onMoveToLevel?: (jobId: string, targetLevel: number) => void;
  createResourceJob: (requirement: ResourceRequirement) => void;
}

export const ProductionJob: React.FC<ProductionJobProps> = ({
  job,
  resources,
  factories,
  trains,
  onJobUpdate,
  onRemoveJob,
  createResourceJob,
}) => {
  const [editingJob, setEditingJob] = useState<boolean>(false);
  const [editingJobData, setEditingJobData] = useState<Partial<Step>>({});

  const startEditingJob = () => {
    setEditingJob(true);
    setEditingJobData({
      type: job.type,
      trainId:
        job.type === 'destination' || job.type === 'delivery'
          ? job.trainId
          : undefined,
      recipe: job.type === 'factory' ? job.recipe : undefined,
      destination: job.type === 'destination' ? job.destination : undefined,
    });
  };

  const saveJobEdit = () => {
    const updatedJob = {
      ...job,
      ...editingJobData,
    };

    onJobUpdate(updatedJob as Step);
    setEditingJob(false);
    setEditingJobData({});
  };

  const cancelJobEdit = () => {
    setEditingJob(false);
    setEditingJobData({});
  };

  const renderJobEditForm = () => {
    if (!editingJob) return null;

    return (
      <JobForm
        id={job.id}
        level={level}
        resources={resources}
        factories={factories}
        orders={orders}
        trains={trains}
        onJobUpdate={onJobUpdate}
        onRemoveJob={onRemoveJob}
        createResourceJob={createResourceJob}
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
              {(job.type === 'delivery' && job.order?.name) ||
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
          {'recipe' in job && job.recipe && (
            <div>
              <small className="text-muted d-block">Recipe:</small>
              <div className="d-flex flex-wrap gap-1 mb-2">
                {job.recipe.requires.map((req, index) => (
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
                Output: {outputAmount(job)}{' '}
                {resources[job.recipe.resourceId].name}
              </small>
            </div>
          )}
          {'order' in job && job.order && (
            <div>
              <small className="text-muted d-block">Resources:</small>
              <div className="d-flex flex-wrap gap-1 mb-2">
                {job.order?.resources.map((req, index) => (
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
          {'destination' in job && job.destination && (
            <div>
              <small className="text-muted">
                Travel time: {formatTime(job.destination.travelTime)}
              </small>
            </div>
          )}

          {/* Time and Amount */}
          {job.type == 'delivery' && (
            <div className="text-end">
              <div className="text-muted small">
                {formatTime(job.order?.travelTime || 0)}
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
