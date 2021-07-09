import { Component, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';


@Component({
  selector: 'mc-e2e-app',
  template: '<router-outlet></router-outlet>',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush
})
// tslint:disable-next-line:naming-convention
export class McE2EApp {}
