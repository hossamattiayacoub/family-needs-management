import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Need } from '../../core/models/need.model';

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
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'add' ? 'Add Need' : 'Edit Need' }}</h2>

    <form [formGroup]="form" (ngSubmit)="save()">
      <mat-dialog-content>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Need Name</mat-label>
          <input matInput formControlName="NeedName" required>
          @if (form.controls.NeedName.hasError('required')) {
            <mat-error>Need Name is required</mat-error>
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
    .full-width { width: 100%; min-width: 320px; }
  `]
})
export class NeedFormDialogComponent {
  readonly dialogRef = inject(MatDialogRef<NeedFormDialogComponent, Need>);
  readonly data: NeedDialogData = inject(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    NeedName: [this.data.need?.NeedName ?? '', Validators.required]
  });

  save(): void {
    if (this.form.invalid) return;

    const result: Need = {
      NeedId: this.data.need?.NeedId ?? 0,
      NeedName: this.form.controls.NeedName.value.trim()
    };
    this.dialogRef.close(result);
  }
}
