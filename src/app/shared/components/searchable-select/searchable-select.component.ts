import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, FormControl, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent
} from '@angular/material/autocomplete';

export interface SearchableSelectOption {
  id: number;
  label: string;
}

/**
 * Reusable searchable dropdown, styled identically to the "Search by ..."
 * boxes on the Families/Needs grid pages (outline appearance + search icon
 * suffix), but wired as a proper Angular Forms control (ControlValueAccessor)
 * so it can be dropped in anywhere a <mat-select> is used today via
 * formControlName, with no change to surrounding validation/binding logic.
 *
 * Usage:
 *   <app-searchable-select
 *     formControlName="FamilyId"
 *     label="Family"
 *     [options]="familyOptions()"
 *     [invalid]="form.controls.FamilyId.hasError('required')"
 *     errorText="Family is required">
 *   </app-searchable-select>
 */
@Component({
  selector: 'app-searchable-select',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatAutocompleteModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchableSelectComponent),
      multi: true
    }
  ],
  template: `
    <mat-form-field appearance="outline" class="full-width">
      <mat-label>{{ label }}</mat-label>
      <input
        matInput
        type="text"
        [formControl]="searchControl"
        [matAutocomplete]="auto"
        [placeholder]="placeholder"
        (blur)="handleBlur()"
      >
      <mat-icon matSuffix>search</mat-icon>
      <mat-autocomplete
        #auto="matAutocomplete"
        [displayWith]="displayFn"
        (optionSelected)="onOptionSelected($event)">
        @for (option of filteredOptions(); track option.id) {
          <mat-option [value]="option.id">{{ option.label }}</mat-option>
        }
        @if (filteredOptions().length === 0) {
          <mat-option disabled>No matches found</mat-option>
        }
      </mat-autocomplete>
      @if (invalid) {
        <mat-error>{{ errorText }}</mat-error>
      }
    </mat-form-field>
  `,
  styles: [`
    .full-width { width: 100%; }
  `]
})
export class SearchableSelectComponent implements ControlValueAccessor, OnChanges {
  @Input() label = '';
  @Input() placeholder = 'Type to search...';
  @Input() options: SearchableSelectOption[] = [];
  @Input() invalid = false;
  @Input() errorText = 'This field is required';
  @Output() readonly selectionChange = new EventEmitter<number | null>();

  readonly searchControl = new FormControl<string | number | null>('');
  readonly filteredOptions = signal<SearchableSelectOption[]>([]);

  private onChange: (value: number | null) => void = () => {};
  private onTouched: () => void = () => {};
  private disabled = false;

  constructor() {
    this.searchControl.valueChanges.subscribe((value) => {
      const term = (typeof value === 'string' ? value : '').trim().toLowerCase();
      this.filteredOptions.set(
        term
          ? this.options.filter((option) => option.label.toLowerCase().includes(term))
          : this.options
      );
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options']) {
      this.filteredOptions.set(this.options);
    }
  }

  displayFn = (value: number | string | null): string => {
    if (value === null || value === undefined || value === '') return '';
    const match = this.options.find((option) => option.id === value);
    return match ? match.label : '';
  };

  onOptionSelected(event: MatAutocompleteSelectedEvent): void {
    const id = event.option.value as number;
    this.onChange(id);
    this.selectionChange.emit(id);
  }

  handleBlur(): void {
    this.onTouched();
  }

  // ---- ControlValueAccessor ----

  writeValue(value: number | null): void {
    this.searchControl.setValue(value, { emitEvent: false });
    this.filteredOptions.set(this.options);
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (isDisabled) {
      this.searchControl.disable();
    } else {
      this.searchControl.enable();
    }
  }
}
