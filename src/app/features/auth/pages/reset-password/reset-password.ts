import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { CommonModule, isPlatformBrowser } from '@angular/common';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { PLATFORM_ID } from '@angular/core';

import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPassword {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],

    resetToken: ['', Validators.required],

    newPassword: ['', [Validators.required, Validators.minLength(8)]],
  });

  showPassword = false;

  error = signal('');
  success = signal('');
  loading = signal(false);

  submitted = false;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const email = sessionStorage.getItem('resetEmail') ?? '';

      const token = sessionStorage.getItem('resetToken') ?? '';

      this.form.patchValue({
        email: email,
        resetToken: token,
      });
    }
  }

  resetPassword(): void {
    this.submitted = true;

    this.error.set('');
    this.success.set('');

    if (this.form.invalid) {
      return;
    }

    this.loading.set(true);

    const request = this.form.getRawValue();

    this.auth.resetPassword(request).subscribe({
      next: () => {
        this.loading.set(false);

        if (isPlatformBrowser(this.platformId)) {
          sessionStorage.removeItem('resetToken');

          sessionStorage.removeItem('resetEmail');
        }

        this.success.set('Password reset successfully. Redirecting to login...');

        setTimeout(() => {
          void this.router.navigate(['/login']);
        }, 1500);
      },

      error: (error: Error) => {
        this.loading.set(false);

        this.error.set(error.message);
      },
    });
  }
}
