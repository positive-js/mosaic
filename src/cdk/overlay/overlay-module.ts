import {NgModule, Provider} from '@angular/core';
import {BidiModule} from '@ptsecurity/cdk/bidi';
import {PortalModule} from '@ptsecurity/cdk/portal';
import {ScrollDispatchModule, VIEWPORT_RULER_PROVIDER} from '@ptsecurity/cdk/scrolling';

import {OVERLAY_KEYBOARD_DISPATCHER_PROVIDER} from './keyboard/overlay-keyboard-dispatcher';
import {Overlay} from './overlay';
import {OVERLAY_CONTAINER_PROVIDER} from './overlay-container';
import {
    CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY_PROVIDER,
    CdkConnectedOverlay,
    CdkOverlayOrigin
} from './overlay-directives';
import {OverlayPositionBuilder} from './position/overlay-position-builder';


@NgModule({
    imports: [BidiModule, PortalModule, ScrollDispatchModule],
    exports: [CdkConnectedOverlay, CdkOverlayOrigin, ScrollDispatchModule],
    declarations: [CdkConnectedOverlay, CdkOverlayOrigin],
    providers: [
        Overlay,
        CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY_PROVIDER
    ]
})
export class OverlayModule {}


/**
 * @deprecated Use `OverlayModule` instead.
 * @deletion-target 7.0.0
 */
export const OVERLAY_PROVIDERS: Provider[] = [
    Overlay,
    OverlayPositionBuilder,
    OVERLAY_KEYBOARD_DISPATCHER_PROVIDER,
    VIEWPORT_RULER_PROVIDER,
    OVERLAY_CONTAINER_PROVIDER,
    CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY_PROVIDER,
];
