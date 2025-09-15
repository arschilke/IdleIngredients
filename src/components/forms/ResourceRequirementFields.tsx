import { withFieldGroup } from '../../hooks/form';
import { Resource } from '../../types';

export const ResourceRequirementFields = withFieldGroup({
  defaultValues: {
    resourceId: '',
    amount: 0,
  },
  props: {
    resources: {} as Record<string, Resource>,
  },
  render: function Render({ group, resources }) {
    return (
      <>
        <group.AppField
          name="resourceId"
          children={field => (
            <select
              id={field.name}
              className="form-select form-select-sm flex-grow-1"
              value={field.state.value}
              onChange={e => field.handleChange(e.target.value)}
              required
            >
              <option value="">Select resource</option>
              {Object.values(resources).map((r: Resource) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          )}
        />
        <group.AppField
          name="amount"
          children={field => (
            <input
              id={field.name}
              type="number"
              className="form-control form-control-sm form-shrink-1"
              min="1"
              value={field.state.value}
              onChange={e => field.handleChange(Number(e.target.value))}
              placeholder="Amount"
              required
            />
          )}
        />
      </>
    );
  },
});
