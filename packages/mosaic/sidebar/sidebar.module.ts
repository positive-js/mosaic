import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { McSidebar, McSidebarClosed, McSidebarOpened } from './sidebar.component';


@NgModule({
    imports: [CommonModule],
    declarations: [
        McSidebarClosed,
        McSidebarOpened,
        McSidebar
    ],
    exports: [
        McSidebarClosed,
        McSidebarOpened,
        McSidebar
    ]
})
export class McSidebarModule {}
