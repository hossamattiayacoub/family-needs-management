import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';

import { FamilyService } from '../../core/services/family.service';
import { NeedService } from '../../core/services/need.service';
import { Family } from '../../core/models/family.model';
import { Need } from '../../core/models/need.model';
import {
  FamilyNeed,
  FamilyNeedFormValue,
  NEED_STATUS_VALUES,
  NeedStatus
} from '../../core/models/family-need.model';
import {
  SearchableSelectComponent,
  SearchableSelectOption
} from '../../shared/components/searchable-select/searchable-select.component';

export interface FamilyNeedDialogData {
  mode: 'add' | 'edit';
  familyNeed?: FamilyNeed;
}

@Component({
  selector: 'app-family-need-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    SearchableSelectComponent
  ],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'add' ? 'Add Family Need' : 'Edit Family Need' }}</h2>

    @if (loadingOptions()) {
      <mat-dialog-content class="loading-content">
        <mat-progress-spinner mode="indeterminate" diameter="40"></mat-progress-spinner>
      </mat-dialog-content>
    } @else {
      <form [formGroup]="form" (ngSubmit)="save()">
        <mat-dialog-content>
          <app-searchable-select
            formControlName="FamilyId"
            label="Family"
            placeholder="Type to search family..."
            [options]="familyOptions()"
            [invalid]="form.controls.FamilyId.hasError('required')"
            errorText="Family is required">
          </app-searchable-select>

          <app-searchable-select
            formControlName="NeedId"
            label="Need"
            placeholder="Type to search need..."
            [options]="needOptions()"
            [invalid]="form.controls.NeedId.hasError('required')"
            errorText="Need is required">
          </app-searchable-select>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Status</mat-label>
            <mat-select formControlName="Status" required>
              @for (status of statusValues; track status) {
                <mat-option [value]="status">{{ status }}</mat-option>
              }
            </mat-select>
            @if (form.controls.Status.hasError('required')) {
              <mat-error>Status is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>
              Order Date{{ form.controls.Status.value === 'Pending' ? ' *' : '' }}
            </mat-label>
            <input matInput [matDatepicker]="orderDatePicker" formControlName="OrderDate">
            <mat-hint>Required when Status is Pending</mat-hint>
            <mat-datepicker-toggle matIconSuffix [for]="orderDatePicker"></mat-datepicker-toggle>
            <mat-datepicker #orderDatePicker></mat-datepicker>
            @if (form.controls.OrderDate.hasError('required')) {
              <mat-error>Order Date is required when Status is Pending</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>
              Order Completion Date{{ form.controls.Status.value === 'Done' ? ' *' : '' }}
            </mat-label>
            <input matInput [matDatepicker]="completionDatePicker" formControlName="OrderCompletionDate">
            <mat-hint>Required when Status is Done</mat-hint>
            <mat-datepicker-toggle matIconSuffix [for]="completionDatePicker"></mat-datepicker-toggle>
            <mat-datepicker #completionDatePicker></mat-datepicker>
            @if (form.controls.OrderCompletionDate.hasError('required')) {
              <mat-error>Order Completion Date is required when Status is Done</mat-error>
            }
          </mat-form-field>
        </mat-dialog-content>

        <mat-dialog-actions align="end">
          <button mat-button type="button" (click)="dialogRef.close()">Cancel</button>
          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">
            Save
          </button>
        </mat-dialog-actions>
      </form>
    }
  `,
  styles: [`
    .full-width { width: 100%; min-width: 0; }
    @media (min-width: 480px) {
      .full-width { min-width: 300px; }
    }
    mat-dialog-content {
      min-width: 0;
      max-height: 65vh;
      overflow-y: auto;
    }
    .loading-content { display: flex; justify-content: center; padding: 32px; }
  `]
})
export class FamilyNeedFormDialogComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<FamilyNeedFormDialogComponent, FamilyNeedFormValue>);
  readonly data: FamilyNeedDialogData = inject(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);
  private readonly familyService = inject(FamilyService);
  private readonly needService = inject(NeedService);

  readonly statusValues = NEED_STATUS_VALUES;
  readonly families = signal<Family[]>([]);
  readonly needs = signal<Need[]>([]);
  readonly loadingOptions = signal(true);

  readonly familyOptions = computed<SearchableSelectOption[]>(() =>
    this.families().map((f) => ({ id: f.FamilyId, label: f.FamilyName }))
  );
  readonly needOptions = computed<SearchableSelectOption[]>(() =>
    this.needs().map((n) => ({ id: n.NeedId, label: n.NeedName }))
  );

  readonly form = this.fb.group({
    FamilyId: this.fb.control<number | null>(this.data.familyNeed?.FamilyId ?? null, Validators.required),
    NeedId: this.fb.control<number | null>(this.data.familyNeed?.NeedId ?? null, Validators.required),
    Status: this.fb.control<NeedStatus | null>(this.data.familyNeed?.Status ?? null, Validators.required),
    OrderDate: this.fb.control<Date | null>(this.toDateOrNull(this.data.familyNeed?.OrderDate)),
    OrderCompletionDate: this.fb.control<Date | null>(
      this.toDateOrNull(this.data.familyNeed?.OrderCompletionDate)
    )
  });

  ngOnInit(): void {
    forkJoin({
      families: this.familyService.getFamilies(),
      needs: this.needService.getNeeds()
    }).subscribe({
      next: ({ families, needs }) => {
        this.families.set(families);
        this.needs.set(needs);
        this.loadingOptions.set(false);
      },
      error: () => this.loadingOptions.set(false)
    });

    // Apply the initial required state, then keep it in sync as Status changes.
    this.updateDateValidators(this.form.controls.Status.value);
    this.form.controls.Status.valueChanges.subscribe((status) => this.updateDateValidators(status));
  }

  save(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();

    const result: FamilyNeedFormValue = {
      __row: this.data.familyNeed?.__row,
      FamilyId: value.FamilyId as number,
      NeedId: value.NeedId as number,
      Status: value.Status as NeedStatus,
      OrderDate: value.OrderDate,
      OrderCompletionDate: value.OrderCompletionDate
    };
    this.dialogRef.close(result);
  }

  private updateDateValidators(status: NeedStatus | null): void {
    const orderDateControl = this.form.controls.OrderDate;
    const completionDateControl = this.form.controls.OrderCompletionDate;

    orderDateControl.clearValidators();
    completionDateControl.clearValidators();

    if (status === 'Pending') {
      orderDateControl.setValidators([Validators.required]);
    } else if (status === 'Done') {
      completionDateControl.setValidators([Validators.required]);
    }

    orderDateControl.updateValueAndValidity({ emitEvent: false });
    completionDateControl.updateValueAndValidity({ emitEvent: false });
  }

  private toDateOrNull(value: string | Date | null | undefined): Date | null {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }
}
