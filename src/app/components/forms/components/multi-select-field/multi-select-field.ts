import { Component, input } from '@angular/core';
import { injectField } from '@tanstack/angular-form';

@Component({
  selector: 'app-multi-select-field',
  templateUrl: './multi-select-field.html',
  styleUrl: './multi-select-field.scss',
})
export class MultiSelectField {
  label = input.required<string>();
  options = input.required<{ id: string; name: string }[] | null>();

  // This API requires another part to it from the parent component
  field = injectField<string[]>();

  handleMultiSelectChange(event: Event): string[] {
    const target = event.target as HTMLSelectElement;
    return Array.from(target.selectedOptions).map(option => option.value);
  }
}
