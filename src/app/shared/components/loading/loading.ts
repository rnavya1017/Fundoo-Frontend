import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-loading',
  template: '<div class="loading" role="status">{{ message() }}</div>',
  styles: '.loading { padding: 48px; color: #526172; text-align: center; }',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Loading {
  readonly message = input('Loading...');
}
