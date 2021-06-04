import { CdkPortal } from '@angular/cdk/portal';
import { Directive, InjectionToken } from '@angular/core';


export const MC_TAB_LABEL = new InjectionToken<McTabLabel>('McTabLabel');

/** Used to flag tab labels for use with the portal directive */
@Directive({
    selector: '[mc-tab-label], [mcTabLabel]',
    providers: [{provide: MC_TAB_LABEL, useExisting: McTabLabel}]
})
export class McTabLabel extends CdkPortal {}
