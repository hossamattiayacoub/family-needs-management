import { Component, EventEmitter, Output } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, MatButtonModule],
  template: `
    <mat-toolbar color="primary" class="toolbar">
      <button mat-icon-button (click)="menuToggle.emit()" aria-label="Toggle navigation">
        <mat-icon>menu</mat-icon>
      </button>
      <mat-icon class="brand-icon">diversity_3</mat-icon>
      <span class="title">Family Needs Management</span>
    </mat-toolbar>
  `,
  styles: [`
    .toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      gap: 8px;
    }
    .brand-icon {
      margin-left: 4px;
    }
    .title {
      font-size: 18px;
      font-weight: 500;
    }
  `]
})
export class ToolbarComponent {
  @Output() menuToggle = new EventEmitter<void>();
}
