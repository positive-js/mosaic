import {EventEmitter, Injectable, NgZone} from '@angular/core';


/**
 * Mock synchronous NgZone implementation that can be used
 * to flush out `onStable` subscriptions in tests.
 *
 * via: https://github.com/angular/angular/blob/master/packages/core/testing/src/ng_zone_mock.ts
 * @docs-private
 */
@Injectable()
export class MockNgZone extends NgZone {
  onStable: EventEmitter<any> = new EventEmitter(false);

  constructor() {
    super({enableLongStackTrace: false});
  }

  run(fn: () => void): any {
    return fn();
  }

  runOutsideAngular(fn: () => void): any {
    return fn();
  }

  simulateZoneExit(): void {
    this.onStable.emit(null);
  }
}
