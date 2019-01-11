import { NgModule } from '@angular/core';
import { BidiModule } from '@ptsecurity/cdk/bidi';
import { PlatformModule } from '@ptsecurity/cdk/platform';

import { CdkFixedSizeVirtualScroll } from './fixed-size-virtual-scroll';
import { CdkScrollable } from './scrollable';
import { CdkVirtualForOf } from './virtual-for-of';
import { CdkVirtualScrollViewport } from './virtual-scroll-viewport';


@NgModule({
    imports: [BidiModule, PlatformModule],
    exports: [
        BidiModule,
        CdkFixedSizeVirtualScroll,
        CdkScrollable,
        CdkVirtualForOf,
        CdkVirtualScrollViewport
    ],
    declarations: [
        CdkFixedSizeVirtualScroll,
        CdkScrollable,
        CdkVirtualForOf,
        CdkVirtualScrollViewport
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
