import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';

import {McCommonModule} from '@ptsecurity/mosaic/core';

import {McDivider} from './divider.component';


@NgModule({
    imports: [
        McCommonModule,
        CommonModule
    ],
    exports: [
        McDivider,
        McCommonModule
    ],
    declarations: [
        McDivider
    ]
})
export class McDividerModule {}
