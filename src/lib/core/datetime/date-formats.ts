/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken} from '@angular/core';


export type McDateFormats = {
  parse: {
    dateInput: any
  },
  display: {
    dateInput: any,
    monthYearLabel: any,
    dateA11yLabel: any,
    monthYearA11yLabel: any,
  }
};


export const MC_DATE_FORMATS = new InjectionToken<McDateFormats>('mat-date-formats');
