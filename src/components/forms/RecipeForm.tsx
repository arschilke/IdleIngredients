import type { Recipe } from '../../types';
import React from 'react';
import { useResources } from '../../hooks/useResources';
import { useAppForm } from '../../hooks/form';
import { recipeSchema } from '../../schemas';
import { ResourceRequirementFields } from './ResourceRequirementFields';

interface RecipeFormProps {
  recipe?: Recipe;
  factoryId?: string;
  onSubmit: (recipe: Recipe) => void;
  onClose: () => void;
}
export const RecipeForm: React.FC<RecipeFormProps> = ({
  recipe,
  factoryId,
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
      factoryId: recipe?.factoryId ?? factoryId,
      requires: recipe?.requires ?? [{ resourceId: '', amount: 0 }],
    },
    validators: {
      onDynamic: recipeSchema,
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
            name="factoryId"
            children={field => (
              <input type="hidden" name="factoryId" value={field.state.value} />
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

          <form.AppField name="requires" mode="array">
            {field => {
              return (
                <>
                  <div className="mb-1">
                    <label htmlFor="requirements">Requirements:</label>
                    {field.state.value.map((_, i) => {
                      return (
                        <div key={i} className="d-flex gap-2 mb-2">
                          <ResourceRequirementFields
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
                        </div>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      field.pushValue({
                        resourceId: '',
                        amount: 0,
                      })
                    }
                    className="btn btn-outline-secondary btn-sm"
                  >
                    <i className="bi bi-plus me-1"></i>
                    Add Requirement
                  </button>
                </>
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
            <form.Subscribe
              selector={state => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <>
                  <button type="submit" disabled={!canSubmit}>
                    {isSubmitting ? '...' : 'Submit'}
                  </button>
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
                </>
              )}
            />
          </div>
        </form>
      </div>
    </div>
  );
};
