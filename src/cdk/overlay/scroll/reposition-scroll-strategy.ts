import { NgZone } from '@angular/core';
import { ScrollDispatcher, ViewportRuler } from '@ptsecurity/cdk/scrolling';
import { Subscription } from 'rxjs';

import { IOverlayReference } from '../overlay-reference';
import { isElementScrolledOutsideView } from '../position/scroll-clip';

import { IScrollStrategy, getMatScrollStrategyAlreadyAttachedError } from './scroll-strategy';


/**
 * Config options for the RepositionScrollStrategy.
 */
export interface IRepositionScrollStrategyConfig {
    /** Time in milliseconds to throttle the scroll events. */
    scrollThrottle?: number;

    /** Whether to close the overlay once the user has scrolled away completely. */
    autoClose?: boolean;
}

/**
 * Strategy that will update the element position as the user is scrolling.
 */
export class RepositionScrollStrategy implements IScrollStrategy {
    private _scrollSubscription: Subscription | null = null;
    private _overlayRef: IOverlayReference;

    constructor(
        private _scrollDispatcher: ScrollDispatcher,
        private _viewportRuler: ViewportRuler,
        private _ngZone: NgZone,
        private _config?: IRepositionScrollStrategyConfig) {
    }

    /** Attaches this scroll strategy to an overlay. */
    attach(overlayRef: IOverlayReference) {
        if (this._overlayRef) {
            throw getMatScrollStrategyAlreadyAttachedError();
        }

        this._overlayRef = overlayRef;
    }

    /** Enables repositioning of the attached overlay on scroll. */
    enable() {
        if (!this._scrollSubscription) {
            const throttle = this._config ? this._config.scrollThrottle : 0;

            this._scrollSubscription = this._scrollDispatcher.scrolled(throttle).subscribe(() => {
                this._overlayRef.updatePosition();

                // TODO(crisbeto): make `close` on by default once all components can handle it.
                if (this._config && this._config.autoClose) {
                    const overlayRect = this._overlayRef.overlayElement.getBoundingClientRect();
                    const { width, height } = this._viewportRuler.getViewportSize();

                    // TODO(crisbeto): include all ancestor scroll containers here once
                    // we have a way of exposing the trigger element to the scroll strategy.
                    const parentRects = [{ width, height, bottom: height, right: width, top: 0, left: 0 }];

                    if (isElementScrolledOutsideView(overlayRect, parentRects)) {
                        this.disable();
                        this._ngZone.run(() => this._overlayRef.detach());
                    }
                }
            });
        }
    }

    /** Disables repositioning of the attached overlay on scroll. */
    disable() {
        if (this._scrollSubscription) {
            this._scrollSubscription.unsubscribe();
            this._scrollSubscription = null;
        }
    }
}
