import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-note-form',
  imports: [ReactiveFormsModule],
  template: '<form [formGroup]="form()" (ngSubmit)="saved.emit()"><label>Title<input formControlName="title" placeholder="Note title"></label><label>Content<textarea formControlName="content" rows="6" placeholder="Write your note..."></textarea></label><button type="button" (click)="cancelled.emit()">Cancel</button><button type="submit">{{ submitLabel() }}</button></form>',
  styles: ':host { display: block; } form { display: grid; gap: 12px; } label { display: grid; gap: 6px; color: #4b5563; font-weight: 700; } input, textarea { padding: 11px; border: 1px solid #cbd2dc; border-radius: 8px; font: inherit; } button { padding: 9px 13px; border: 1px solid #cbd2dc; border-radius: 7px; background: #fff; cursor: pointer; }',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoteForm {
  readonly form = input.required<FormGroup<{ title: FormControl<string>; content: FormControl<string> }>>();
  readonly submitLabel = input('Save');
  readonly saved = output<void>();
  readonly cancelled = output<void>();
}
