import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { DECLARATIONS } from './modules';

@NgModule({
    imports: [
        CommonModule,
        ...DECLARATIONS
    ],
    exports: [

    ]
})
export class MosaicModule {}
