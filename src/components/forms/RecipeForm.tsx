import type { Recipe } from '../../types';
import React from 'react';
import { useResources } from '../../hooks/useResources';
import { useAppForm } from '../../hooks/form';
import { recipeSchema } from '../../schemas';
import { ResourceRequirementFields } from './ResourceRequirementFields';

interface RecipeFormProps {
  recipe?: Recipe;
  onSubmit: (recipe: Recipe) => void;
  onClose: () => void;
}
export const RecipeForm: React.FC<RecipeFormProps> = ({
  recipe,
  onSubmit,
  onClose,
}) => {
  const isAddMode = !recipe;
  const { data: resources = {} } = useResources();

  const form = useAppForm({
    defaultValues: {
      resourceId: recipe?.resourceId ?? '',
      timeRequired: recipe?.timeRequired ?? 0,
      outputAmount: recipe?.outputAmount ?? 0,
      requires: recipe?.requires ?? [{ resourceId: '', amount: 0 }],
    },
    validators: {
      onChange: recipeSchema,
    },
    onSubmit: ({ value }) => {
      const result = recipeSchema.cast(value);
      onSubmit(result);
    },
  });

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">
          <i className="bi bi-plus-circle me-2"></i>
          {isAddMode ? 'Add New Recipe' : 'Edit Recipe'}
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

          <form.AppField name="requires" mode="array">
            {field => {
              return (
                <div className="mb-1">
                  <label htmlFor="requirements">Requirements:</label>
                  {field.state.value.map((_, i) => {
                    return (
                      <>
                        <ResourceRequirementFields
                          key={i}
                          form={form}
                          fields={{
                            resourceId: `requires[${i}].resourceId`,
                            amount: `requires[${i}].amount`,
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
                      </>
                    );
                  })}
                </div>
              );
            }}
          </form.AppField>

          <form.AppField
            name="timeRequired"
            children={field => <field.NumberField label="Time Required" />}
          />

          <form.AppField
            name="outputAmount"
            children={field => <field.NumberField label="Output Amount" />}
          />

          <div className="d-flex gap-2 mt-4">
            <form.SubscribeButton
              icon="bi-check-lg"
              label={isAddMode ? 'Add Recipe' : 'Save Changes'}
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
