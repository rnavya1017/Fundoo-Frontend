import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { API_ENDPOINTS } from '../../../core/config/api.config';
import { LabelRequest, LabelResponse } from '../models/label.model';

@Injectable({ providedIn: 'root' })
export class LabelService {
  private readonly http = inject(HttpClient);

  create(request: LabelRequest): Observable<LabelResponse> {
    return this.http.post<LabelResponse>(API_ENDPOINTS.labels.base, request).pipe(catchError(error => this.fail(error)));
  }

  getAll(): Observable<LabelResponse[]> {
    return this.http.get<LabelResponse[]>(API_ENDPOINTS.labels.base).pipe(catchError(error => this.fail(error)));
  }

  update(id: number, request: LabelRequest): Observable<LabelResponse> {
    return this.http.put<LabelResponse>(API_ENDPOINTS.labels.byId(id), request).pipe(catchError(error => this.fail(error)));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.labels.byId(id)).pipe(catchError(error => this.fail(error)));
  }

  private fail(error: unknown): Observable<never> {
    return throwError(() => new Error(error?.toString() || 'Label request failed.'));
  }
}
