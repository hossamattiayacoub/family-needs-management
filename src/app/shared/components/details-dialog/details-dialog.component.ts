import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

export interface DetailField {
  label: string;
  value: string | null | undefined;
}

export interface DetailsDialogData {
  title: string;
  subtitle?: string;
  fields: DetailField[];
}

/**
 * Generic, reusable read-only "view details" dialog. Pass a title and a
 * flat list of { label, value } pairs to render; reused across any entity
 * (Family, Family Need, etc.) so no per-entity details component needs to
 * be duplicated. Empty/missing values render as an em-dash.
 */
@Component({
  selector: 'app-details-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatDividerModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>

    <mat-dialog-content>
      @if (data.subtitle) {
        <p class="subtitle">{{ data.subtitle }}</p>
      }
      <dl class="details-list">
        @for (field of data.fields; track field.label) {
          <div class="details-row">
            <dt>{{ field.label }}</dt>
            <dd>{{ field.value?.trim() ? field.value : '—' }}</dd>
          </div>
          @if (!$last) {
            <mat-divider></mat-divider>
          }
        }
      </dl>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-flat-button color="primary" (click)="dialogRef.close()">Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host { display: block; min-width: 280px; }
    @media (min-width: 480px) {
      :host { min-width: 380px; }
    }
    .subtitle {
      margin: -8px 0 12px;
      color: rgba(0, 0, 0, 0.6);
    }
    .details-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin: 0;
    }
    .details-row {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: 4px 0;
    }
    dt {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      color: rgba(0, 0, 0, 0.6);
    }
    dd {
      margin: 0;
      font-size: 15px;
      word-break: break-word;
      white-space: pre-wrap;
    }
  `]
})
export class DetailsDialogComponent {
  readonly dialogRef = inject(MatDialogRef<DetailsDialogComponent>);
  readonly data: DetailsDialogData = inject(MAT_DIALOG_DATA);
}
