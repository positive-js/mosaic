import { Directive, Input } from '@angular/core';

import { CdkTreeNodeDef } from '@ptsecurity/cdk/tree';


/**
 * Wrapper for the CdkTree node definition with Material design styles.
 */
@Directive({
    selector: '[mcTreeNodeDef]',
    inputs: ['when: mcTreeNodeDefWhen'],
    providers: [{ provide: CdkTreeNodeDef, useExisting: McTreeNodeDef }]
})
export class McTreeNodeDef<T> extends CdkTreeNodeDef<T> {
    @Input('mcTreeNode') data: T;
}
