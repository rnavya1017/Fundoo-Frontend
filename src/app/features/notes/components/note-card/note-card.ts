import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Note } from '../../models/note.model';

@Component({
  selector: 'app-note-card',
  imports: [DatePipe],
  template: '<article class="note-card"><h2>{{ note().title }}</h2><p>{{ note().content }}</p><footer><span>Updated {{ note().updatedAt | date }}</span><ng-content /></footer></article>',
  styles: '.note-card { display: flex; min-height: 190px; flex-direction: column; padding: 20px; box-sizing: border-box; background: #fffef5; border: 1px solid #e3dfc9; border-radius: 10px; } h2 { margin: 0 0 12px; color: #283548; font-size: 18px; } p { flex: 1; margin: 0; color: #5e6875; line-height: 1.55; white-space: pre-wrap; overflow-wrap: anywhere; } footer { display: flex; flex-direction: column; gap: 10px; margin-top: 18px; color: #8993a0; font-size: 11px; }',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoteCard {
  readonly note = input.required<Note>();
}
