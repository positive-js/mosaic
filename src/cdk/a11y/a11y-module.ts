/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {CdkMonitorFocus, FOCUS_MONITOR_PROVIDER} from './focus-monitor/focus-monitor';

@NgModule({
  imports: [CommonModule],
  declarations: [CdkMonitorFocus],
  exports: [CdkMonitorFocus],
  providers: [
    FOCUS_MONITOR_PROVIDER,
  ]
})
export class A11yModule {}
