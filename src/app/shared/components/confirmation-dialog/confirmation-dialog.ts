import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirmation-dialog',
  template: '<div class="backdrop"><section class="dialog" role="alertdialog" aria-modal="true"><h2>{{ title() }}</h2><p>{{ message() }}</p><div class="actions"><button type="button" (click)="cancelled.emit()">Cancel</button><button type="button" class="danger" (click)="confirmed.emit()">{{ confirmLabel() }}</button></div></section></div>',
  styles: '.backdrop { position: fixed; inset: 0; z-index: 10; display: grid; place-items: center; padding: 18px; background: #1d273566; } .dialog { width: min(100%, 420px); padding: 26px; background: #fff; border-radius: 12px; box-shadow: 0 20px 50px #1d273533; } .actions { display: flex; justify-content: end; gap: 10px; margin-top: 22px; } button { padding: 9px 14px; border: 1px solid #cbd2dc; border-radius: 7px; background: #fff; cursor: pointer; } .danger { color: #b42318; }',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmationDialog {
  readonly title = input('Confirm action');
  readonly message = input('This action cannot be undone.');
  readonly confirmLabel = input('Confirm');
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();
}
