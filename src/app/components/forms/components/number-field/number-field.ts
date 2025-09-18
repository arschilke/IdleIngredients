import { Component, input } from '@angular/core';
import { injectField } from '@tanstack/angular-form';

@Component({
  selector: 'app-number-field',
  templateUrl: './number-field.html',
  styleUrl: './number-field.scss'
})
export class NumberField {
  label = input.required<string>();
  // This API requires another part to it from the parent component
  field = injectField<number>();

}
