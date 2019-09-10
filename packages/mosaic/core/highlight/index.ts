import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { McHighlightPipe } from './highlight.pipe';


@NgModule({
    imports: [CommonModule],
    exports: [McHighlightPipe],
    declarations: [McHighlightPipe]
})
export class McHighlightModule {}


export * from './highlight.pipe';
