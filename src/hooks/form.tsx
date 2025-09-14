import { createFormHook } from '@tanstack/react-form';
import { fieldContext, formContext } from './formContext';
import {
  TextField,
  NumberField,
  SelectField,
  SubscribeButton,
  RangeField,
  TimeRangeField,
} from '../components/ui/FormFields';

export const { useAppForm, withForm, withFieldGroup } = createFormHook({
  fieldComponents: {
    TextField,
    NumberField,
    SelectField,
    RangeField,
    TimeRangeField,
  },
  formComponents: {
    SubscribeButton,
  },
  fieldContext,
  formContext,
});
