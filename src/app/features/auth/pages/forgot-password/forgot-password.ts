import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPassword {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  error = signal('');
  success = signal('');
  loading = signal(false);

  submitted = false;

  forgotPassword(): void {
    this.submitted = true;
    this.error.set('');
    this.success.set('');

    if (this.form.invalid) {
      return;
    }

    this.loading.set(true);

    const email = this.form.getRawValue().email.trim();

    this.auth.forgotPassword(email).subscribe({
      next: (resetToken: string) => {
        this.loading.set(false);

        // Store the reset token temporarily.
        sessionStorage.setItem('resetToken', resetToken);

        // Store the email temporarily as well.
        sessionStorage.setItem('resetEmail', email);

        // Navigate without exposing token/email in URL.
        void this.router.navigate(['/reset-password']);
      },

      error: (error: Error) => {
        this.loading.set(false);
        this.error.set(error.message);
      },
    });
  }
}
