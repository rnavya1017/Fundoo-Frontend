import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password && confirmPassword && password !== confirmPassword ? { mismatch: true } : null;
}

@Component({
  selector: 'app-signup',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Signup {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/)]],
    confirmPassword: ['', Validators.required]
  }, { validators: passwordsMatch });
  showPassword = false;
  submitted = false;
  error = signal('');
  success = signal('');
  loading = signal(false);

  signup(): void {
    this.submitted = true;
    this.error.set('');
    this.success.set('');
    if (this.form.invalid) return;
    this.loading.set(true);
    const { firstName, lastName, email, password } = this.form.getRawValue();
    this.auth.register({ firstName, lastName, email, password }).subscribe({
      next: () => { this.loading.set(false); this.success.set('Account created successfully.'); void this.router.navigate(['/login']); },
      error: (error: Error) => { this.loading.set(false); this.error.set(error.message); }
    });
  }
}
