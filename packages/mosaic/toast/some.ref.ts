import { ViewContainerRef } from '@angular/core';


export class SomeRef {
    constructor(
        private ref: ViewContainerRef
    ) {}

    close(id: number) {
        this.ref.detach(id);
        console.log(this.ref.length);
    }

    getRef() {
        console.log(this.ref);
        console.log(this);
    }
}
