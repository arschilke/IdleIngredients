import { Component, input } from '@angular/core';
import { Step, StepType, Order, Train, Resource } from '../../../models/types';
import {
  injectForm,
  injectStore,
  revalidateLogic,
  TanStackAppField,
  TanStackField,
} from '@tanstack/angular-form';
import { stepSchema } from '../../../models/schemas';
import { DataService } from '../../../services/data.service';
import { map, Observable } from 'rxjs';
import { SelectField } from '../components/select-field/select-field';
import { NumberField } from '../components/number-field/number-field';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-job-form',
  imports: [TanStackAppField, TanStackField, SelectField, NumberField, AsyncPipe],
  templateUrl: './job-form.html',
  styleUrl: './job-form.scss',
})
export class JobForm {

  job = input<Step | undefined>();
  isAddMode = false;
  jobForm = injectForm({
    defaultValues: {
      ...(this.job() ?? {
        id: '',
        type: StepType.Factory as string,
        name: '',
        resourceId: '',
        levelId: 0,
        timeRequired: 0,
        orderId: '',
        trainId: '',
      }),
    } as {
      id: string;
      type: string;
      name: string;
      resourceId: string;
      levelId: number;
      timeRequired: number;
      orderId?: string;
      trainId?: string;
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: stepSchema,
    },
    onSubmit: ({ value }) => {
      const result = stepSchema.parse(value) as Step;
    },
  });

  resources$: Observable<{ id: string; name: string }[]>;
  orders$: Observable<{ id: string; name: string }[]>;
  trains$: Observable<{ id: string; name: string }[]>;

  constructor(private dataService: DataService) {
    this.resources$ = this.dataService.getResources().pipe(
      map((resources) =>
        Object.values(resources).map((resource) => ({
          id: resource.id,
          name: resource.name,
        }))
      )
    );
    this.orders$ = this.dataService.getOrders().pipe(
      map((orders) =>
        Object.values(orders).map((order) => ({
          id: order.id,
          name: order.name,
        }))
      )
    );
    this.trains$ = this.dataService.getTrains().pipe(
      map((trains) =>
        Object.values(trains).map((train) => ({
          id: train.id,
          name: train.name,
        }))
      )
    );
  }

  readonly stepTypes = Object.values(StepType).map((type) => ({
    id: type,
    name: type.charAt(0).toUpperCase() + type.slice(1),
  }));

  type = injectStore(this.jobForm, (state) => state.values.type);

  onClose() {
    this.jobForm.reset();
    //TODO: Close the form
  }
}
