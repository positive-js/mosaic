import { ViewContainerRef, ViewRef } from '@angular/core';


export class SomeRef {
    constructor(
        private ref: ViewContainerRef
    ) {}

    close(viewRef: ViewRef) {
        const viewRefIndex = this.ref.indexOf(viewRef);
        this.ref.detach(viewRefIndex);
    }
}
