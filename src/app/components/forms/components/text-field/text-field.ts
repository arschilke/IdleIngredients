import { Component, input } from '@angular/core';
import { injectField } from '@tanstack/angular-form';
@Component({
  selector: 'app-text-field',
  templateUrl: './text-field.html',
  styleUrl: './text-field.scss',
})
export class TextField {
  label = input.required<string>();
  // This API requires another part to it from the parent component
  field = injectField<string>();
}
