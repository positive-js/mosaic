import { Directive, Input } from '@angular/core';
import { CdkTreeNodeDef } from '@ptsecurity/cdk/tree';


@Directive({
    selector: '[mcTreeNodeDef]',
    inputs: ['when: mcTreeNodeDefWhen'],
    providers: [{ provide: CdkTreeNodeDef, useExisting: McTreeNodeDef }]
})
export class McTreeNodeDef<T> extends CdkTreeNodeDef<T> {
    @Input('mcTreeNode') data: T;
}
