import { Directive, Input } from '@angular/core';


let nextUniqueId = 0;

@Directive({
    selector: 'mc-hint',
    host: {
        class: 'mc-hint',
        '[attr.id]': 'id'
    }
})
export class McHint {
    @Input() id: string = `mc-hint-${nextUniqueId++}`;
}
