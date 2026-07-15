import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { TranslationService } from '../services/translation.service';
import Swal from 'sweetalert2';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const translationService = inject(TranslationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isLoginRequest = req.url.includes('/api/v1/auth/login');

      // 401 Unauthorized handling (skip login endpoint to avoid redirect loop)
      if (error.status === 401 && !isLoginRequest) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');

        Swal.fire({
          title: translationService.translate('Your session expired'),
          text: translationService.translate('Please login again to continue using the application'),
          icon: 'warning',
          confirmButtonText: translationService.translate('Continue'),
        }).then(() => {
          router.navigate(['/login']);
        });
        return throwError(() => error);
      }

      // Handle translation of other standard errors
      let titleKey = 'Error!';
      let msgKey = 'Something went wrong. Please try again.';

      if (error.status === 0) {
        msgKey = 'Something went wrong with your request please check your internet.';
      } else if (isLoginRequest && error.status === 401) {
        titleKey = 'Login Failed';
        msgKey = 'The username or password you entered is incorrect. Please double-check your spelling and try again.';
      } else if (error.status === 403) {
        titleKey = 'Error!';
        msgKey = 'You do not have permission to perform this action.';
      } else if (error.status === 500) {
        msgKey = 'Unexpected error — please try again later';
      } else if (error.error && typeof error.error === 'string') {
        msgKey = error.error;
      } else if (error.error && error.error.message) {
        msgKey = error.error.message;
      }

      Swal.fire({
        title: translationService.translate(titleKey),
        text: translationService.translate(msgKey),
        icon: 'error',
        confirmButtonText: translationService.translate('Try again'),
      });

      return throwError(() => error);
    })
  );
};
