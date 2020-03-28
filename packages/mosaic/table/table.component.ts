import { Directive } from '@angular/core';


@Directive({
    selector: 'table[mc-table]',
    host: {
        class: 'mc-table'
    }
})
export class McTable {}

