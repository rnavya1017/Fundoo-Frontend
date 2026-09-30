import { ChangeDetectionStrategy, Component, output } from '@angular/core';

@Component({
  selector: 'app-note-actions',
  template: '<div class="actions"><button type="button" (click)="edit.emit()">Edit</button><button type="button" (click)="archive.emit()">Archive</button><button type="button" (click)="trash.emit()">Trash</button></div>',
  styles: '.actions { display: flex; gap: 7px; flex-wrap: wrap; } button { padding: 6px 8px; border: 0; border-radius: 5px; background: #edf2f8; color: #285da6; font-size: 11px; cursor: pointer; }',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoteActions {
  readonly edit = output<void>();
  readonly archive = output<void>();
  readonly trash = output<void>();
}
