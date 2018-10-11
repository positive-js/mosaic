import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { McIconModule } from '../icon/icon.module';
import { McGutterDirective } from '../splitter/gutter.directive';
import { McSplitterAreaDirective } from '../splitter/splitter-area.directive';
import { McSplitterComponent } from '../splitter/splitter.component';


@NgModule({
    imports: [
        CommonModule,
        McIconModule
    ],
    exports: [
        McSplitterAreaDirective,
        McSplitterComponent
    ],
    declarations: [
        McGutterDirective,
        McSplitterAreaDirective,
        McSplitterComponent
    ]
})
export class McSplitterModule {
}
