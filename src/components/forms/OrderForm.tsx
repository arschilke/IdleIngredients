import { useState, type FormEvent } from 'react';
import type { Order, Resource, ResourceRequirement } from '../../types';
import { TrainClass, Country } from '../../types';
import { formatTime } from '../../utils';
import { useAppForm } from '../../hooks/form';
import { useStore } from '@tanstack/react-form';
import { ResourceRequirementFields } from './ResourceRequirementFields';

interface OrderFormProps {
  resources: Record<string, Resource>;
  onSubmit: (order: Order) => void;
  onOrdersChange: (orders: Order[]) => void;
}

export const OrderForm = ({ resources, onSubmit }: OrderFormProps) => {
  const form = useAppForm({
    defaultValues: {
      orderType: 'story',
      orderName: '',
      expirationTime: 3600 * 4,
      travelTime: 3600,
      resources: [{ resourceId: '', amount: 0, delivered: 0 }],
      classes: [
        TrainClass.Common,
        TrainClass.Rare,
        TrainClass.Epic,
        TrainClass.Legendary,
      ],
      country: Country.Britain,
    },
  });

  return (
    <div className="card">
      <div className="card-header py-2">
        <h3 className="h5 mb-0">Create New Order</h3>
      </div>
      <div className="card-body py-3">
        <form
          onSubmit={e => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <form.AppField
            name="orderType"
            children={field => (
              <field.SelectField
                label="Order Type"
                options={['boat', 'story', 'building'].map(type => ({
                  id: type,
                  name: type,
                }))}
              />
            )}
          />

          <form.AppField
            name="orderName"
            children={field => <field.TextField label="Order Name" />}
          />

          <form.Subscribe
            selector={state => state.values.orderType}
            children={orderType => (
              <>
                {orderType === 'boat' && (
                  <form.AppField
                    name="expirationTime"
                    children={field => (
                      <field.TimeRangeField
                        label="Boat Expiration Time"
                        min={3600}
                        max={36000}
                        step={1800}
                      />
                    )}
                  />
                )}

                {orderType === 'story' && (
                  <>
                    <form.AppField
                      name="travelTime"
                      children={field => (
                        <field.TimeRangeField
                          label="Travel Time"
                          min={30}
                          max={3600}
                          step={30}
                        />
                      )}
                    />
                    <form.AppField
                      name="classes"
                      children={field => (
                        <field.SelectField
                          label="Train Classes"
                          options={Object.values(TrainClass).map(
                            trainClass => ({
                              id: trainClass,
                              name:
                                trainClass.charAt(0).toUpperCase() +
                                trainClass.slice(1),
                            })
                          )}
                          multiple={true}
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
                              country.charAt(0).toUpperCase() +
                              country.slice(1),
                          }))}
                        />
                      )}
                    />
                  </>
                )}
              </>
            )}
          />

          <form.AppField name="resources" mode="array">
            {field => (
              <div className="mb-1">
                <label className="form-label">Resources Required:</label>
                {field.state.value.map((_, i) => (
                  <div key={i} className="d-flex gap-2 mb-2">
                    <ResourceRequirementFields
                      form={form}
                      fields={`resources[${i}]`}
                      resources={resources}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => field.removeValue(i)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    field.pushValue({ resourceId: '', amount: 0, delivered: 0 })
                  }
                  className="btn btn-outline-secondary btn-sm"
                >
                  <i className="bi bi-plus me-1"></i>
                  Add Resource
                </button>
              </div>
            )}
          </form.AppField>
          <form.Subscribe
            selector={state => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <button type="submit" disabled={!canSubmit}>
                {isSubmitting ? '...' : 'Create Order'}
              </button>
            )}
          />
        </form>
      </div>
    </div>
  );
};
