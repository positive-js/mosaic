import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { TableOfContents } from './table-of-contents';


@NgModule({
    imports: [CommonModule, RouterModule],
    declarations: [TableOfContents],
    exports: [TableOfContents],
    entryComponents: [TableOfContents]
})
export class TableOfContentsModule {
}
