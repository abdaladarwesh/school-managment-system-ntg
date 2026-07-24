import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  // Show loading overlay
  loadingService.show();

  return next(req).pipe(
    finalize(() => {
      // Hide loading overlay when request completes or errors
      loadingService.hide();
    })
  );
};
