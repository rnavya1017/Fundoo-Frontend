import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-navbar',
  template: '<header class="navbar"><strong>{{ brand() }}</strong><ng-content /><button type="button" (click)="logout.emit()">Log out</button></header>',
  styles: '.navbar { display: flex; align-items: center; gap: 20px; min-height: 64px; padding: 0 24px; box-sizing: border-box; background: #fff; border-bottom: 1px solid #e2e6eb; } .navbar strong { color: #5d6775; font-size: 20px; margin-right: auto; } button { border: 1px solid #cbd2dc; border-radius: 7px; padding: 8px 12px; background: #fff; color: #245bb7; cursor: pointer; }',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Navbar {
  readonly brand = input('FunDoo');
  readonly logout = output<void>();
}
