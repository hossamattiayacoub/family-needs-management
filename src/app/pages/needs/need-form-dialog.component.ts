import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { NeedCategoryService } from '../../core/services/need-category.service';
import { NeedCategory } from '../../core/models/need-category.model';
import { Need } from '../../core/models/need.model';
import {
  SearchableSelectComponent,
  SearchableSelectOption
} from '../../shared/components/searchable-select/searchable-select.component';

export interface NeedDialogData {
  mode: 'add' | 'edit';
  need?: Need;
}

@Component({
  selector: 'app-need-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    SearchableSelectComponent
  ],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'add' ? 'Add Need' : 'Edit Need' }}</h2>

    @if (loadingOptions()) {
      <mat-dialog-content class="loading-content">
        <mat-progress-spinner mode="indeterminate" diameter="40"></mat-progress-spinner>
      </mat-dialog-content>
    } @else {
      <form [formGroup]="form" (ngSubmit)="save()">
        <mat-dialog-content>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Need Name</mat-label>
            <input matInput formControlName="NeedName" required>
            @if (form.controls.NeedName.hasError('required')) {
              <mat-error>Need Name is required</mat-error>
            }
          </mat-form-field>

          <app-searchable-select
            formControlName="NeedCategoryId"
            label="Need Category"
            placeholder="Type to search category..."
            [options]="categoryOptions()"
            [invalid]="form.controls.NeedCategoryId.hasError('required')"
            errorText="Need Category is required">
          </app-searchable-select>
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
    mat-dialog-content { min-width: 0; }
    .loading-content { display: flex; justify-content: center; padding: 32px; }
  `]
})
export class NeedFormDialogComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<NeedFormDialogComponent, Need>);
  readonly data: NeedDialogData = inject(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);
  private readonly needCategoryService = inject(NeedCategoryService);

  readonly categories = signal<NeedCategory[]>([]);
  readonly loadingOptions = signal(true);

  readonly categoryOptions = computed<SearchableSelectOption[]>(() =>
    this.categories().map((c) => ({ id: c.NeedCategoryId, label: c.NeedCategoryName }))
  );

  readonly form = this.fb.group({
    NeedName: this.fb.nonNullable.control<string>(this.data.need?.NeedName ?? '', Validators.required),
    NeedCategoryId: this.fb.control<number | null>(this.data.need?.NeedCategoryId ?? null, Validators.required)
  });

  ngOnInit(): void {
    this.needCategoryService.getNeedCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.loadingOptions.set(false);
      },
      error: () => this.loadingOptions.set(false)
    });
  }

  save(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();

    const result: Need = {
      NeedId: this.data.need?.NeedId ?? 0,
      NeedName: value.NeedName.trim(),
      NeedCategoryId: value.NeedCategoryId as number
    };
    this.dialogRef.close(result);
  }
}
