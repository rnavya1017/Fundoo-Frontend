import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { API_ENDPOINTS } from '../../../core/config/api.config';
import { ReminderRequest, ReminderResponse } from '../models/reminder.model';

@Injectable({ providedIn: 'root' })
export class ReminderService {
  private readonly http = inject(HttpClient);

  create(noteId: number | string, request: ReminderRequest): Observable<ReminderResponse> {
    return this.http
      .post<ReminderResponse>(API_ENDPOINTS.reminders.forNote(noteId), request)
      .pipe(catchError((error) => this.fail(error)));
  }

  getAll(): Observable<ReminderResponse[]> {
    return this.http
      .get<ReminderResponse[]>(API_ENDPOINTS.reminders.base)
      .pipe(catchError((error) => this.fail(error)));
  }

  delete(id: number | string): Observable<void> {
    return this.http
      .delete<void>(API_ENDPOINTS.reminders.byId(id))
      .pipe(catchError((error) => this.fail(error)));
  }

  private fail(error: any): Observable<never> {
    const message =
      error?.error?.message || error?.error?.error || error?.message || 'Reminder request failed.';

    return throwError(() => new Error(message));
  }
}
