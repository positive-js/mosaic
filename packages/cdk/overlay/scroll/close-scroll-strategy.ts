import { NgZone } from '@angular/core';
import { ScrollDispatcher, ViewportRuler } from '@ptsecurity/cdk/scrolling';
import { Subscription } from 'rxjs';

import { IOverlayReference } from '../overlay-reference';

import { IScrollStrategy, getMatScrollStrategyAlreadyAttachedError } from './scroll-strategy';


/**
 * Config options for the CloseScrollStrategy.
 */
export interface ICloseScrollStrategyConfig {
    /** Amount of pixels the user has to scroll before the overlay is closed. */
    threshold?: number;
}

/**
 * Strategy that will close the overlay as soon as the user starts scrolling.
 */
export class CloseScrollStrategy implements IScrollStrategy {
    private _scrollSubscription: Subscription | null = null;
    private _overlayRef: IOverlayReference;
    private _initialScrollPosition: number;

    constructor(
        private _scrollDispatcher: ScrollDispatcher,
        private _ngZone: NgZone,
        private _viewportRuler: ViewportRuler,
        private _config?: ICloseScrollStrategyConfig) {
    }

    /** Attaches this scroll strategy to an overlay. */
    attach(overlayRef: IOverlayReference) {
        if (this._overlayRef) {
            throw getMatScrollStrategyAlreadyAttachedError();
        }

        this._overlayRef = overlayRef;
    }

    /** Enables the closing of the attached overlay on scroll. */
    enable() {
        if (this._scrollSubscription) {
            return;
        }

        const stream = this._scrollDispatcher.scrolled(0);

        if (this._config && this._config.threshold && this._config.threshold > 1) {
            this._initialScrollPosition = this._viewportRuler.getViewportScrollPosition().top;

            this._scrollSubscription = stream.subscribe(() => {
                const scrollPosition = this._viewportRuler.getViewportScrollPosition().top;

                if (Math.abs(scrollPosition - this._initialScrollPosition) > this._config!.threshold!) { //tslint:disable-line
                    this._detach();
                } else {
                    this._overlayRef.updatePosition();
                }
            });
        } else {
            this._scrollSubscription = stream.subscribe(this._detach);
        }
    }

    /** Disables the closing the attached overlay on scroll. */
    disable() {
        if (this._scrollSubscription) {
            this._scrollSubscription.unsubscribe();
            this._scrollSubscription = null;
        }
    }

    /** Detaches the overlay ref and disables the scroll strategy. */
    private _detach = () => {
        this.disable();

        if (this._overlayRef.hasAttached()) {
            this._ngZone.run(() => this._overlayRef.detach());
        }
    }
}
