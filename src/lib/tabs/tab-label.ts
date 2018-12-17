import { Directive } from '@angular/core';
import { CdkPortal } from '@ptsecurity/cdk/portal';


/** Used to flag tab labels for use with the portal directive */
@Directive({
    selector: '[mc-tab-label], [mcTabLabel]'
})
export class McTabLabel extends CdkPortal {}

// TODO: workaround for https://github.com/angular/material2/issues/12760
(McTabLabel as any).ctorParameters = () => (CdkPortal as any).ctorParameters;
