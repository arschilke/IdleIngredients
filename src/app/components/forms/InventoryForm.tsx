import { useAppForm } from '../../hooks/form';
import { Resource } from '../../types';

interface InventoryFormProps {
  initialInventory: Map<string, number>;
  resources: Record<string, Resource>;
  onInitialInventoryChange: (inventory: Map<string, number>) => void;
  onClose: () => void;
}
export const InventoryForm = ({
  initialInventory,
  onInitialInventoryChange,
  onClose,
  resources,
}: InventoryFormProps) => {
  const initialInventoryArray = Array.from(initialInventory.entries());
  const form = useAppForm({
    defaultValues: {
      inventory: initialInventoryArray,
    },
    onSubmit: ({ value }) => {
      onInitialInventoryChange(new Map(value.inventory));
      onClose();
    },
  });

  return (
    <div className="card h-100 d-flex flex-column">
      <div className="card-header">
        <h5 className="mb-0">
          <i className="bi bi-plus-circle me-2"></i>
          Edit Initial Inventory
        </h5>
        <button
          className="btn btn-close"
          onClick={() => {
            form.reset();
            onClose();
          }}
        ></button>
      </div>
      <div className="card-body flex-grow-1 overflow-auto">
        <form
          onSubmit={e => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <form.AppField name="inventory" mode="array">
            {field => (
              <div className="mb-1">
                {field.state.value.map(([resourceId], i) => (
                  <div key={i} className="row align-items-center">
                    <div className="col-2">
                      <img
                        src={`${resources[resourceId].icon}`}
                        alt={resources[resourceId].name}
                        className="img-fluid"
                      />
                    </div>
                    <span className="fw-medium col-5">
                      {resources[resourceId].name}
                    </span>
                    <div className="col-5">
                      <form.AppField
                        name={`inventory[${i}][1]`}
                        children={field => <field.NumberField label="Amount" />}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </form.AppField>
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            onClick={e => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};
