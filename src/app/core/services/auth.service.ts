import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { AuthenticatedUser } from '../models/user.model';
import { LoginRequest } from '../../features/auth/models/login-request.model';
import { SignupRequest } from '../../features/auth/models/signup-request.model';
import { API_ENDPOINTS } from '../config/api.config';
import { StorageService } from './storage.service';
import { ApiError } from '../models/api-error.model';

interface AuthResponse {
  token: string;
  user: AuthenticatedUser;
}

export interface ResetPasswordRequest {
  email: string;
  resetToken: string;
  newPassword: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storage = inject(StorageService);
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly currentUserKey = 'fundoo_current_user';

  readonly currentUser = signal<AuthenticatedUser | null>(
    this.storage.get<AuthenticatedUser | null>(this.currentUserKey, null)
  );

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.currentUser.set(
        this.storage.get<AuthenticatedUser | null>(this.currentUserKey, null)
      );
    }
  }

  register(user: Omit<SignupRequest, 'confirmPassword'>): Observable<void> {
    return this.http.post<{ message: string }>(API_ENDPOINTS.auth.register, user).pipe(
      map(() => void 0),
      catchError(error => this.handleApiError(error))
    );
  }

  login(request: LoginRequest): Observable<void> {
    return this.http.post<AuthResponse>(API_ENDPOINTS.auth.login, request).pipe(
      map(response => {
        this.storage.set('fundoo_token', response.token);
        this.storage.set(this.currentUserKey, response.user);
        this.currentUser.set(response.user);
      }),
      catchError(error => this.handleApiError(error))
    );
  }

  logout(): void {
    const token = this.storage.get<string | null>('fundoo_token', null);

    const clearLocalSession = () => {
      this.storage.remove('fundoo_token');
      this.storage.remove(this.currentUserKey);
      this.currentUser.set(null);
    };

    if (!token) {
      clearLocalSession();
      return;
    }

    this.http.post<void>(API_ENDPOINTS.auth.logout, {}).subscribe({
      next: clearLocalSession,
      error: clearLocalSession
    });
  }

  forgotPassword(email: string): Observable<string> {
    return this.http
      .post(API_ENDPOINTS.auth.forgotPassword, null, {
        params: { email },
        responseType: 'text'
      })
      .pipe(catchError(error => this.handleApiError(error)));
  }

  resetPassword(request: ResetPasswordRequest): Observable<void> {
    return this.http
      .post(API_ENDPOINTS.auth.resetPassword, request, { responseType: 'text' })
      .pipe(
        map(() => void 0),
        catchError(error => this.handleApiError(error))
      );
  }

  getCurrentUser(): AuthenticatedUser | null {
    return this.currentUser();
  }

  isLoggedIn(): boolean {
    return Boolean(
      this.storage.get<string | null>('fundoo_token', null) &&
      this.currentUser()
    );
  }

  private handleApiError(error: unknown): Observable<never> {
    let message = 'Unable to contact the server. Please try again.';

    if (error instanceof HttpErrorResponse) {
      const body = error.error as ApiError | string | null | undefined;
      if (typeof body === 'string' && body.trim()) {
        message = body;
      } else if (body && typeof body === 'object' && typeof body.message === 'string') {
        message = body.message;
      } else if (error.status === 0) {
        message = 'Cannot connect to the backend. Make sure Spring Boot is running on http://localhost:8080.';
      } else if (error.status === 401) {
        message = 'Unauthorized. Please log in again.';
      } else if (error.status === 403) {
        message = 'Access denied by the backend.';
      } else if (error.status === 404) {
        message = `Backend endpoint not found: ${error.url ?? 'unknown URL'}`;
      } else if (error.status >= 500) {
        message = 'The backend returned an internal server error. Check the Spring Boot console.';
      }
    } else if (error instanceof Error) {
      message = error.message;
    }

    return throwError(() => new Error(message));
  }
}

export { AuthService as Auth };
