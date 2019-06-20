import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { McSidebar } from './sidebar.component';


@NgModule({
    imports: [CommonModule],
    declarations: [
        McSidebar
    ],
    exports: [
        McSidebar
    ]
})
export class McSidebarModule {}
