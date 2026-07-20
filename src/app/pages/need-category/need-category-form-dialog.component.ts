import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { NeedCategory } from '../../core/models/need-category.model';

export interface NeedCategoryDialogData {
  mode: 'add' | 'edit';
  needCategory?: NeedCategory;
}

@Component({
  selector: 'app-need-category-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'add' ? 'Add Need Category' : 'Edit Need Category' }}</h2>

    <form [formGroup]="form" (ngSubmit)="save()">
      <mat-dialog-content>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Need Category Name</mat-label>
          <input matInput formControlName="NeedCategoryName" required>
          @if (form.controls.NeedCategoryName.hasError('required')) {
            <mat-error>Need Category Name is required</mat-error>
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
  `,
  styles: [`
    .full-width { width: 100%; min-width: 0; }
    @media (min-width: 480px) {
      .full-width { min-width: 300px; }
    }
  `]
})
export class NeedCategoryFormDialogComponent {
  readonly dialogRef = inject(MatDialogRef<NeedCategoryFormDialogComponent, NeedCategory>);
  readonly data: NeedCategoryDialogData = inject(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    NeedCategoryName: [this.data.needCategory?.NeedCategoryName ?? '', Validators.required]
  });

  save(): void {
    if (this.form.invalid) return;

    const result: NeedCategory = {
      NeedCategoryId: this.data.needCategory?.NeedCategoryId ?? 0,
      NeedCategoryName: this.form.controls.NeedCategoryName.value.trim()
    };
    this.dialogRef.close(result);
  }
}
