import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isLoginRequest = req.url.includes('/api/v1/auth/login');

      // Extract custom error message from backend payload if available
      let customErrorMessage: string | undefined;
      if (error.error) {
        if (typeof error.error === 'string') {
          customErrorMessage = error.error;
        } else if (error.error.message && typeof error.error.message === 'string') {
          customErrorMessage = error.error.message;
        }
      }

      // Handle 401 Unauthorized globally (skip login endpoint to avoid infinite redirect loop)
      if (error.status === 401 && !isLoginRequest) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');

        notificationService.handle401(customErrorMessage);
        router.navigate(['/login']);
        return throwError(() => error);
      }

      // Handle 403 Forbidden globally
      if (error.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');

        notificationService.handle403(customErrorMessage);
        router.navigate(['/login']);
        return throwError(() => error);
      }

      // Handle login endpoint failure explicitly
      if (isLoginRequest && error.status === 401) {
        notificationService.error(
          customErrorMessage || 'The username or password you entered is incorrect. Please try again.',
          'Login Failed'
        );
        return throwError(() => error);
      }

      // Delegate all other status codes (404, 500, network error status 0) to NotificationService
      notificationService.handleHttpStatus(error.status, customErrorMessage);

      return throwError(() => error);
    })
  );
};
