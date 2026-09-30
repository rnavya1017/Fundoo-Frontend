import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { API_ENDPOINTS } from '../../../core/config/api.config';
import { BackendNoteResponse, Note } from '../models/note.model';
import { CreateNoteRequest } from '../models/create-note-request.model';
import { UpdateNoteRequest } from '../models/update-note-request.model';

@Injectable({ providedIn: 'root' })
export class NotesStore {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  readonly notes = signal<Note[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');

  constructor() {}

  getAll(): Observable<Note[]> {
    return this.http.get<BackendNoteResponse[]>(API_ENDPOINTS.notes.base).pipe(
      map((response) => {
        const notes = response.map((note) => this.mapNote(note));
        this.notes.set(notes);
        return notes;
      }),
      catchError((error) => this.fail(error)),
    );
  }

  refresh(): void {
    this.getAll().subscribe({
      next: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
  }

  create(
    title: string,
    content: string,
    reminderAt?: string,
    _reminderRepeat?: string,
    pinned = false,
    color?: string,
  ): Observable<Note> {
    const request: CreateNoteRequest = {
      title,
      description: content,
      color: color || undefined,
    };

    return this.http.post<BackendNoteResponse>(API_ENDPOINTS.notes.base, request).pipe(
      map((response) => this.mapNote(response)),

      map((note) => {
        this.notes.update((notes) => [note, ...notes]);

        if (pinned && !note.pinned) {
          this.togglePinned(note.id).subscribe();
        }

        if (reminderAt) {
          this.setReminder(note.id, reminderAt).subscribe();
        }

        return note;
      }),

      catchError((error) => this.fail(error)),
    );
  }

  update(id: string, title: string, content: string, color?: string): Observable<Note> {
    const request: UpdateNoteRequest = {
      title,
      description: content,
      color: color || undefined,
    };

    return this.http.put<BackendNoteResponse>(API_ENDPOINTS.notes.byId(id), request).pipe(
      map((response) => this.mapNote(response)),

      map((note) => {
        this.replace(note);

        return note;
      }),

      catchError((error) => this.fail(error)),
    );
  }

  archive(id: string): void {
    this.runAction(API_ENDPOINTS.notes.archive(id), 'patch', () =>
      this.replaceLocal(id, { archived: true }),
    );
  }
  unarchive(id: string): void {
    this.runAction(API_ENDPOINTS.notes.unarchive(id), 'patch', () =>
      this.replaceLocal(id, { archived: false }),
    );
  }
  trash(id: string): void {
    this.runAction(API_ENDPOINTS.notes.byId(id), 'delete', () =>
      this.replaceLocal(id, { trashed: true, archived: false }),
    );
  }
  restore(id: string): void {
    this.runAction(API_ENDPOINTS.notes.restore(id), 'patch', () =>
      this.replaceLocal(id, { trashed: false, archived: false }),
    );
  }

  togglePinned(id: string): Observable<void> {
    const note = this.notes().find((item) => item.id === id);
    const endpoint = note?.pinned ? API_ENDPOINTS.notes.unpin(id) : API_ENDPOINTS.notes.pin(id);

    return this.http.patch<void>(endpoint, {}).pipe(
      map(() => {
        this.replaceLocal(id, { pinned: !Boolean(note?.pinned) });
      }),
      catchError((error) => this.fail(error)),
    );
  }

  permanentlyDelete(id: string): void {
    this.http.delete<void>(API_ENDPOINTS.notes.permanent(id)).subscribe({
      next: () => this.notes.update((notes) => notes.filter((note) => note.id !== id)),
      error: (error) => this.error.set(this.errorMessage(error)),
    });
  }

  emptyTrash(): void {
    const trashed = this.notes().filter((note) => note.trashed);
    if (!trashed.length) return;

    let completed = 0;
    trashed.forEach((note) => {
      this.http.delete<void>(API_ENDPOINTS.notes.permanent(note.id)).subscribe({
        next: () => {
          completed++;
          if (completed === trashed.length) {
            this.notes.update((notes) => notes.filter((note) => !note.trashed));
          }
        },
        error: (error) => this.error.set(this.errorMessage(error)),
      });
    });
  }

  setReminder(id: string, reminderAt: string): Observable<void> {
    return this.http
      .post(
        API_ENDPOINTS.reminders.forNote(id),
        {
          reminderTime: reminderAt,
        },
        {
          responseType: 'json',
        },
      )
      .pipe(
        map(() => {
          // Update the note immediately in the local signal
          this.replaceLocal(id, {
            reminderAt,
          });
        }),
        catchError((error) => this.fail(error)),
      );
  }

  search(keyword: string): Observable<Note[]> {
    const params = new HttpParams().set('keyword', keyword);

    return this.http.get<BackendNoteResponse[]>(API_ENDPOINTS.notes.search, { params }).pipe(
      map((notes) => {
        const mappedNotes = notes.map((note) => this.mapNote(note));

        // Update the notes signal with backend search results
        this.notes.set(mappedNotes);

        return mappedNotes;
      }),
      catchError((error) => this.fail(error)),
    );
  }

  getByPinned(pinned: boolean): Observable<Note[]> {
    return this.filter(API_ENDPOINTS.notes.pinned, { pinned });
  }

  getByArchived(archived: boolean): Observable<Note[]> {
    return this.filter(API_ENDPOINTS.notes.archived, { archived });
  }

  getByTrashed(trashed: boolean): Observable<Note[]> {
    return this.filter(API_ENDPOINTS.notes.trashed, { trashed });
  }

  getWithReminder(): Observable<Note[]> {
    return this.http.get<BackendNoteResponse[]>(API_ENDPOINTS.notes.reminder).pipe(
      map((notes) => {
        const mappedNotes = notes.map((note) => this.mapNote(note));
        this.notes.set(mappedNotes);
        return mappedNotes;
      }),
      catchError((error) => this.fail(error)),
    );
  }

  getByDate(date: string): Observable<Note[]> {
    return this.filter(API_ENDPOINTS.notes.date, { date });
  }

  getByColor(color: string): Observable<Note[]> {
    return this.filter(API_ENDPOINTS.notes.color, { color });
  }

  getByLabel(label: string): Observable<Note[]> {
    return this.filter(API_ENDPOINTS.notes.byLabel, { label });
  }

  getPage(
    page = 0,
    size = 5,
  ): Observable<{
    content: BackendNoteResponse[];
    number: number;
    totalPages: number;
    totalElements: number;
    size: number;
    first: boolean;
    last: boolean;
  }> {
    const params = new HttpParams().set('page', page).set('size', size);

    return this.http
      .get<{
        content: BackendNoteResponse[];
        number: number;
        totalPages: number;
        totalElements: number;
        size: number;
        first: boolean;
        last: boolean;
      }>(API_ENDPOINTS.notes.page, { params })
      .pipe(
        map((response) => {
          this.notes.set(response.content.map((note) => this.mapNote(note)));

          return response;
        }),
        catchError((error) => this.fail(error)),
      );
  }

  addLabel(noteId: string, labelId: number): Observable<void> {
    const params = new HttpParams().set('labelId', labelId);
    return this.http
      .post(API_ENDPOINTS.notes.addLabel(noteId), null, { params, responseType: 'text' })
      .pipe(
        map(() => void 0),
        catchError((error) => this.fail(error)),
      );
  }

  removeLabel(noteId: string, labelId: number): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.notes.removeLabel(noteId, labelId)).pipe(
      map(() => void 0),
      catchError((error) => this.fail(error)),
    );
  }

  clearReminderLocally(id: string): void {
    this.replaceLocal(id, {
      reminderAt: undefined,
    });
  }

  private filter(url: string, paramsObject: Record<string, string | boolean>): Observable<Note[]> {
    let params = new HttpParams();
    Object.entries(paramsObject).forEach(([key, value]) => {
      params = params.set(key, String(value));
    });

    return this.http.get<BackendNoteResponse[]>(url, { params }).pipe(
      map((notes) => {
        const mappedNotes = notes.map((note) => this.mapNote(note));
        this.notes.set(mappedNotes);
        return mappedNotes;
      }),
      catchError((error) => this.fail(error)),
    );
  }

  private runAction(url: string, method: 'patch' | 'delete', onSuccess?: () => void): void {
    const request =
      method === 'patch' ? this.http.patch<void>(url, {}) : this.http.delete<void>(url);

    request.subscribe({
      next: () => {
        onSuccess?.();
        this.error.set('');
      },
      error: (error) => this.error.set(this.errorMessage(error)),
    });
  }

  private replace(note: Note): void {
    this.notes.update((notes) => {
      const exists = notes.some((item) => item.id === note.id);
      return exists ? notes.map((item) => (item.id === note.id ? note : item)) : [note, ...notes];
    });
  }

  updateReminderLocally(id: string, reminderAt: string): void {
    this.replaceLocal(id, {
      reminderAt,
    });
  }

  private replaceLocal(id: string, changes: Partial<Note>): void {
    this.notes.update((notes) =>
      notes.map((note) => (note.id === id ? { ...note, ...changes } : note)),
    );
  }

  private mapNote(note: BackendNoteResponse): Note {
    return {
      id: String(note.id),
      title: note.title,
      content: note.description ?? '',
      color: note.color ?? undefined,
      createdAt: note.createdDate,
      updatedAt: note.updatedDate,
      archived: note.archived,
      trashed: note.trashed,
      pinned: note.pinned,
      reminderAt: note.reminderDate ?? undefined,
      labels: [...new Map((note.labels ?? []).map((label) => [label.id, label])).values()],
    };
  }

  private fail(error: unknown): Observable<never> {
    const message = this.errorMessage(error);
    this.error.set(message);
    return throwError(() => new Error(message));
  }

  private errorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      // Backend returned a plain text error
      if (typeof error.error === 'string' && error.error.trim()) {
        return error.error;
      }

      // Backend returned { message: "..." }
      if (error.error && typeof error.error.message === 'string') {
        return error.error.message;
      }

      // Backend returned { error: "..." }
      if (error.error && typeof error.error.error === 'string') {
        return error.error.error;
      }

      // Backend returned some other JSON object
      if (error.error && typeof error.error === 'object') {
        try {
          return JSON.stringify(error.error);
        } catch {
          return 'Backend returned an invalid error response.';
        }
      }

      // Server is not reachable
      if (error.status === 0) {
        return 'Cannot connect to the backend. Make sure Spring Boot is running on http://localhost:8080.';
      }

      return `Backend request failed with status ${error.status}.`;
    }

    if (error instanceof Error) {
      return error.message;
    }

    // Handle plain JavaScript objects safely
    if (error && typeof error === 'object') {
      try {
        const objectError = error as Record<string, unknown>;

        if (typeof objectError['message'] === 'string') {
          return objectError['message'];
        }

        if (typeof objectError['error'] === 'string') {
          return objectError['error'];
        }

        return JSON.stringify(error);
      } catch {
        return 'An unexpected error occurred.';
      }
    }

    if (typeof error === 'string' && error.trim()) {
      return error;
    }

    return 'Backend request failed.';
  }
}
