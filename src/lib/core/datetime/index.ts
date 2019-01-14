import { NgModule } from '@angular/core';
import { PlatformModule } from '@ptsecurity/cdk/platform';

import { DateAdapter } from './date-adapter';
import { MC_DATE_FORMATS } from './date-formats';
import { NativeDateAdapter } from './native-date-adapter';
import { MAT_NATIVE_DATE_FORMATS } from './native-date-formats';


export * from './date-adapter';
export * from './date-formats';
export * from './native-date-adapter';
export * from './native-date-formats';


@NgModule({
  imports: [PlatformModule],
  providers: [
    {provide: DateAdapter, useClass: NativeDateAdapter}
  ]
})
export class NativeDateModule {}


@NgModule({
  imports: [NativeDateModule],
  providers: [{provide: MC_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS}]
})
export class McNativeDateModule {}
