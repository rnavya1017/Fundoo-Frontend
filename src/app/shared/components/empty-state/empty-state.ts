import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  template: '<div class="empty-state"><div class="empty-icon">{{ icon() }}</div><h2>{{ title() }}</h2><p>{{ message() }}</p></div>',
  styles: '.empty-state { margin-top: 100px; color: #6b7280; text-align: center; } .empty-icon { color: #c7ced8; font-size: 50px; } h2 { margin: 12px 0 8px; color: #4b5563; font-size: 22px; } p { margin: 0; }',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyState {
  readonly title = input('No notes available.');
  readonly message = input('Create your first note.');
  readonly icon = input('✦');
}
