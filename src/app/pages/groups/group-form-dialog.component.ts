import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Group } from '../../core/models/group.model';

export interface GroupDialogData {
  mode: 'add' | 'edit';
  group?: Group;
}

@Component({
  selector: 'app-group-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'add' ? 'Add Group' : 'Edit Group' }}</h2>

    <form [formGroup]="form" (ngSubmit)="save()">
      <mat-dialog-content>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Group Name</mat-label>
          <input matInput formControlName="GroupName" required>
          @if (form.controls.GroupName.hasError('required')) {
            <mat-error>Group Name is required</mat-error>
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
export class GroupFormDialogComponent {
  readonly dialogRef = inject(MatDialogRef<GroupFormDialogComponent, Group>);
  readonly data: GroupDialogData = inject(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    GroupName: [this.data.group?.GroupName ?? '', Validators.required]
  });

  save(): void {
    if (this.form.invalid) return;

    const result: Group = {
      GroupId: this.data.group?.GroupId ?? 0,
      GroupName: this.form.controls.GroupName.value.trim()
    };
    this.dialogRef.close(result);
  }
}
