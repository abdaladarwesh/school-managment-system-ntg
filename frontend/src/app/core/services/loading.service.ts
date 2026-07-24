import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  /**
   * Tracks the number of active HTTP requests in progress
   */
  private readonly activeRequests = signal<number>(0);

  /**
   * Computed boolean signal indicating whether at least one HTTP request is active
   */
  readonly isLoading = computed(() => this.activeRequests() > 0);

  /**
   * Increments active request count
   */
  show(): void {
    this.activeRequests.update(count => count + 1);
  }

  /**
   * Decrements active request count, ensuring counter stays >= 0
   */
  hide(): void {
    this.activeRequests.update(count => Math.max(0, count - 1));
  }

  /**
   * Force resets loading state
   */
  reset(): void {
    this.activeRequests.set(0);
  }
}
