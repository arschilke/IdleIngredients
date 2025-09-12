import { useStore } from '@tanstack/react-form';
import { useFieldContext, useFormContext } from '../../hooks/formContext';
import { formatTime } from '../../utils';

export function TextField({ label }: { label: string }) {
  const field = useFieldContext<string>();

  const errors = useStore(field.store, state => state.meta.errors);

  return (
    <div className="mb-1">
      <label className="form-label">{label}</label>
      <input
        className="form-control"
        value={field.state.value}
        onChange={e => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
      />
      {errors.map((error: string) => (
        <div key={error} style={{ color: 'red' }}>
          {error}
        </div>
      ))}
    </div>
  );
}

export function NumberField({ label }: { label: string }) {
  const field = useFieldContext<number>();

  const errors = useStore(field.store, state => state.meta.errors);

  return (
    <div className="mb-1">
      <label className="form-label">{label}</label>
      <input
        type="number"
        className="form-control"
        value={field.state.value}
        onChange={e => field.handleChange(Number(e.target.value))}
        onBlur={field.handleBlur}
      />
      {errors.map((error: string) => (
        <div key={error} style={{ color: 'red' }}>
          {error}
        </div>
      ))}
    </div>
  );
}

export function SelectField<T extends { id: string; name: string }>({
  label,
  options,
  multiple,
}: {
  label: string;
  options: T[];
  multiple?: boolean;
}) {
  const field = useFieldContext<string>();

  const errors = useStore(field.store, state => state.meta.errors);

  return (
    <div className="mb-1">
      <label className="form-label">{label}</label>
      <select
        multiple={multiple}
        className="form-control"
        value={field.state.value}
        onChange={e => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
      >
        {options.map(option => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
      {errors.map((error: string) => (
        <div key={error} style={{ color: 'red' }}>
          {error}
        </div>
      ))}
    </div>
  );
}

export function SubscribeButton({
  icon,
  label,
}: {
  icon: string;
  label: string;
}) {
  const form = useFormContext();
  return (
    <form.Subscribe selector={state => state.isSubmitting}>
      {isSubmitting => (
        <button disabled={isSubmitting} className="btn btn-primary">
          <i className={'bi ' + icon}></i> {label}
        </button>
      )}
    </form.Subscribe>
  );
}

export function RangeField({
  label,
  min,
  max,
  step,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
}) {
  const field = useFieldContext<number>();
  const errors = useStore(field.store, state => state.meta.errors);
  return (
    <div className="mb-1">
      <label className="form-label">{label}</label>
      <input
        type="range"
        className="form-control"
        value={field.state.value}
        min={min}
        max={max}
        step={step}
        onChange={e => field.handleChange(Number(e.target.value))}
        onBlur={field.handleBlur}
      />
      {errors.map((error: string) => (
        <div key={error} style={{ color: 'red' }}>
          {error}
        </div>
      ))}
    </div>
  );
}

export function TimeRangeField({
  label,
  min,
  max,
  step,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
}) {
  const field = useFieldContext<number>();
  const errors = useStore(field.store, state => state.meta.errors);
  return (
    <div className="mb-1">
      <label htmlFor={field.name} className="form-label">
        {label}
      </label>
      <div className="d-flex align-items-center gap-2">
        <input
          id={field.name}
          type="range"
          className="form-range flex-grow-1"
          min={min}
          max={max}
          step={step}
          value={field.state.value}
          onChange={e => field.handleChange(Number(e.target.value))}
          onBlur={field.handleBlur}
        />
        <span className="badge bg-info">{formatTime(field.state.value)}</span>
      </div>
      {errors.map((error: string) => (
        <div key={error} style={{ color: 'red' }}>
          {error}
        </div>
      ))}
    </div>
  );
}
