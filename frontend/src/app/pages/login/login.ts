import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from './service/auth-service';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { TranslationService } from '../../core/services/translation.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, TranslatePipe],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  private readonly AuthService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly translationService = inject(TranslationService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  get currentLang() {
    return this.translationService.currentLang();
  }

  submit() {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.valid) {
      this.AuthService.authenticate({
        email: this.loginForm.value.email!,
        password: this.loginForm.value.password!,
      })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (value) => {
            this.notificationService.handle200('Your action has been completed successfully.');
            localStorage.setItem('token', value.token);
            this.router.navigate(['/dashboard']);
          },
          error: (err) => {
            console.error('Login error:', err);
          },
        });
    }
  }

  isEn(): boolean {
    return this.currentLang === 'en';
  }

  isAr(): boolean {
    return this.currentLang === 'ar';
  }

  toggleLanguage(lang: 'en' | 'ar'): void {
    this.translationService.setLanguage(lang);
  }

  isSidebarOpen = false;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    if (window.innerWidth <= 768) {
      this.isSidebarOpen = false;
    }
  }
}
