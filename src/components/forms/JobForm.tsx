import type { Order, PlanningLevel, Step, StoryOrder } from '../../types';
import { Country, StepType, TrainClass } from '../../types';
import React from 'react';
import { generateId } from '../../utils';
import { useDestinations } from '../../hooks/useDestinations';
import { useResources } from '../../hooks/useResources';
import { useTrains } from '../../hooks/useTrains';
import { getBestTrains } from '../../trains';
import { useAppForm } from '../../hooks/form';
import { stepSchema } from '../../schemas';

interface JobFormProps {
  job?: Step;
  level: PlanningLevel;
  orders: Order[];
  onSubmit: (job: Step) => void;
  onClose: () => void;
}
export const JobForm: React.FC<JobFormProps> = ({
  job,
  level,
  orders,
  onSubmit,
  onClose,
}) => {
  const isAddMode = !job;

  const { data: destinations = {} } = useDestinations();
  const { data: resources = {} } = useResources();

  const form = useAppForm({
    defaultValues: {
      id: job?.id ?? generateId('step'),
      type: job?.type ?? StepType.Factory,
      name: job?.name ?? '',
      resourceId: job?.resourceId ?? '',
      levelId: job?.levelId ?? 0,
      timeRequired: job?.timeRequired ?? 0,
      orderId: job && 'orderId' in job ? job.orderId : '',
      trainId: job && 'trainId' in job ? job.trainId : '',
    },
    validators: {
      onChange: stepSchema,
    },
    onSubmit: ({ value }) => {
      const result = stepSchema.cast(value) as Step;
      onSubmit(result);
    },
  });

  const getOrder = (orderId: string) => {
    return orders.find(o => o.id === orderId) as StoryOrder;
  };

  const { data: trains = {} } = useTrains();
  const getTrains = () => {
    let classes: TrainClass[] = [];
    let countries: Country[] = [];
    if (form.state.values.type === StepType.Destination) {
      const dest = Object.values(destinations).find(
        d => d.resourceId == form.state.values.resourceId
      );
      classes = dest?.classes ?? [
        TrainClass.Common,
        TrainClass.Rare,
        TrainClass.Epic,
        TrainClass.Legendary,
      ];
      countries = [dest?.country ?? Country.Britain];
    }
    if (form.state.values.type === StepType.Delivery) {
      const order = getOrder(form.state.values.orderId) as
        | StoryOrder
        | undefined;

      classes = order?.classes ?? [
        TrainClass.Common,
        TrainClass.Rare,
        TrainClass.Epic,
        TrainClass.Legendary,
      ];
      countries = order?.countries ?? [Country.Britain];
    }

    return getBestTrains(level, 1, trains, classes, countries);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">
          <i className="bi bi-plus-circle me-2"></i>
          {isAddMode ? 'Add New Step' : 'Edit Step'}
        </h5>
      </div>
      <div className="card-body">
        <form.AppForm>
          <form.AppField
            name="type"
            children={field => (
              <field.SelectField
                label="Step Type"
                options={Object.values(StepType).map(type => ({
                  id: type,
                  name: type.charAt(0).toUpperCase() + type.slice(1),
                }))}
              />
            )}
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
            name="levelId"
            children={field => <field.NumberField label="Level ID" />}
          />

          <form.AppField
            name="timeRequired"
            children={field => <field.NumberField label="Time Required" />}
          />

          <form.Subscribe
            selector={state => state.values.type}
            children={type => (
              <>
                {type === StepType.Delivery ||
                  (type === StepType.Submit && (
                    <form.AppField
                      name="orderId"
                      children={field => (
                        <field.SelectField
                          label="Order"
                          options={orders.map(order => ({
                            id: order.id,
                            name: order.name,
                          }))}
                        />
                      )}
                    />
                  ))}
                {type === StepType.Destination ||
                  (type === StepType.Delivery && (
                    <form.AppField
                      name="trainId"
                      children={field => (
                        <field.SelectField
                          label="Train"
                          options={getTrains().map(train => ({
                            id: train.id,
                            name: train.name,
                          }))}
                        />
                      )}
                    />
                  ))}
              </>
            )}
          />

          <div className="d-flex gap-2 mt-4">
            <form.SubscribeButton
              icon="bi-check-lg"
              label={isAddMode ? 'Add Step' : 'Save Changes'}
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
        </form.AppForm>
      </div>
    </div>
  );
};
