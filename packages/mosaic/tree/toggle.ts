import { Directive } from '@angular/core';
import { CdkTreeNodeToggle } from '@ptsecurity/cdk/tree';


@Directive({
    selector: '[mcTreeNodeToggle]',
    host: {
        '(click)': 'toggle($event)'
    },
    providers: [{ provide: CdkTreeNodeToggle, useExisting: McTreeNodeToggle }]
})
export class McTreeNodeToggle<T> extends CdkTreeNodeToggle<T> {}
