import { NgModule } from '@angular/core';

import { McDecimalPipe } from './number/formatter';


@NgModule({
    exports: [
        McDecimalPipe
    ],
    declarations: [
        McDecimalPipe
    ]
})
export class McFormattersModule {}


export * from './number/formatter';
export * from './date/formatter';
