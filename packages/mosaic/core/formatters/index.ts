import { NgModule } from '@angular/core';

import { DateFormatter } from './date/formatter';
import { McDecimalPipe } from './number/formatter';


@NgModule({
    exports: [McDecimalPipe],
    declarations: [McDecimalPipe],
    providers: [DateFormatter]
})
export class McFormattersModule {}


export * from './number/formatter';
export * from './date/formatter';
