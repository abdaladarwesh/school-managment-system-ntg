import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../pages/login/service/auth-service';
import { NotificationService } from '../services/notification.service';

export const studentAffairsGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  if (authService.role == 'STUDENT_AFFAIRS') {
    return true;
  }

  notificationService.handle403('You dont have permission to go to this page');

  const previousUrl = router.getCurrentNavigation()?.previousNavigation?.extractedUrl?.toString();
  if (previousUrl) {
    router.navigateByUrl(previousUrl);
  } else {
    router.navigate(['/login']);
  }
  return false;
};
