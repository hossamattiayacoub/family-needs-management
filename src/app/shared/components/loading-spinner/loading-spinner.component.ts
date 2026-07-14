import { Component, inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  template: `
    @if (loadingService.isLoading()) {
      <div class="overlay">
        <mat-progress-spinner mode="indeterminate" diameter="56"></mat-progress-spinner>
      </div>
    }
  `,
  styles: [`
    .overlay {
      position: fixed;
      inset: 0;
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.55);
    }
  `]
})
export class LoadingSpinnerComponent {
  readonly loadingService = inject(LoadingService);
}
