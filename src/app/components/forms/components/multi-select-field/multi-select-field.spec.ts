import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiSelectField } from './multi-select-field';

describe('MultiSelectField', () => {
  let component: MultiSelectField;
  let fixture: ComponentFixture<MultiSelectField>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiSelectField]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultiSelectField);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
