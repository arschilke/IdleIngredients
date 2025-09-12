import type { Resource } from '../../types';
import React from 'react';
import { useAppForm } from '../../hooks/form';
import { resourceSchema } from '../../schemas';
import { generateId } from '../../utils';

interface ResourceFormProps {
  resource?: Resource;
  onSubmit: (resource: Resource) => void;
  onClose: () => void;
}
export const ResourceForm: React.FC<ResourceFormProps> = ({
  resource,
  onSubmit,
  onClose,
}) => {
  const isAddMode = !resource;

  const form = useAppForm({
    defaultValues: {
      name: resource?.name ?? '',
      icon: resource?.icon ?? '',
      id: resource?.id ?? generateId('resource'),
    },
    validators: {
      onChange: resourceSchema,
    },
    onSubmit: ({ value }) => {
      const result = resourceSchema.cast(value);
      onSubmit(result);
    },
  });

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">
          <i className="bi bi-plus-circle me-2"></i>
          {isAddMode ? 'Add New Resource' : 'Edit Resource'}
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
            name="id"
            children={field => (
              <input type="hidden" name="id" value={field.state.value} />
            )}
          />
          <form.AppField
            name="name"
            children={field => <field.TextField label="Name" />}
          />
          <form.AppField
            name="icon"
            children={field => <field.TextField label="Icon" />}
          />

          <div className="d-flex gap-2 mt-4">
            <form.SubscribeButton
              icon="bi-check-lg"
              label={isAddMode ? 'Add Resource' : 'Save Changes'}
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
