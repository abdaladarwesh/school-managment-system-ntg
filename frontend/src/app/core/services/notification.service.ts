import { inject, Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { TranslationService } from './translation.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly toastr = inject(ToastrService);
  private readonly translationService = inject(TranslationService);

  /**
   * Helper to translate text using TranslationService
   */
  private translate(key: string): string {
    return this.translationService.translate(key);
  }

  // ==========================================
  // Base Toast Methods
  // ==========================================

  success(message: string, title?: string): void {
    this.toastr.success(
      this.translate(message),
      title ? this.translate(title) : this.translate('Success')
    );
  }

  error(message: string, title?: string): void {
    this.toastr.error(
      this.translate(message),
      title ? this.translate(title) : this.translate('Error')
    );
  }

  warning(message: string, title?: string): void {
    this.toastr.warning(
      this.translate(message),
      title ? this.translate(title) : this.translate('Warning')
    );
  }

  info(message: string, title?: string): void {
    this.toastr.info(
      this.translate(message),
      title ? this.translate(title) : this.translate('Info')
    );
  }

  // ==========================================
  // HTTP Success Status Handlers (200, 201, 204)
  // ==========================================

  handle200(message?: string): void {
    const msg = message || 'Your operation was successful!';
    this.success(msg, 'Success');
  }

  handle201(message?: string): void {
    const msg = message || 'Resource created successfully!';
    this.success(msg, 'Success');
  }

  handle204(message?: string): void {
    const msg = message || 'Action completed successfully!';
    this.info(msg, 'Completed');
  }

  // ==========================================
  // HTTP Error Status Handlers (401, 403, 404, 500)
  // ==========================================

  handle401(message?: string): void {
    const msg = message || 'Your session has expired. Please log in again to continue.';
    this.warning(msg, 'Session Expired');
  }

  handle403(message?: string): void {
    const msg = message || 'You do not have permission to perform this action.';
    this.error(msg, 'Access Denied');
  }

  handle404(message?: string): void {
    const msg = message || 'The requested resource could not be found.';
    this.error(msg, 'Not Found');
  }

  handle500(message?: string): void {
    const msg = message || 'An unexpected error occurred on the server. Please try again later.';
    this.error(msg, 'Server Error');
  }

  /**
   * Generic router for handling any HTTP status code dynamically
   */
  handleHttpStatus(status: number, customMessage?: string): void {
    switch (status) {
      case 200:
        this.handle200(customMessage);
        break;
      case 201:
        this.handle201(customMessage);
        break;
      case 204:
        this.handle204(customMessage);
        break;
      case 401:
        this.handle401(customMessage);
        break;
      case 403:
        this.handle403(customMessage);
        break;
      case 404:
        this.handle404(customMessage);
        break;
      case 500:
        this.handle500(customMessage);
        break;
      case 0:
        this.error('Something went wrong with your request. Please check your internet connection.', 'Connection Error');
        break;
      default:
        if (status >= 200 && status < 300) {
          this.handle200(customMessage);
        } else {
          this.error(customMessage || 'An unexpected error occurred.', 'Error');
        }
        break;
    }
  }
}
