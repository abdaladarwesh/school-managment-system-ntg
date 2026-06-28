import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthService } from './service/auth-service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  private AuthService = inject(AuthService);
  private router = inject(Router);
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),

    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });
  submit() {
    if (this.loginForm.valid) {
      this.AuthService.authenticate({
        email: this.loginForm.value.email!,
        password: this.loginForm.value.password!,
      }).subscribe({
        next(value) {
          console.log(value);
          Swal.fire({
            title: 'Done!',
            text: 'Your action has been completed successfully.',
            icon: 'success',
            confirmButtonText: 'OK',
          });
        },
        error(err) {
          if (err.status == 401){
            Swal.fire({
              title: 'Login Failed',
              text: 'The username or password you entered is incorrect. Please double-check your spelling and try again.',
              icon: 'error',
              confirmButtonText: 'Try again',
            });
          }
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
}
