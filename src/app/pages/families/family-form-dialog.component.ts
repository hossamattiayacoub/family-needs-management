import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { GroupService } from '../../core/services/group.service';
import { Group } from '../../core/models/group.model';
import { Family } from '../../core/models/family.model';
import {
  SearchableSelectComponent,
  SearchableSelectOption
} from '../../shared/components/searchable-select/searchable-select.component';

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
    MatButtonModule,
    MatProgressSpinnerModule,
    SearchableSelectComponent
  ],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'add' ? 'Add Family' : 'Edit Family' }}</h2>

    @if (loadingOptions()) {
      <mat-dialog-content class="loading-content">
        <mat-progress-spinner mode="indeterminate" diameter="40"></mat-progress-spinner>
      </mat-dialog-content>
    } @else {
      <form [formGroup]="form" (ngSubmit)="save()">
        <mat-dialog-content>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Family Name</mat-label>
            <input matInput formControlName="FamilyName" required>
            @if (form.controls.FamilyName.hasError('required')) {
              <mat-error>Family Name is required</mat-error>
            }
          </mat-form-field>

          <app-searchable-select
            formControlName="GroupId"
            label="Group"
            placeholder="Type to search group..."
            [options]="groupOptions()"
            [invalid]="form.controls.GroupId.hasError('required')"
            errorText="Group is required">
          </app-searchable-select>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Mobile No 1</mat-label>
            <input matInput formControlName="MobileNo1">
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Mobile No 2</mat-label>
            <input matInput formControlName="MobileNo2">
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Address</mat-label>
            <input matInput formControlName="Address">
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Location</mat-label>
            <input matInput formControlName="Location">
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Notes</mat-label>
            <textarea matInput formControlName="Notes" rows="3"></textarea>
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
export class FamilyFormDialogComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<FamilyFormDialogComponent, Family>);
  readonly data: FamilyDialogData = inject(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);
  private readonly groupService = inject(GroupService);

  readonly groups = signal<Group[]>([]);
  readonly loadingOptions = signal(true);

  readonly groupOptions = computed<SearchableSelectOption[]>(() =>
    this.groups().map((g) => ({ id: g.GroupId, label: g.GroupName }))
  );

  readonly form = this.fb.group({
    FamilyName: this.fb.nonNullable.control<string>(this.data.family?.FamilyName ?? '', Validators.required),
    GroupId: this.fb.control<number | null>(this.data.family?.GroupId ?? null, Validators.required),
    MobileNo1: this.fb.nonNullable.control<string>(this.data.family?.MobileNo1 ?? ''),
    MobileNo2: this.fb.nonNullable.control<string>(this.data.family?.MobileNo2 ?? ''),
    Address: this.fb.nonNullable.control<string>(this.data.family?.Address ?? ''),
    Location: this.fb.nonNullable.control<string>(this.data.family?.Location ?? ''),
    Notes: this.fb.nonNullable.control<string>(this.data.family?.Notes ?? '')
  });

  ngOnInit(): void {
    this.groupService.getGroups().subscribe({
      next: (groups) => {
        this.groups.set(groups);
        this.loadingOptions.set(false);
      },
      error: () => this.loadingOptions.set(false)
    });
  }

  save(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();

    const result: Family = {
      FamilyId: this.data.family?.FamilyId ?? 0,
      FamilyName: value.FamilyName.trim(),
      GroupId: value.GroupId as number,
      MobileNo1: value.MobileNo1.trim(),
      MobileNo2: value.MobileNo2?.trim() ?? '',
      Address: value.Address.trim(),
      Location: value.Location.trim(),
      Notes: value.Notes.trim()
    };
    this.dialogRef.close(result);
  }
}
