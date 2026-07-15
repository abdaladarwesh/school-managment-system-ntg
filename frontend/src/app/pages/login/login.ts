import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { AuthService } from './service/auth-service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { ViolationService } from '../violations/service/violation.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { TranslationService } from '../../core/services/translation.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule, TranslatePipe],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  private AuthService = inject(AuthService);
  private router = inject(Router);
  private translationService = inject(TranslationService);
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),

    password: new FormControl('', [Validators.required]),
  });

  private notificationService = inject(ViolationService);

  get currentLang() {
    return this.translationService.currentLang();
  }

  submit() {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.valid) {
      this.AuthService.authenticate({
        email: this.loginForm.value.email!,
        password: this.loginForm.value.password!,
      }).subscribe({
        next: (value) => {
          console.log(value);
          Swal.fire({
            title: this.translationService.translate('Done!'),
            text: this.translationService.translate('Your action has been completed successfully.'),
            icon: 'success',
            confirmButtonText: this.translationService.translate('OK'),
          });
          localStorage.setItem('token', value.token);
          localStorage.setItem('role', value.role);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error('Login error:', err);
        },
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
  private navigateByRole(role: string) {
    switch (role) {
      case 'STUDENT_AFFAIRS':
        this.router.navigate(['/dashboard']);
        break;

      default:
        this.router.navigate(['/']);
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

  // Closes the sidebar when a user clicks a link (only matters on mobile)
  closeSidebar() {
    if (window.innerWidth <= 768) {
      this.isSidebarOpen = false;
    }
  }
}
