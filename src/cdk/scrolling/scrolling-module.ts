import { NgModule } from '@angular/core';
import { BidiModule } from '@ptsecurity/cdk/bidi';
import { PlatformModule } from '@ptsecurity/cdk/platform';

import { CdkScrollable } from './scrollable';


@NgModule({
    imports: [BidiModule, PlatformModule],
    exports: [
        BidiModule,
        CdkScrollable
    ],
    declarations: [
        CdkScrollable
    ]
})
export class ScrollingModule {}


/**
 * @deprecated
 * @breaking-change
 */
@NgModule({
    imports: [ScrollingModule],
    exports: [ScrollingModule]
})
export class ScrollDispatchModule {}
