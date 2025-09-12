import {
  Country,
  TrainClass,
  TrainEngine,
  type Resource,
  type Train,
} from '../../types';
import React, { type FormEvent, useState } from 'react';
import { generateId } from '../../utils';
import { useResources } from '../../hooks/useResources';
import { useAppForm } from '../../hooks/form';

interface TrainFormProps {
  train?: Train;
  onSubmit: (train: Train) => void;
  onClose: () => void;
}
export const TrainForm: React.FC<TrainFormProps> = ({
  train,
  onSubmit,
  onClose,
}) => {
  const isAddMode = !train;
  const { data: resources = {} } = useResources();

  const form = useAppForm({
    defaultValues: {
      name: train?.name ?? '',
      capacity: train?.capacity ?? 10,
      class: train?.class ?? TrainClass.Common,
      engine: train?.engine ?? TrainEngine.Steam,
      country: train?.country ?? Country.Britain,
    },
  });

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">
          <i className="bi bi-plus-circle me-2"></i>
          {isAddMode ? 'Add New Train' : 'Edit Train'}
        </h5>
      </div>
      <div className="card-body">
        <form
          onSubmit={e => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <form.AppField
            name="name"
            children={field => <field.TextField label="Train Name" />}
          />
          <form.AppField
            name="capacity"
            children={field => <field.NumberField label="Capacity" />}
          />
          <form.AppField
            name="class"
            children={field => (
              <field.SelectField
                label="Class"
                options={Object.values(TrainClass).map(trainClass => ({
                  id: trainClass,
                  name:
                    trainClass.charAt(0).toUpperCase() + trainClass.slice(1),
                }))}
              />
            )}
          />

          <form.AppField
            name="engine"
            children={field => (
              <field.SelectField
                label="Engine"
                options={Object.values(TrainEngine).map(engine => ({
                  id: engine,
                  name: engine.charAt(0).toUpperCase() + engine.slice(1),
                }))}
              />
            )}
          />

          <form.AppField
            name="country"
            children={field => (
              <field.SelectField
                label="Country"
                options={Object.values(Country).map(country => ({
                  id: country,
                  name: country.charAt(0).toUpperCase() + country.slice(1),
                }))}
              />
            )}
          />

          <div className="d-flex gap-2 mt-4">
            <form.SubscribeButton
              icon="bi-check-lg"
              label={isAddMode ? 'Add Train' : 'Save Changes'}
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => {
                onClose();
                form.reset();
              }}
            >
              <i className="bi bi-x-lg me-1"></i>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
