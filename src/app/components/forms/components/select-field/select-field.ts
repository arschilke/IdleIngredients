import { Component, input } from '@angular/core';
import { injectField } from '@tanstack/angular-form';
@Component({
  selector: 'app-select-field',
  templateUrl: './select-field.html',
  styleUrl: './select-field.scss',
})
export class SelectField {
  label = input.required<string>();
  options = input.required<{ id: string; name: string }[]>();  
  // This API requires another part to it from the parent component
  field = injectField<string>();
}
