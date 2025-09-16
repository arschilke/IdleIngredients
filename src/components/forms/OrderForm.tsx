import { Order, OrderType, Resource, ResourceRequirement } from '../../types';
import { TrainClass, Country } from '../../types';
import { useAppForm } from '../../hooks/form';
import { ResourceRequirementFields } from './ResourceRequirementFields';
import { orderSchema } from '../../schemas';
import { generateId } from '../../utils';

interface OrderFormProps {
  resources: Record<string, Resource>;
  onSubmit: (order: Order) => void;
  onOrdersChange: (orders: Order[]) => void;
}

export const OrderForm = ({ resources, onSubmit }: OrderFormProps) => {
  const form = useAppForm({
    defaultValues: {
      id: generateId('order'),
      type: OrderType.Story,
      name: '',
      expirationTime: 0,
      travelTime: 0,
      classes: [] as TrainClass[],
      countries: [Country.Britain],
      resources: [{ resourceId: '', amount: 0 }],
    } as {
      id: string;
      type: OrderType;
      name: string;
      expirationTime?: number;
      travelTime?: number;
      classes?: TrainClass[];
      countries?: Country[];
      resources: ResourceRequirement[];
    },
    validators: {
      onSubmitAsync: orderSchema,
    },
    onSubmit: ({ value }) => {
      const formData = orderSchema.cast(value);
      const order = {
        ...formData,
        type: formData.type as OrderType,
        countries: formData.countries as Country[],
        classes: formData.classes as TrainClass[],
      };
      onSubmit(order as Order);
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
            name="type"
            children={field => (
              <field.SelectField
                label="Order Type"
                options={Object.values(OrderType).map(type => ({
                  id: type,
                  name: type.charAt(0).toUpperCase() + type.slice(1),
                }))}
              />
            )}
          />

          <form.AppField
            name="name"
            children={field => <field.TextField label="Order Name" />}
          />

          <form.Subscribe
            selector={state => state.values.type}
            children={type => (
              <>
                {type === OrderType.Boat && (
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

                {type === OrderType.Story && (
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
                        <field.MultiSelectField
                          label="Train Classes"
                          options={Object.values(TrainClass).map(
                            trainClass => ({
                              id: trainClass,
                              name:
                                trainClass.charAt(0).toUpperCase() +
                                trainClass.slice(1),
                            })
                          )}
                        />
                      )}
                    />
                    <form.AppField
                      name="countries"
                      children={field => (
                        <field.MultiSelectField
                          label="Countries"
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
                <label className="form-label" htmlFor="resources">
                  Resources Required:
                </label>
                {field.state.value.map((_, i) => (
                  <div key={i} className="d-flex gap-2 mb-2">
                    <ResourceRequirementFields
                      form={form}
                      fields={{
                        resourceId: `resources[${i}].resourceId`,
                        amount: `resources[${i}].amount`,
                      }}
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
              <button
                className="btn btn-primary"
                type="submit"
                disabled={!canSubmit}
              >
                {isSubmitting ? '...' : 'Create Order'}
              </button>
            )}
          />
        </form>
      </div>
    </div>
  );
};
