import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NoteCard } from '../note-card/note-card';
import { Note } from '../../models/note.model';

@Component({
  selector: 'app-note-list',
  imports: [NoteCard],
  template: '<div class="notes-grid">@for (note of notes(); track note.id) { <app-note-card [note]="note"><ng-content /></app-note-card> }</div>',
  styles: '.notes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 18px; }',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoteList {
  readonly notes = input.required<Note[]>();
}
