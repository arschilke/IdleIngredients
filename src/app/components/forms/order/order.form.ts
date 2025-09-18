import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../../services/data.service';
import { map, Observable } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { generateId } from '../../../utils/utils';
import {
  Country,
  Resource,
  OrderType,
  ResourceRequirement,
  TrainClass,
  Order,
  ProductionPlan,
} from '../../../models/types';
import { orderSchema } from '../../../models/schemas';
import { SelectField } from '../components/select-field/select-field';
import { NumberField } from '../components/number-field/number-field';
import { MultiSelectField } from '../components/multi-select-field/multi-select-field';
import { TextField } from '../components/text-field/text-field';
import { StandardSchemaV1Issue, TanStackAppField, TanStackField, injectForm, injectStore } from '@tanstack/angular-form';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SelectField,
    TanStackAppField,
    TanStackField,
    NumberField,
    MultiSelectField,
    TextField,
    TanStackAppField,
  ],
  templateUrl: './order.form.html',
  styleUrls: ['./order.form.scss'],
})
export class OrderFormComponent {
  resources$: Observable<{ id: string; name: string }[]>;
  orders$: Observable<Order[]>;
  productionPlan$: Observable<ProductionPlan | null>;

  constructor(private dataService: DataService) {
    this.resources$ = this.dataService.getResources().pipe(
      map((resources) =>
        Object.values(resources).map((resource) => ({
          id: resource.id,
          name: resource.name,
        }))
      )
    );
    this.orders$ = this.dataService.getOrders();
    this.productionPlan$ = this.dataService.getProductionPlan();
  }

  orderForm = injectForm({
    defaultValues: {
      id: generateId('order'),
      type: OrderType.Story as string,
      name: '',
      expirationTime: 0,
      travelTime: 0,
      classes: Object.values(TrainClass),
      countries: Object.values(Country),
      resources: [{ resourceId: '', amount: 0 } as ResourceRequirement],
    } as {
      id: string;
      type: string;
      name: string;
      expirationTime?: number;
      travelTime?: number;
      classes?: string[];
      countries?: string[];
      resources: ResourceRequirement[];
    },
    validators: {
      onSubmitAsync: orderSchema,
    },
    onSubmit: ({ value }) => {
      const result = orderSchema.parse(value) as Order;
      this.dataService.addOrder(result);
    },
  });

  getRequirementResourceName = (index: number) => `resources[${index}].resourceId` as const;
  getRequirementAmountName = (index: number) => `resources[${index}].amount` as const;

  type = injectStore(this.orderForm, (state) => state.values.type);

  canSubmit = injectStore(this.orderForm, (state) => state.canSubmit);
  isSubmitting = injectStore(this.orderForm, (state) => state.isSubmitting);

  readonly orderTypes = Object.values(OrderType).map((type) => ({
    id: type,
    name: type.charAt(0).toUpperCase() + type.slice(1),
  }));

  readonly trainClasses = Object.values(TrainClass).map((trainClass) => ({
    id: trainClass,
    name: trainClass.charAt(0).toUpperCase() + trainClass.slice(1),
  }));

  readonly countries = Object.values(Country).map((country) => ({
    id: country,
    name: country.charAt(0).toUpperCase() + country.slice(1),
  }));

  handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    event.stopPropagation();

    this.orderForm.handleSubmit({
      onSuccess: () => {
        this.orderForm.reset();
      },
    });
  }

  getErrorMessage(error: Record<string, StandardSchemaV1Issue[]>) {
    return Object.values(error).flat().map((e) => e.message).join(', ');
  }
}
