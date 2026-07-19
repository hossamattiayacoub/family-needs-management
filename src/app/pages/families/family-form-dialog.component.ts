import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Family } from '../../core/models/family.model';

export interface FamilyDialogData {
  mode: 'add' | 'edit';
  family?: Family;
}

@Component({
  selector: 'app-family-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'add' ? 'Add Family' : 'Edit Family' }}</h2>

    <form [formGroup]="form" (ngSubmit)="save()">
      <mat-dialog-content>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Family Name</mat-label>
          <input matInput formControlName="FamilyName" required>
          @if (form.controls.FamilyName.hasError('required')) {
            <mat-error>Family Name is required</mat-error>
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
    mat-dialog-content { min-width: 0; }
    @media (min-width: 480px) {
      .full-width { min-width: 300px; }
    }
  `]
})
export class FamilyFormDialogComponent {
  readonly dialogRef = inject(MatDialogRef<FamilyFormDialogComponent, Family>);
  readonly data: FamilyDialogData = inject(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    FamilyName: [this.data.family?.FamilyName ?? '', Validators.required]
  });

  save(): void {
    if (this.form.invalid) return;

    const result: Family = {
      FamilyId: this.data.family?.FamilyId ?? 0,
      FamilyName: this.form.controls.FamilyName.value.trim()
    };
    this.dialogRef.close(result);
  }
}
