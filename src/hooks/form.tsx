import { createFormHook } from '@tanstack/react-form';
import { fieldContext, formContext, useFormContext } from './formContext';
import {
  TextField,
  NumberField,
  SelectField,
  RangeField,
  TimeRangeField,
  MultiSelectField,
} from '../components/ui/FormFields';

const SubscribeButton = ({ icon, label }: { icon: string; label: string }) => {
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
};

export const { useAppForm, withForm, withFieldGroup } = createFormHook({
  fieldComponents: {
    TextField,
    NumberField,
    SelectField,
    MultiSelectField,
    RangeField,
    TimeRangeField,
  },
  formComponents: {
    SubscribeButton,
  },
  fieldContext,
  formContext,
});
