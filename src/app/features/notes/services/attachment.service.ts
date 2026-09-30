import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { API_ENDPOINTS } from '../../../core/config/api.config';
import { AttachmentResponse } from '../models/attachment.model';

@Injectable({ providedIn: 'root' })
export class AttachmentService {
  private readonly http = inject(HttpClient);

  upload(noteId: number | string, file: File): Observable<AttachmentResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<AttachmentResponse>(API_ENDPOINTS.attachments.forNote(noteId), formData)
      .pipe(catchError(error => this.fail(error)));
  }

  getAll(noteId: number | string): Observable<AttachmentResponse[]> {
    return this.http.get<AttachmentResponse[]>(API_ENDPOINTS.attachments.forNote(noteId))
      .pipe(catchError(error => this.fail(error)));
  }

  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.attachments.byId(id))
      .pipe(catchError(error => this.fail(error)));
  }

  private fail(error: unknown): Observable<never> {
    return throwError(() => new Error(error?.toString() || 'Attachment request failed.'));
  }
}
