import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { McHighlightPipePipe } from './highlight.pipe';


@NgModule({
    imports: [CommonModule],
    exports: [McHighlightPipePipe],
    declarations: [McHighlightPipePipe]
})
export class McHighlightModule {}
