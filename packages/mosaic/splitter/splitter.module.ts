import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { McIconModule } from '@ptsecurity/mosaic/icon';

import {
    McGutterDirective,
    McGutterGhostDirective,
    McSplitterAreaDirective,
    McSplitterComponent
} from './splitter.component';


@NgModule({
    imports: [
        CommonModule,
        McIconModule
    ],
    exports: [
        McGutterDirective,
        McSplitterAreaDirective,
        McSplitterComponent
    ],
    declarations: [
        McGutterDirective,
        McGutterGhostDirective,
        McSplitterAreaDirective,
        McSplitterComponent
    ]
})
export class McSplitterModule {
}
