import { TrainClass, type Destination, Country } from '../../types';
import { type FormEvent, useState } from 'react';
import { generateId } from '../../utils';
import { useDestinations } from '../../hooks/useDestinations';
import { useResources } from '../../hooks/useResources';
import { useAppForm } from '../../hooks/form';

interface DestinationFormProps {
  destination?: Destination;
  onSubmit: (destination: Destination) => void;
  onClose: () => void;
}
export const DestinationForm: React.FC<DestinationFormProps> = ({
  destination,
  onSubmit,
  onClose,
}) => {
  const isAddMode = !destination;
  const { data: destinations = {} } = useDestinations();
  const { data: resources = {} } = useResources();

  const form = useAppForm({
    defaultValues: {
      name: destination?.name ?? '',
      resourceId: destination?.resourceId ?? '',
      travelTime: destination?.travelTime ?? 60,
      classes: destination?.classes ?? [
        TrainClass.Common,
        TrainClass.Rare,
        TrainClass.Epic,
        TrainClass.Legendary,
      ],
      country: destination?.country ?? Country.Britain,
    },
  });

  return (
    <div className="card mb-2">
      <div className="card-header">
        <h5 className="mb-0">
          <i className="bi bi-plus-circle me-2"></i>
          {isAddMode ? 'Add New Destination' : 'Edit Destination'}
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
            children={field => <field.TextField label="Name" />}
          />
          <form.AppField
            name="resourceId"
            children={field => (
              <field.SelectField
                label="Resource"
                options={Object.values(resources).map(resource => ({
                  id: resource.id,
                  name: resource.name,
                }))}
              />
            )}
          />
          <form.AppField
            name="travelTime"
            children={field => (
              <field.NumberField label="Travel Time (seconds)" />
            )}
          />
          <form.AppField
            name="classes"
            children={field => (
              <field.SelectField
                multiple
                label="Classes"
                options={Object.values(TrainClass).map(trainClass => ({
                  id: trainClass,
                  name:
                    trainClass.charAt(0).toUpperCase() + trainClass.slice(1),
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
                  name:
                    country.charAt(0).toUpperCase() + country.slice(1),
                }))}
              />
            )}
          />

          <div className="d-flex gap-2 mt-4">
            <form.SubscribeButton
              icon="bi-check-lg"
              label={isAddMode ? 'Add Destination' : 'Save Changes'}
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
