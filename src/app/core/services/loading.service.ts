import { Injectable, signal, computed } from '@angular/core';

/**
 * Tracks the number of in-flight HTTP requests so the global
 * loading spinner can be shown/hidden automatically via the interceptor.
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly requestCount = signal(0);

  readonly isLoading = computed(() => this.requestCount() > 0);

  show(): void {
    this.requestCount.update((count) => count + 1);
  }

  hide(): void {
    this.requestCount.update((count) => Math.max(0, count - 1));
  }
}
