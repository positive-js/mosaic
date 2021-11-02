import { ChangeDetectorRef, Directive, ViewContainerRef } from '@angular/core';


@Directive({ selector: '[mcTreeNodeOutlet]' })
export class McTreeNodeOutlet {
    constructor(public viewContainer: ViewContainerRef, public changeDetectorRef: ChangeDetectorRef) {}
}
