import { number, object, string } from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Country,
  Order,
  PlanningLevel,
  Resource,
  Step,
  StepType,
  StoryOrder,
  Train,
  TrainClass,
} from './types';
import React from 'react';
import { destinations, resources, trains } from './data';
import { getBestTrains } from './trainUtils';

interface JobFormProps {
  id?: string;
  level: PlanningLevel;
  orders: Order[];
  onSubmit: (job: Step) => void;
}
const validationSchema = object().shape({
  type: string()
    .oneOf([
      StepType.Factory,
      StepType.Destination,
      StepType.Delivery,
      StepType.Submit,
    ])
    .required('Type is required'),
  resourceId: string().required('Resource ID is required'),
  levelId: number().required('Level ID is required'),
  trainId: string().when('type', {
    is: (val: string) =>
      val === StepType.Destination || val === StepType.Delivery,
    then: schema => schema.required('Train ID is required'),
    otherwise: schema => schema.notRequired(),
  }),
  recipe: object().when('type', {
    is: (val: string) => val === StepType.Factory,
    then: schema => schema.required('Recipe is required'),
    otherwise: schema => schema.notRequired(),
  }),
  destination: object().when('type', {
    is: (val: string) => val === StepType.Destination,
    then: schema => schema.required('Destination is required'),
    otherwise: schema => schema.notRequired(),
  }),
  order: object().when('type', {
    is: (val: string) => val === StepType.Delivery || val === StepType.Submit,
    then: schema => schema.required('Order is required'),
    otherwise: schema => schema.notRequired(),
  }),
});

export const JobForm: React.FC<JobFormProps> = ({
  id,
  level,
  orders,
  onSubmit,
}) => {
  const isAddMode = !id;

  // form validation rules

  // functions to build form returned by useForm() hook
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  function getTrains() {
    var classes: TrainClass[] = [];
    var countries: Country[] = [];
    var resource: Resource = resources[getValues('resourceId')];

    if (getValues('type') === StepType.Destination) {
      var dest = Object.values(destinations).find(
        d => d.resourceId == resource.id
      );
      classes = dest?.classes ?? [
        TrainClass.Common,
        TrainClass.Rare,
        TrainClass.Epic,
        TrainClass.Legendary,
      ];
      countries = [dest?.country ?? Country.Britain];
    }
    if (getValues('type') === StepType.Delivery) {
      var order = orders.find(o => o.id === getValues('order')) as StoryOrder;

      classes = order.classes ?? [
        TrainClass.Common,
        TrainClass.Rare,
        TrainClass.Epic,
        TrainClass.Legendary,
      ];
      countries = [order.country ?? Country.Britain];
    }

    return getBestTrains(level, 1, trains, classes, countries);
  }

  const handleFormSubmit = (data: any) => {
    const stepData = {
      id: id || `step-${Date.now()}`,
      type: data.type,
      resourceId: data.resourceId,
      levelId: data.levelId,
      ...(data.trainId && { trainId: data.trainId }),
      ...(data.recipe && { recipe: data.recipe }),
      ...(data.destination && { destination: data.destination }),
      ...(data.order && { order: data.order }),
    };
    onSubmit(stepData as Step);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <h1>{isAddMode ? 'Add User' : 'Edit Step'}</h1>
      <div className="form-row">
        <div className="form-group col">
          <label>Type</label>
          <select
            {...register('type')}
            className={`form-control ${errors.type ? 'is-invalid' : ''}`}
          >
            {Object.values(StepType).map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <div className="invalid-feedback">{errors.type?.message}</div>
        </div>
        <div className="form-group col-5">
          <label>Resource</label>
          <select
            {...register('resourceId')}
            className={`form-control ${errors.resourceId ? 'is-invalid' : ''}`}
          >
            <option value="">Select a resource...</option>
            {Object.values(resources).map(resource => (
              <option key={resource.id} value={resource.id}>
                {resource.name}
              </option>
            ))}
          </select>
          <div className="invalid-feedback">{errors.resourceId?.message}</div>
        </div>
      </div>
      {getValues('type') === StepType.Delivery && (
        <div className="form-row">
          <div className="form-group col">
            <label>Order</label>
            <select
              {...register('order')}
              className={`form-control ${errors.order ? 'is-invalid' : ''}`}
            >
              <option value="">Select an order...</option>
              {Object.values(orders).map(order => (
                <option key={order.id} value={order.id}>
                  {order.name}
                </option>
              ))}
            </select>
            <div className="invalid-feedback">{errors.order?.message}</div>
          </div>
        </div>
      )}
      {getValues('type') === StepType.Destination ||
        (getValues('type') === StepType.Delivery && (
          <div className="form-row">
            <div className="form-group col">
              <label>Train</label>
              <select
                {...register('trainId')}
                className={`form-control ${errors.trainId ? 'is-invalid' : ''}`}
              >
                <option value="">Select a train...</option>
                {getTrains().map((train: Train) => (
                  <option key={train.id} value={train.id}>
                    {train.name}
                  </option>
                ))}
              </select>
              <div className="invalid-feedback">{errors.trainId?.message}</div>
            </div>
          </div>
        ))}
      <div className="form-group">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary"
        >
          {isSubmitting && (
            <span className="spinner-border spinner-border-sm mr-1"></span>
          )}
          Save
        </button>
      </div>
    </form>
  );
};
