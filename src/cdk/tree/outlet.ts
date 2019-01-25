import { ChangeDetectorRef, Directive, ViewContainerRef } from '@angular/core';


/**
 * Outlet for nested CdkNode. Put `[cdkTreeNodeOutlet]` on a tag to place children dataNodes
 * inside the outlet.
 */
@Directive({ selector: '[cdkTreeNodeOutlet]' })
export class CdkTreeNodeOutlet {
    constructor(public viewContainer: ViewContainerRef, public changeDetectorRef: ChangeDetectorRef) {}
}
