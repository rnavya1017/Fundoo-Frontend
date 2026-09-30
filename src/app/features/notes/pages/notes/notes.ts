import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';

import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, combineLatest, finalize, forkJoin, map, of, switchMap } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { LabelService } from '../../services/label.service';
import { Note } from '../../models/note.model';
import { NotesStore } from '../../services/notes.service';
import { ReminderService } from '../../services/reminder.service';
import { ReminderResponse } from '../../models/reminder.model';
import { AttachmentService } from '../../services/attachment.service';
import { AttachmentResponse } from '../../models/attachment.model';
export type NotesSection = 'all' | 'reminders' | 'archive' | 'trash';

@Component({
  selector: 'app-notes',
  imports: [ReactiveFormsModule],
  templateUrl: './notes.html',
  styleUrl: './notes.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Notes {
  private readonly auth = inject(AuthService);
  private readonly labelService = inject(LabelService);
  private readonly reminderService = inject(ReminderService);
  private readonly attachmentService = inject(AttachmentService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  readonly store = inject(NotesStore);
  readonly profileOpen = signal(false);
  readonly labelsOpen = signal(false);
  readonly reminderOpen = signal(false);
  readonly sidebarOpen = signal(true);
  readonly attachments = signal<Record<string, AttachmentResponse[]>>({});
  readonly attachmentOpen = signal(false);
  readonly attachmentNote = signal<Note | null>(null);
  readonly attachmentLoading = signal(false);
  readonly pendingAttachment = signal<File | null>(null);
  private readonly loadedAttachmentNotes = new Set<string>();
  readonly emptyTrashConfirmationOpen = signal(false);
  readonly permanentDeleteConfirmationOpen = signal(false);
  readonly noteToDelete = signal<Note | null>(null);
  readonly composerPinned = signal(false);
  readonly pinNotice = signal('');
  readonly modalOpen = signal(false);
  readonly composerOpen = signal(false);
  readonly loading = signal(false);
  readonly searchText = signal('');
  readonly pinnedFilter = signal<'all' | 'pinned' | 'unpinned'>('all');
  readonly colorFilter = signal('');
  readonly dateFilter = signal('');
  readonly filtersOpen = signal(false);
  readonly draftPinnedFilter = signal<'all' | 'pinned' | 'unpinned'>('all');
  readonly draftColorFilter = signal('');
  readonly draftDateFilter = signal('');
  readonly section = signal<NotesSection>(this.getSection());
  readonly activeLabel = signal<string | null>(null);
  readonly editingId = signal<string | null>(null);
  readonly editingReminderNoteId = signal<string | null>(null);
  readonly labels = signal<string[]>([]);
  readonly labelIds = signal<Record<string, number>>({});
  readonly newLabel = signal('');
  readonly selectedColor = signal('');
  readonly colorOptions = [
    { name: 'Default', value: '' },
    { name: 'Red', value: '#f28b82' },
    { name: 'Orange', value: '#fbbc04' },
    { name: 'Yellow', value: '#fff475' },
    { name: 'Green', value: '#ccff90' },
    { name: 'Teal', value: '#a7ffeb' },
    { name: 'Blue', value: '#cbf0f8' },
    { name: 'Purple', value: '#d7aefb' },
    { name: 'Pink', value: '#fdcfe8' },
  ];
  readonly selectedLabelIds = signal<number[]>([]);
  readonly editingLabelId = signal<number | null>(null);
  readonly editingLabelName = signal('');
  readonly labelToDelete = signal<string | null>(null);
  readonly labelDeleteOpen = signal(false);
  readonly labelDeleteLoading = signal(false);
  readonly reminderDate = signal(this.today());
  readonly reminderTime = signal('13:00');
  readonly reminders = signal<ReminderResponse[]>([]);
  readonly selectedReminderId = signal<number | null>(null);
  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(80)]],
    content: ['', [Validators.required, Validators.maxLength(2000)]],
  });
  readonly user = computed(() => this.auth.currentUser());
  readonly currentPage = signal(0);
  readonly pageSize = signal(20);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);
  /** Notes returned for the current view. Pagination is applied only after filtering. */
  readonly filteredViewNotes = computed(() => {
    const reminderNoteIds = new Set(this.reminders().map((reminder) => String(reminder.noteId)));

    const activeLabel = this.activeLabel();

    const keyword = this.searchText().trim().toLowerCase();

    const pinnedFilter = this.pinnedFilter();
    const colorFilter = this.colorFilter();
    const dateFilter = this.dateFilter();

    return this.store
      .notes()
      .filter((note) => {
        // -----------------------------
        // SECTION FILTER
        // -----------------------------

        const matchesSection =
          this.section() === 'all'
            ? !note.archived && !note.trashed
            : this.section() === 'reminders'
              ? (reminderNoteIds.has(note.id) || Boolean(note.reminderAt)) && !note.trashed
              : this.section() === 'archive'
                ? note.archived && !note.trashed
                : this.section() === 'trash'
                  ? note.trashed
                  : false;

      
        // SEARCH FILTER

        const matchesSearch =
          !keyword ||
          note.title.toLowerCase().includes(keyword) ||
          note.content.toLowerCase().includes(keyword);

   
        // LABEL FILTER

        const matchesLabel =
          !activeLabel || (note.labels ?? []).some((label) => label.name === activeLabel);

        // PINNED FILTER
      
        const matchesPinned =
          pinnedFilter === 'all' ? true : pinnedFilter === 'pinned' ? note.pinned : !note.pinned;

        // COLOR FILTER

        const matchesColor = !colorFilter || (note.color ?? '') === colorFilter;
        
        // DATE FILTER

        const matchesDate =
          !dateFilter || this.toDateInput(new Date(note.createdAt)) === dateFilter;

        return (
          matchesSection &&
          matchesSearch &&
          matchesLabel &&
          matchesPinned &&
          matchesColor &&
          matchesDate
        );
      })
      .sort((left, right) => {
        // Pinned notes always come first.
        if (left.pinned !== right.pinned) {
          return Number(right.pinned) - Number(left.pinned);
        }

        // Inside each group, show newest created notes first.
        return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
      });
  });

  readonly visibleNotes = computed(() => {
    const notes = this.filteredViewNotes();

    const start = this.currentPage() * this.pageSize();

    return notes.slice(start, start + this.pageSize());
  });

  constructor() {
    effect(() => {
      const notes = this.store.notes();

      if (!isPlatformBrowser(this.platformId)) {
        return;
      }

      notes.forEach((note) => {
        if (this.loadedAttachmentNotes.has(note.id)) {
          return;
        }

        this.loadedAttachmentNotes.add(note.id);
        this.loadAttachments(note);
      });
    });

    combineLatest([this.route.url, this.route.queryParams]).subscribe(([, params]) => {
      const label = typeof params['label'] === 'string' ? params['label'] : null;
      const routeSection = this.getSection();

      this.section.set(label ? 'all' : routeSection);
      this.activeLabel.set(label);
      this.currentPage.set(0);
      this.loadCurrentView();
    });

    if (isPlatformBrowser(this.platformId)) {
      this.loadLabels();
      this.loadReminders();
    }
  }

  setSearch(value: string): void {
    this.searchText.set(value);
    this.currentPage.set(0);
    this.loadCurrentView();
  }

  openFilters(): void {
    this.draftPinnedFilter.set(this.pinnedFilter());
    this.draftColorFilter.set(this.colorFilter());
    this.draftDateFilter.set(this.dateFilter());
    this.filtersOpen.set(true);
  }

  closeFilters(): void {
    this.filtersOpen.set(false);
  }

  setPinnedFilter(value: 'all' | 'pinned' | 'unpinned'): void {
    this.draftPinnedFilter.set(value);
  }

  setColorFilter(value: string): void {
    this.draftColorFilter.set(value);
  }

  setDateFilter(value: string): void {
    this.draftDateFilter.set(value);
  }

  applyFilters(): void {
    this.pinnedFilter.set(this.draftPinnedFilter());
    this.colorFilter.set(this.draftColorFilter());
    this.dateFilter.set(this.draftDateFilter());
    this.currentPage.set(0);
    this.filtersOpen.set(false);
  }

  clearFilters(): void {
    this.pinnedFilter.set('all');
    this.colorFilter.set('');
    this.dateFilter.set('');
    this.draftPinnedFilter.set('all');
    this.draftColorFilter.set('');
    this.draftDateFilter.set('');
    this.currentPage.set(0);
  }

  hasActiveFilters(): boolean {
    return this.pinnedFilter() !== 'all' || this.colorFilter() !== '' || this.dateFilter() !== '';
  }

  refresh(): void {
    this.currentPage.set(0);
    this.loadCurrentView();
  }

  openLabels(): void {
    this.labelsOpen.set(true);

    if (isPlatformBrowser(this.platformId)) {
      this.loadLabels();
    }
  }

  closeLabels(): void {
    this.labelsOpen.set(false);
    this.newLabel.set('');
  }

  setNewLabel(value: string): void {
    this.newLabel.set(value);
  }

  setColor(color: string): void {
    this.selectedColor.set(color);
  }

  isColorSelected(color: string): boolean {
    return this.selectedColor() === color;
  }

  addLabel(): void {
    const label = this.newLabel().trim();
    if (
      !label ||
      this.labels().some((existing) => existing.toLowerCase() === label.toLowerCase())
    ) {
      this.newLabel.set('');
      return;
    }

    this.labelService.create({ name: label }).subscribe({
      next: (created) => {
        this.labels.update((labels) => [...labels, created.name]);
        this.labelIds.update((ids) => ({ ...ids, [created.name]: created.id }));
        this.newLabel.set('');
      },
      error: (error) => this.store.error.set(error.message),
    });
  }

  removeLabel(label: string): void {
    const id = this.labelIds()[label];

    if (!id) {
      return;
    }

    this.labelToDelete.set(label);
    this.labelDeleteOpen.set(true);
  }

  confirmLabelDelete(): void {
    const label = this.labelToDelete();
    const labelId = label ? this.labelIds()[label] : undefined;

    if (!label || !labelId) {
      this.cancelLabelDelete();
      return;
    }

    const notesUsingLabel = this.store
      .notes()
      .filter((note) => (note.labels ?? []).some((noteLabel) => noteLabel.id === labelId));

    this.labelDeleteLoading.set(true);

    const removeFromNotes$ = notesUsingLabel.length
      ? forkJoin(notesUsingLabel.map((note) => this.store.removeLabel(note.id, labelId)))
      : of([]);

    removeFromNotes$.subscribe({
      next: () => {
        this.labelService.delete(labelId).subscribe({
          next: () => {
            this.labels.update((labels) => labels.filter((item) => item !== label));

            this.labelIds.update((ids) => {
              const updated = { ...ids };
              delete updated[label];
              return updated;
            });

            const wasActiveLabel = this.activeLabel() === label;

            if (wasActiveLabel) {
              this.activeLabel.set(null);
              void this.router.navigate(['/notes'], { queryParams: {} });
            }

            this.labelDeleteLoading.set(false);
            this.labelDeleteOpen.set(false);
            this.labelToDelete.set(null);

            this.loadCurrentView();
          },
          error: (error) => {
            this.labelDeleteLoading.set(false);
            this.store.error.set(error?.message || 'Unable to delete the label.');
          },
        });
      },
      error: (error) => {
        this.labelDeleteLoading.set(false);
        this.store.error.set(error?.message || 'Unable to remove the label from notes.');
      },
    });
  }

  cancelLabelDelete(): void {
    this.labelDeleteOpen.set(false);
    this.labelToDelete.set(null);
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  toggleLabel(label: string): void {
    const id = this.labelIds()[label];

    if (!id) {
      return;
    }

    this.selectedLabelIds.update((ids) => {
      const uniqueIds = [...new Set(ids)];

      if (uniqueIds.includes(id)) {
        return uniqueIds.filter((existingId) => existingId !== id);
      }

      return [...uniqueIds, id];
    });
  }

  isLabelSelected(label: string): boolean {
    const id = this.labelIds()[label];

    return id ? this.selectedLabelIds().includes(id) : false;
  }

  openReminder(note?: Note): void {
    const targetNote = note ?? this.store.notes().find((item) => item.id === this.editingId());

    if (!targetNote) {
      this.store.error.set('Please save the note first, then add a reminder.');
      return;
    }

    this.editingReminderNoteId.set(targetNote.id);

    const reminder = targetNote.reminderAt ? new Date(targetNote.reminderAt) : new Date();
    this.reminderDate.set(this.toDateInput(reminder));
    this.reminderTime.set(this.toTimeInput(reminder));

    const reminderRecord = this.reminders().find((item) => String(item.noteId) === targetNote.id);

    this.selectedReminderId.set(reminderRecord?.id ?? null);
    this.reminderOpen.set(true);
  }

  closeReminder(): void {
    this.reminderOpen.set(false);
    this.selectedReminderId.set(null);
    this.editingReminderNoteId.set(null);
  }

  setReminderDate(value: string): void {
    this.reminderDate.set(value);
  }
  setReminderTime(value: string): void {
    this.reminderTime.set(value);
  }

  saveReminder(): void {
    const noteId = this.editingReminderNoteId();

    if (!noteId) {
      this.store.error.set('Please select a saved note first.');
      return;
    }

    const reminderTime = `${this.reminderDate()}T${this.reminderTime()}:00`;

    const existingReminders = this.reminders().filter((item) => String(item.noteId) === noteId);

    this.loading.set(true);

    const deleteExisting$ = existingReminders.length
      ? forkJoin(existingReminders.map((item) => this.reminderService.delete(item.id))).pipe(
          map(() => void 0),
        )
      : of(void 0);

    deleteExisting$
      .pipe(
        switchMap(() => this.reminderService.create(noteId, { reminderTime })),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (createdReminder) => {
          this.store.updateReminderLocally(noteId, reminderTime);

          this.reminders.update((reminders) => [
            ...reminders.filter((item) => String(item.noteId) !== noteId),
            createdReminder,
          ]);

          this.closeReminder();
        },

        error: (error) => {
          this.store.error.set(error.message || 'Failed to save reminder.');
        },
      });
  }

  private loadReminders(): void {
    this.reminderService.getAll().subscribe({
      next: (reminders) => {
        this.reminders.set(reminders);
      },

      error: (error) => {
        console.error('Failed to load reminders:', error);
      },
    });
  }

  deleteReminder(reminder: ReminderResponse): void {
    this.reminderService.delete(reminder.id).subscribe({
      next: () => {
        this.reminders.update((reminders) => reminders.filter((item) => item.id !== reminder.id));

        this.store.clearReminderLocally(String(reminder.noteId));
      },

      error: (error) => {
        this.store.error.set(error.message || 'Failed to remove reminder.');
      },
    });
  }

  removeReminderForNote(note: Note): void {
    const noteReminders = this.reminders().filter(
      (reminder) => String(reminder.noteId) === note.id,
    );

    if (!noteReminders.length) {
      this.store.clearReminderLocally(note.id);
      return;
    }

    this.loading.set(true);

    forkJoin(noteReminders.map((reminder) => this.reminderService.delete(reminder.id)))
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.reminders.update((reminders) =>
            reminders.filter((reminder) => String(reminder.noteId) !== note.id),
          );

          this.store.clearReminderLocally(note.id);
        },

        error: (error) => {
          this.store.error.set(error.message || 'Failed to remove reminder.');
        },
      });
  }

  navigate(section: NotesSection): void {
    this.activeLabel.set(null);
    this.searchText.set('');
    this.currentPage.set(0);

    const path = section === 'all' ? '/notes' : `/notes/${section}`;

    void this.router.navigate([path], { queryParams: {} });
  }

  selectLabel(label: string): void {
    this.activeLabel.set(label);
    this.section.set('all');
    this.currentPage.set(0);

    void this.router.navigate(['/notes'], {
      queryParams: { label },
    });
  }

  openCreate(): void {
    this.editingId.set(null);

    this.composerPinned.set(false);

    this.selectedColor.set('');

    this.selectedLabelIds.set([]);

    this.pendingAttachment.set(null);

    this.form.reset({
      title: '',
      content: '',
    });

    this.composerOpen.set(true);
  }

  openEdit(note: Note): void {
    this.editingId.set(note.id);

    this.composerPinned.set(Boolean(note.pinned));

    this.selectedColor.set(note.color ?? '');

    this.selectedLabelIds.set([...new Set((note.labels ?? []).map((label) => label.id))]);

    this.pendingAttachment.set(null);

    this.form.reset({
      title: note.title,
      content: note.content,
    });

    this.composerOpen.set(true);
  }

  closeModal(): void {
    this.composerOpen.set(false);

    this.modalOpen.set(false);

    this.selectedColor.set('');

    this.selectedLabelIds.set([]);

    this.editingId.set(null);

    this.pendingAttachment.set(null);

    this.form.reset();
  }

  closeComposer(): void {
    if (this.form.controls.content.value.trim()) this.saveNote();
    else this.closeModal();
  }

  saveNote(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    const { title, content } = this.form.getRawValue();

    const editingId = this.editingId();

    const existingNote = editingId
      ? this.store.notes().find((note) => note.id === editingId)
      : undefined;

    const existingLabelIds = (existingNote?.labels ?? []).map((label) => label.id);

    const selectedFile = this.pendingAttachment();

    const request = editingId
      ? this.store.update(editingId, title.trim(), content.trim(), this.selectedColor())
      : this.store.create(
          title.trim(),
          content.trim(),
          undefined,
          undefined,
          this.composerPinned(),
          this.selectedColor(),
        );

    request.subscribe({
      next: (note) => {
        this.syncLabels(note.id, existingLabelIds).subscribe({
          next: () => {
            if (selectedFile) {
              this.attachmentLoading.set(true);

              this.attachmentService.upload(note.id, selectedFile).subscribe({
                next: (attachment) => {
                  this.attachments.update((current) => ({
                    ...current,
                    [note.id]: [...(current[note.id] ?? []), attachment],
                  }));

                  this.attachmentLoading.set(false);

                  this.pendingAttachment.set(null);

                  this.loadCurrentView();

                  this.loading.set(false);

                  this.closeModal();
                },

                error: (error) => {
                  this.attachmentLoading.set(false);

                  this.loading.set(false);

                  this.loadCurrentView();

                  this.closeModal();

                  this.store.error.set(
                    error.message || 'Note saved, but attachment upload failed.',
                  );
                },
              });
            } else {
              this.loadCurrentView();

              this.loading.set(false);

              this.closeModal();
            }
          },

          error: (error) => {
            this.loading.set(false);

            this.store.error.set(error.message || 'Failed to update note labels.');
          },
        });
      },

      error: (error) => {
        this.loading.set(false);

        this.store.error.set(error.message || 'Failed to save note.');
      },
    });
  }

  archive(note: Note): void {
    this.store.archive(note.id);
  }
  unarchive(note: Note): void {
    this.store.unarchive(note.id);
  }
  trash(note: Note): void {
    this.store.trash(note.id);
  }
  restore(note: Note): void {
    this.store.restore(note.id);
  }

  togglePinned(note: Note): void {
    const pinned = !note.pinned;
    this.store.togglePinned(note.id).subscribe({
      next: () => this.showPinNotice(pinned),
      error: (error) => this.store.error.set(error.message),
    });
  }

  toggleComposerPinned(): void {
    const pinned = !this.composerPinned();
    this.composerPinned.set(pinned);
    this.showPinNotice(pinned);
  }

  permanentlyDelete(note: Note): void {
    this.noteToDelete.set(note);
    this.permanentDeleteConfirmationOpen.set(true);
  }

  cancelPermanentDelete(): void {
    this.permanentDeleteConfirmationOpen.set(false);
    this.noteToDelete.set(null);
  }

  confirmPermanentDelete(): void {
    const note = this.noteToDelete();

    if (!note) {
      return;
    }

    this.permanentDeleteConfirmationOpen.set(false);
    this.noteToDelete.set(null);

    this.store.permanentlyDelete(note.id);
  }

  emptyTrash(): void {
    this.emptyTrashConfirmationOpen.set(true);
  }

  cancelEmptyTrash(): void {
    this.emptyTrashConfirmationOpen.set(false);
  }

  confirmEmptyTrash(): void {
    this.emptyTrashConfirmationOpen.set(false);

    this.store.emptyTrash();
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleDateString();
  }
  formatReminder(value: string): string {
    return new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
  }

  private syncLabels(noteId: string, existingLabelIds: number[]): Observable<void> {
    const existingIds = [...new Set(existingLabelIds)];

    const selectedIds = [...new Set(this.selectedLabelIds())];

    const operations: Observable<void>[] = [];

    selectedIds
      .filter((id) => !existingIds.includes(id))
      .forEach((id) => {
        operations.push(this.store.addLabel(noteId, id));
      });

    existingIds
      .filter((id) => !selectedIds.includes(id))
      .forEach((id) => {
        operations.push(this.store.removeLabel(noteId, id));
      });

    if (operations.length === 0) {
      return of(void 0);
    }

    return forkJoin(operations).pipe(map(() => void 0));
  }

  private loadLabels(): void {
    this.labelService.getAll().subscribe({
      next: (labels) => {
        this.labels.set(labels.map((label) => label.name));

        this.labelIds.set(Object.fromEntries(labels.map((label) => [label.name, label.id])));
      },

      error: (error) => {
        console.error('Failed to load labels:', error);
      },
    });
  }

  startEditLabel(label: string): void {
    const id = this.labelIds()[label];

    if (!id) {
      return;
    }

    this.editingLabelId.set(id);

    this.editingLabelName.set(label);
  }

  setEditingLabelName(value: string): void {
    this.editingLabelName.set(value);
  }

  cancelEditLabel(): void {
    this.editingLabelId.set(null);

    this.editingLabelName.set('');
  }

  saveLabelEdit(oldLabel: string): void {
    const id = this.labelIds()[oldLabel];

    const name = this.editingLabelName().trim();

    if (!id || !name) {
      return;
    }

    this.labelService.update(id, { name }).subscribe({
      next: (updated) => {
        const wasActiveLabel = this.activeLabel() === oldLabel;

        if (wasActiveLabel) {
          this.activeLabel.set(updated.name);
          void this.router.navigate(['/notes'], {
            queryParams: { label: updated.name },
          });
        }

        this.labels.update((labels) =>
          labels.map((label) => (label === oldLabel ? updated.name : label)),
        );

        this.labelIds.update((ids) => {
          const copy = { ...ids };

          delete copy[oldLabel];

          copy[updated.name] = updated.id;

          return copy;
        });

        this.cancelEditLabel();
      },

      error: (error) => this.store.error.set(error.message),
    });
  }

  private getSection(): NotesSection {
    return this.router.url.endsWith('/reminders')
      ? 'reminders'
      : this.router.url.endsWith('/archive')
        ? 'archive'
        : this.router.url.endsWith('/trash')
          ? 'trash'
          : 'all';
  }

  private today(): string {
    return this.toDateInput(new Date());
  }
  private toDateInput(value: Date): string {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
  }
  private toTimeInput(value: Date): string {
    return `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`;
  }
  private showPinNotice(pinned: boolean): void {
    this.pinNotice.set(pinned ? 'Note pinned' : 'Note unpinned');
    window.setTimeout(() => this.pinNotice.set(''), 1800);
  }

  onAttachmentSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    this.pendingAttachment.set(file);

    input.value = '';
  }

  loadAttachments(note: Note): void {
    this.attachmentService.getAll(note.id).subscribe({
      next: (attachments) => {
        this.attachments.update((current) => ({
          ...current,
          [note.id]: attachments,
        }));
      },

      error: (error) => {
        console.error('Failed to load attachments:', error);
      },
    });
  }

  deleteAttachment(note: Note, attachment: AttachmentResponse): void {
    this.attachmentService.delete(attachment.id).subscribe({
      next: () => {
        this.attachments.update((current) => ({
          ...current,
          [note.id]: (current[note.id] ?? []).filter((item) => item.id !== attachment.id),
        }));
      },

      error: (error) => {
        this.store.error.set(error.message || 'Failed to delete attachment.');
      },
    });
  }

  openAttachments(note: Note): void {
    this.attachmentNote.set(note);
    this.attachmentOpen.set(true);
  }
  closeAttachments(): void {
    this.attachmentOpen.set(false);
    this.attachmentNote.set(null);
  }

  private loadAllAttachments(): void {
    this.store.notes().forEach((note) => {
      this.loadAttachments(note);
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    if (bytes < 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }

  loadPage(page: number): void {
    const totalPages = this.displayTotalPages();

    if (page < 0 || (totalPages > 0 && page >= totalPages)) {
      return;
    }

    this.currentPage.set(page);
  }

  previousPage(): void {
    if (this.currentPage() > 0) {
      this.loadPage(this.currentPage() - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.displayTotalPages() - 1) {
      this.loadPage(this.currentPage() + 1);
    }
  }

  readonly displayTotalPages = computed(() => {
    return Math.ceil(this.filteredViewNotes().length / this.pageSize());
  });

  private loadCurrentView(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.store.error.set('');
    this.loading.set(true);

    const keyword = this.searchText().trim();
    const label = this.activeLabel();

    let request: Observable<Note[]>;

    if (keyword) {
      request = this.store.search(keyword);
    } else if (label) {
      request = this.store.getByLabel(label);
    } else {
      switch (this.section()) {
        case 'archive':
          request = this.store.getByArchived(true);
          break;
        case 'trash':
          request = this.store.getByTrashed(true);
          break;
        case 'reminders':
          request = this.store.getWithReminder();
          break;
        case 'all':
        default:
          request = this.store.getAll();
          break;
      }
    }

    request.subscribe({
      next: () => {
        this.totalElements.set(this.filteredViewNotes().length);
        this.totalPages.set(this.displayTotalPages());

        if (this.currentPage() >= this.displayTotalPages() && this.displayTotalPages() > 0) {
          this.currentPage.set(this.displayTotalPages() - 1);
        }

        if (this.displayTotalPages() === 0) {
          this.currentPage.set(0);
        }

        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.totalElements.set(0);
        this.totalPages.set(0);
        this.currentPage.set(0);
        this.store.error.set(error.message || 'Failed to load notes.');
      },
    });
  }
  showEmptyTrashConfirmation(): void {
    this.emptyTrashConfirmationOpen.set(true);
  }
}
