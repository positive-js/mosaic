import { DOCUMENT } from '@angular/common';
import { ElementRef, Inject, Injectable, Optional } from '@angular/core';
import { Platform } from '@ptsecurity/cdk/platform';
import { ViewportRuler } from '@ptsecurity/cdk/scrolling';

import { IOriginConnectionPosition, IOverlayConnectionPosition } from './connected-position';
import { ConnectedPositionStrategy } from './connected-position-strategy';
import { FlexibleConnectedPositionStrategy } from './flexible-connected-position-strategy';
import { GlobalPositionStrategy } from './global-position-strategy';


/** Builder for overlay position strategy. */
@Injectable({ providedIn: 'root' })
export class OverlayPositionBuilder {
    constructor(
        private _viewportRuler: ViewportRuler,
        @Inject(DOCUMENT) private _document: any,
        // @deletion-target 7.0.0 `_platform` parameter to be made required.
        @Optional() private _platform?: Platform) {
    }

    /**
     * Creates a global position strategy.
     */
    global(): GlobalPositionStrategy {
        return new GlobalPositionStrategy();
    }

    /**
     * Creates a relative position strategy.
     * @param elementRef
     * @param originPos
     * @param overlayPos
     * @deprecated Use `flexibleConnectedTo` instead.
     * @deletion-target 7.0.0
     */
    connectedTo(
        elementRef: ElementRef,
        originPos: IOriginConnectionPosition,
        overlayPos: IOverlayConnectionPosition): ConnectedPositionStrategy {

        return new ConnectedPositionStrategy(originPos, overlayPos, elementRef, this._viewportRuler,
            this._document);
    }

    /**
     * Creates a flexible position strategy.
     * @param elementRef
     */
    flexibleConnectedTo(elementRef: ElementRef | HTMLElement): FlexibleConnectedPositionStrategy {
        return new FlexibleConnectedPositionStrategy(elementRef, this._viewportRuler, this._document,
            this._platform);
    }

}
