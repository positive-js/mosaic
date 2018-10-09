import { ElementRef } from '@angular/core';
import { coerceCssPixelValue } from '@ptsecurity/cdk/coercion';
import { Platform } from '@ptsecurity/cdk/platform';
import { ViewportRuler, CdkScrollable } from '@ptsecurity/cdk/scrolling';
import { Observable, Subscription, Subject } from 'rxjs';

import { IOverlayReference } from '../overlay-reference';

import {
    ConnectedOverlayPositionChange,
    ConnectionPositionPair,
    ScrollingVisibility,
    validateHorizontalPosition,
    validateVerticalPosition
} from './connected-position';
import { IPositionStrategy } from './position-strategy';
import { isElementScrolledOutsideView, isElementClippedByScrolling } from './scroll-clip';


/**
 * A strategy for positioning overlays. Using this strategy, an overlay is given an
 * implicit position relative some origin element. The relative position is defined in terms of
 * a point on the origin element that is connected to a point on the overlay element. For example,
 * a basic dropdown is connecting the bottom-left corner of the origin to the top-left corner
 * of the overlay.
 */
export class FlexibleConnectedPositionStrategy implements IPositionStrategy {

    /** Ordered list of preferred positions, from most to least desirable. */
    _preferredPositions: ConnectionPositionPair[] = [];

    /** Observable sequence of position changes. */
    positionChanges: Observable<ConnectedOverlayPositionChange> = Observable.create((observer) => {
        const subscription = this._positionChanges.subscribe(observer);
        this._positionChangeSubscriptions++;

        return () => {
            subscription.unsubscribe();
            this._positionChangeSubscriptions--;
        };
    });

    /** Ordered list of preferred positions, from most to least desirable. */
    get positions() {
        return this._preferredPositions;
    }

    /** The overlay to which this strategy is attached. */
    private _overlayRef: IOverlayReference;

    /** Whether we're performing the very first positioning of the overlay. */
    private _isInitialRender = true;

    /** Last size used for the bounding box. Used to avoid resizing the overlay after open. */
    private _lastBoundingBoxSize = { width: 0, height: 0 };

    /** Whether the overlay was pushed in a previous positioning. */
    private _isPushed = false;

    /** Whether the overlay can be pushed on-screen on the initial open. */
    private _canPush = true;

    /** Whether the overlay can grow via flexible width/height after the initial open. */
    private _growAfterOpen = false;

    /** Whether the overlay's width and height can be constrained to fit within the viewport. */
    private _hasFlexibleDimensions = true;

    /** Whether the overlay position is locked. */
    private _positionLocked = false;

    /** Cached origin dimensions */
    private _originRect: ClientRect;

    /** Cached overlay dimensions */
    private _overlayRect: ClientRect;

    /** Cached viewport dimensions */
    private _viewportRect: ClientRect;

    /** Amount of space that must be maintained between the overlay and the edge of the viewport. */
    private _viewportMargin = 0;

    /** The Scrollable containers used to check scrollable view properties on position change. */
    private scrollables: CdkScrollable[] = [];

    /** The origin element against which the overlay will be positioned. */
    private _origin: HTMLElement;

    /** The overlay pane element. */
    private _pane: HTMLElement;

    /** Whether the strategy has been disposed of already. */
    private _isDisposed: boolean;

    /**
     * Parent element for the overlay panel used to constrain the overlay panel's size to fit
     * within the viewport.
     */
    private _boundingBox: HTMLElement | null;

    /** The last position to have been calculated as the best fit position. */
    private _lastPosition: IConnectedPosition | null;

    /** Subject that emits whenever the position changes. */
    private _positionChanges = new Subject<ConnectedOverlayPositionChange>();

    /** Subscription to viewport size changes. */
    private _resizeSubscription = Subscription.EMPTY;

    /** Default offset for the overlay along the x axis. */
    private _offsetX = 0;

    /** Default offset for the overlay along the y axis. */
    private _offsetY = 0;

    /** Selector to be used when finding the elements on which to set the transform origin. */
    private _transformOriginSelector: string;

    /** Amount of subscribers to the `positionChanges` stream. */
    private _positionChangeSubscriptions = 0;

    constructor(
        connectedTo: ElementRef | HTMLElement,
        private _viewportRuler: ViewportRuler,
        private _document: Document,
        // @deletion-target 7.0.0 `_platform` parameter to be made required.
        private _platform?: Platform) {
        this.setOrigin(connectedTo);
    }

    /** Attaches this position strategy to an overlay. */
    attach(overlayRef: IOverlayReference): void {
        if (this._overlayRef && overlayRef !== this._overlayRef) {
            throw Error('This position strategy is already attached to an overlay');
        }

        this._validatePositions();

        overlayRef.hostElement.classList.add('cdk-overlay-connected-position-bounding-box');

        this._overlayRef = overlayRef;
        this._boundingBox = overlayRef.hostElement;
        this._pane = overlayRef.overlayElement;
        this._resizeSubscription.unsubscribe();
        this._resizeSubscription = this._viewportRuler.change().subscribe(() => this.apply());
    }

    /**
     * Updates the position of the overlay element, using whichever preferred position relative
     * to the origin best fits on-screen.
     *
     * The selection of a position goes as follows:
     *  - If any positions fit completely within the viewport as-is,
     *      choose the first position that does so.
     *  - If flexible dimensions are enabled and at least one satifies the given minimum width/height,
     *      choose the position with the greatest available size modified by the positions' weight.
     *  - If pushing is enabled, take the position that went off-screen the least and push it
     *      on-screen.
     *  - If none of the previous criteria were met, use the position that goes off-screen the least.
     * @docs-private
     */
    apply(): void {
        // We shouldn't do anything if the strategy was disposed or we're on the server.
        if (this._isDisposed || (this._platform && !this._platform.isBrowser)) {
            return;
        }
        // If the position has been applied already (e.g. when the overlay was opened) and the
        // consumer opted into locking in the position, re-use the old position, in order to
        // prevent the overlay from jumping around.
        if (!this._isInitialRender && this._positionLocked && this._lastPosition) {
            this.reapplyLastPosition();

            return;
        }
        this._resetOverlayElementStyles();
        this._resetBoundingBoxStyles();
        // We need the bounding rects for the origin and the overlay to determine how to position
        // the overlay relative to the origin.
        // We use the viewport rect to determine whether a position would go off-screen.
        this._viewportRect = this._getNarrowedViewportRect();
        this._originRect = this._origin.getBoundingClientRect();
        this._overlayRect = this._pane.getBoundingClientRect();

        const originRect = this._originRect;
        const overlayRect = this._overlayRect;
        const viewportRect = this._viewportRect;
        // Positions where the overlay will fit with flexible dimensions.
        const flexibleFits: IFlexibleFit[] = [];
        // Fallback if none of the preferred positions fit within the viewport.
        let fallback: IFallbackPosition | undefined;

        // Go through each of the preferred positions looking for a good fit.
        // If a good fit is found, it will be applied immediately.
        for (let pos of this._preferredPositions) { //tslint:disable-line
            // Get the exact (x, y) coordinate for the point-of-origin on the origin element.
            let originPoint = this._getOriginPoint(originRect, pos); //tslint:disable-line
            // From that point-of-origin, get the exact (x, y) coordinate for the top-left corner of the
            // overlay in this position. We use the top-left corner for calculations and later translate
            // this into an appropriate (top, left, bottom, right) style.
            let overlayPoint = this._getOverlayPoint(originPoint, overlayRect, pos); //tslint:disable-line
            // Calculate how well the overlay would fit into the viewport with this point.
            let overlayFit = this._getOverlayFit(overlayPoint, overlayRect, viewportRect, pos); //tslint:disable-line
            // If the overlay, without any further work, fits into the viewport, use this position.
            if (overlayFit.isCompletelyWithinViewport) {
                this._isPushed = false;
                this._applyPosition(pos, originPoint);

                return;
            }
            // If the overlay has flexible dimensions, we can use this position
            // so long as there's enough space for the minimum dimensions.
            if (this._canFitWithFlexibleDimensions(overlayFit, overlayPoint, viewportRect)) {
                // Save positions where the overlay will fit with flexible dimensions. We will use these
                // if none of the positions fit *without* flexible dimensions.
                flexibleFits.push({
                    position: pos,
                    origin: originPoint,
                    overlayRect,
                    boundingBoxRect: this._calculateBoundingBoxRect(originPoint, pos)
                });

                continue;
            }

            // If the current preferred position does not fit on the screen, remember the position
            // if it has more visible area on-screen than we've seen and move onto the next preferred
            // position.
            if (!fallback || fallback.overlayFit.visibleArea < overlayFit.visibleArea) {
                fallback = { overlayFit, overlayPoint, originPoint, position: pos, overlayRect };
            }
        }

        // If there are any positions where the overlay would fit with flexible dimensions, choose the
        // one that has the greatest area available modified by the position's weight
        if (flexibleFits.length) {
            let bestFit: IFlexibleFit | null = null;
            let bestScore = -1;
            for (const fit of flexibleFits) {
                const score =
                    fit.boundingBoxRect.width * fit.boundingBoxRect.height * (fit.position.weight || 1);
                if (score > bestScore) {
                    bestScore = score;
                    bestFit = fit;
                }
            }

            this._isPushed = false;
            this._applyPosition(bestFit!.position, bestFit!.origin); //tslint:disable-line

            return;
        }

        // When none of the preferred positions fit within the viewport, take the position
        // that went off-screen the least and attempt to push it on-screen.
        if (this._canPush) {
            this._isPushed = true;
            this._applyPosition(fallback!.position, fallback!.originPoint); //tslint:disable-line

            return;
        }

        // All options for getting the overlay within the viewport have been exhausted, so go with the
        // position that went off-screen the least.
        this._applyPosition(fallback!.position, fallback!.originPoint); //tslint:disable-line
    }

    detach() {
        this._resizeSubscription.unsubscribe();
    }

    /** Cleanup after the element gets destroyed. */
    dispose() {
        if (!this._isDisposed) {
            this.detach();
            this._boundingBox = null;
            this._positionChanges.complete();
            this._isDisposed = true;
        }
    }

    /**
     * This re-aligns the overlay element with the trigger in its last calculated position,
     * even if a position higher in the "preferred positions" list would now fit. This
     * allows one to re-align the panel without changing the orientation of the panel.
     */
    reapplyLastPosition(): void {
        if (!this._isDisposed && (!this._platform || this._platform.isBrowser)) {
            this._originRect = this._origin.getBoundingClientRect();
            this._overlayRect = this._pane.getBoundingClientRect();
            this._viewportRect = this._getNarrowedViewportRect();

            const lastPosition = this._lastPosition || this._preferredPositions[0];
            const originPoint = this._getOriginPoint(this._originRect, lastPosition);

            this._applyPosition(lastPosition, originPoint);
        }
    }

    /**
     * Sets the list of Scrollable containers that host the origin element so that
     * on reposition we can evaluate if it or the overlay has been clipped or outside view. Every
     * Scrollable must be an ancestor element of the strategy's origin element.
     */
    withScrollableContainers(scrollables: CdkScrollable[]) {
        this.scrollables = scrollables;
    }

    /**
     * Adds new preferred positions.
     * @param positions List of positions options for this overlay.
     */
    withPositions(positions: IConnectedPosition[]): this {
        this._preferredPositions = positions;

        // If the last calculated position object isn't part of the positions anymore, clear
        // it in order to avoid it being picked up if the consumer tries to re-apply.
        if (positions.indexOf(this._lastPosition!) === -1) { //tslint:disable-line
            this._lastPosition = null;
        }

        this._validatePositions();

        return this;
    }

    /**
     * Sets a minimum distance the overlay may be positioned to the edge of the viewport.
     * @param margin Required margin between the overlay and the viewport edge in pixels.
     */
    withViewportMargin(margin: number): this {
        this._viewportMargin = margin;

        return this;
    }

    /** Sets whether the overlay's width and height can be constrained to fit within the viewport. */
    withFlexibleDimensions(flexibleDimensions = true): this {
        this._hasFlexibleDimensions = flexibleDimensions;

        return this;
    }

    /** Sets whether the overlay can grow after the initial open via flexible width/height. */
    withGrowAfterOpen(growAfterOpen = true): this {
        this._growAfterOpen = growAfterOpen;

        return this;
    }

    /** Sets whether the overlay can be pushed on-screen if none of the provided positions fit. */
    withPush(canPush = true): this {
        this._canPush = canPush;

        return this;
    }

    /**
     * Sets whether the overlay's position should be locked in after it is positioned
     * initially. When an overlay is locked in, it won't attempt to reposition itself
     * when the position is re-applied (e.g. when the user scrolls away).
     * @param isLocked Whether the overlay should locked in.
     */
    withLockedPosition(isLocked = true): this {
        this._positionLocked = isLocked;

        return this;
    }

    /**
     * Sets the origin element, relative to which to position the overlay.
     * @param origin Reference to the new origin element.
     */
    setOrigin(origin: ElementRef | HTMLElement): this {
        this._origin = origin instanceof ElementRef ? origin.nativeElement : origin;

        return this;
    }

    /**
     * Sets the default offset for the overlay's connection point on the x-axis.
     * @param offset New offset in the X axis.
     */
    withDefaultOffsetX(offset: number): this {
        this._offsetX = offset;

        return this;
    }

    /**
     * Sets the default offset for the overlay's connection point on the y-axis.
     * @param offset New offset in the Y axis.
     */
    withDefaultOffsetY(offset: number): this {
        this._offsetY = offset;

        return this;
    }

    /**
     * Configures that the position strategy should set a `transform-origin` on some elements
     * inside the overlay, depending on the current position that is being applied. This is
     * useful for the cases where the origin of an animation can change depending on the
     * alignment of the overlay.
     * @param selector CSS selector that will be used to find the target
     *    elements onto which to set the transform origin.
     */
    withTransformOriginOn(selector: string): this {
        this._transformOriginSelector = selector;

        return this;
    }

    /**
     * Gets the (x, y) coordinate of a connection point on the origin based on a relative position.
     */
    private _getOriginPoint(originRect: ClientRect, pos: IConnectedPosition): IPoint {
        let x: number;
        if (pos.originX === 'center') {
            // Note: when centering we should always use the `left`
            // offset, otherwise the position will be wrong in RTL.
            x = originRect.left + (originRect.width / 2); //tslint:disable-line
        } else {
            const startX = this._isRtl() ? originRect.right : originRect.left;
            const endX = this._isRtl() ? originRect.left : originRect.right;
            x = pos.originX === 'start' ? startX : endX;
        }

        let y: number;
        if (pos.originY === 'center') {
            y = originRect.top + (originRect.height / 2); //tslint:disable-line
        } else {
            y = pos.originY === 'top' ? originRect.top : originRect.bottom;
        }

        return { x, y };
    }


    /**
     * Gets the (x, y) coordinate of the top-left corner of the overlay given a given position and
     * origin point to which the overlay should be connected.
     */
    private _getOverlayPoint( //tslint:disable-line
        originPoint: IPoint,
        overlayRect: ClientRect,
        pos: IConnectedPosition): IPoint {

        // Calculate the (overlayStartX, overlayStartY), the start of the
        // potential overlay position relative to the origin point.
        let overlayStartX: number;
        if (pos.overlayX === 'center') {
            overlayStartX = -overlayRect.width / 2; //tslint:disable-line
        } else if (pos.overlayX === 'start') {
            overlayStartX = this._isRtl() ? -overlayRect.width : 0;
        } else {
            overlayStartX = this._isRtl() ? 0 : -overlayRect.width;
        }

        let overlayStartY: number;
        if (pos.overlayY === 'center') {
            overlayStartY = -overlayRect.height / 2; //tslint:disable-line
        } else {
            overlayStartY = pos.overlayY === 'top' ? 0 : -overlayRect.height;
        }

        // The (x, y) coordinates of the overlay.
        return {
            x: originPoint.x + overlayStartX,
            y: originPoint.y + overlayStartY
        };
    }

    /** Gets how well an overlay at the given point will fit within the viewport. */
    private _getOverlayFit(point: IPoint, overlay: ClientRect, viewport: ClientRect,
                           position: IConnectedPosition): IOverlayFit {

        let { x, y } = point;
        let offsetX = this._getOffset(position, 'x'); //tslint:disable-line
        let offsetY = this._getOffset(position, 'y'); //tslint:disable-line

        // Account for the offsets since they could push the overlay out of the viewport.
        if (offsetX) {
            x += offsetX;
        }

        if (offsetY) {
            y += offsetY;
        }

        // How much the overlay would overflow at this position, on each side.
        let leftOverflow = 0 - x; //tslint:disable-line
        let rightOverflow = (x + overlay.width) - viewport.width; //tslint:disable-line
        let topOverflow = 0 - y; //tslint:disable-line
        let bottomOverflow = (y + overlay.height) - viewport.height; //tslint:disable-line

        // Visible parts of the element on each axis.
        let visibleWidth = this._subtractOverflows(overlay.width, leftOverflow, rightOverflow); //tslint:disable-line
        let visibleHeight = this._subtractOverflows(overlay.height, topOverflow, bottomOverflow); //tslint:disable-line
        let visibleArea = visibleWidth * visibleHeight; //tslint:disable-line

        return {
            visibleArea,
            isCompletelyWithinViewport: (overlay.width * overlay.height) === visibleArea,
            fitsInViewportVertically: visibleHeight === overlay.height,
            fitsInViewportHorizontally: visibleWidth === overlay.width
        };
    }

    /**
     * Whether the overlay can fit within the viewport when it may resize either its width or height.
     * @param fit How well the overlay fits in the viewport at some position.
     * @param point The (x, y) coordinates of the overlat at some position.
     * @param viewport The geometry of the viewport.
     */
    private _canFitWithFlexibleDimensions(fit: IOverlayFit, point: IPoint, viewport: ClientRect) {
        if (this._hasFlexibleDimensions) {
            const availableHeight = viewport.bottom - point.y;
            const availableWidth = viewport.right - point.x;
            const minHeight = this._overlayRef.getConfig().minHeight;
            const minWidth = this._overlayRef.getConfig().minWidth;

            const verticalFit = fit.fitsInViewportVertically ||
                (minHeight != null && minHeight <= availableHeight);
            const horizontalFit = fit.fitsInViewportHorizontally ||
                (minWidth != null && minWidth <= availableWidth);

            return verticalFit && horizontalFit;
        }
    }

    /**
     * Gets the point at which the overlay can be "pushed" on-screen. If the overlay is larger than
     * the viewport, the top-left corner will be pushed on-screen (with overflow occuring on the
     * right and bottom).
     *
     * @param start The starting point from which the overlay is pushed.
     * @param overlay The overlay dimensions.
     * @returns The point at which to position the overlay after pushing. This is effectively a new
     *     originPoint.
     */
    private _pushOverlayOnScreen(start: IPoint, overlay: ClientRect): IPoint {
        const viewport = this._viewportRect;

        // Determine how much the overlay goes outside the viewport on each side, which we'll use to
        // decide which direction to push it.
        const overflowRight = Math.max(start.x + overlay.width - viewport.right, 0);
        const overflowBottom = Math.max(start.y + overlay.height - viewport.bottom, 0);
        const overflowTop = Math.max(viewport.top - start.y, 0);
        const overflowLeft = Math.max(viewport.left - start.x, 0);

        // Amount by which to push the overlay in each direction such that it remains on-screen.
        let pushX, pushY = 0; //tslint:disable-line

        // If the overlay fits completely within the bounds of the viewport, push it from whichever
        // direction is goes off-screen. Otherwise, push the top-left corner such that its in the
        // viewport and allow for the trailing end of the overlay to go out of bounds.
        if (overlay.width <= viewport.width) {
            pushX = overflowLeft || -overflowRight;
        } else {
            pushX = viewport.left - start.x;
        }

        if (overlay.height <= viewport.height) {
            pushY = overflowTop || -overflowBottom;
        } else {
            pushY = viewport.top - start.y;
        }

        return {
            x: start.x + pushX,
            y: start.y + pushY
        };
    }

    /**
     * Applies a computed position to the overlay and emits a position change.
     * @param position The position preference
     * @param originPoint The point on the origin element where the overlay is connected.
     */
    private _applyPosition(position: IConnectedPosition, originPoint: IPoint) {
        this._setTransformOrigin(position);
        this._setOverlayElementStyles(originPoint, position);
        this._setBoundingBoxStyles(originPoint, position);

        // Save the last connected position in case the position needs to be re-calculated.
        this._lastPosition = position;

        // Notify that the position has been changed along with its change properties.
        // We only emit if we've got any subscriptions, because the scroll visibility
        // calculcations can be somewhat expensive.
        if (this._positionChangeSubscriptions > 0) {
            const scrollableViewProperties = this._getScrollVisibility();
            const changeEvent = new ConnectedOverlayPositionChange(position, scrollableViewProperties);
            this._positionChanges.next(changeEvent);
        }

        this._isInitialRender = false;
    }

    /** Sets the transform origin based on the configured selector and the passed-in position.  */
    private _setTransformOrigin(position: IConnectedPosition) {
        if (!this._transformOriginSelector) { return; }

        const elements: NodeListOf<HTMLElement> =
            this._boundingBox!.querySelectorAll(this._transformOriginSelector); //tslint:disable-line
        let xOrigin: 'left' | 'right' | 'center';
        let yOrigin: 'top' | 'bottom' | 'center' = position.overlayY; //tslint:disable-line

        if (position.overlayX === 'center') {
            xOrigin = 'center';
        } else if (this._isRtl()) {
            xOrigin = position.overlayX === 'start' ? 'right' : 'left';
        } else {
            xOrigin = position.overlayX === 'start' ? 'left' : 'right';
        }

        for (let i = 0; i < elements.length; i++) { //tslint:disable-line
            elements[i].style.transformOrigin = `${xOrigin} ${yOrigin}`;
        }
    }

    /**
     * Gets the position and size of the overlay's sizing container.
     *
     * This method does no measuring and applies no styles so that we can cheaply compute the
     * bounds for all positions and choose the best fit based on these results.
     */
    private _calculateBoundingBoxRect(origin: IPoint, position: IConnectedPosition): IBoundingBoxRect {
        const viewport = this._viewportRect;
        const isRtl = this._isRtl();
        let height, top, bottom; //tslint:disable-line

        if (position.overlayY === 'top') {
            // Overlay is opening "downward" and thus is bound by the bottom viewport edge.
            top = origin.y;
            height = viewport.bottom - origin.y;
        } else if (position.overlayY === 'bottom') {
            // Overlay is opening "upward" and thus is bound by the top viewport edge. We need to add
            // the viewport margin back in, because the viewport rect is narrowed down to remove the
            // margin, whereas the `origin` position is calculated based on its `ClientRect`.
            bottom = viewport.height - origin.y + this._viewportMargin * 2; //tslint:disable-line
            height = viewport.height - bottom + this._viewportMargin;
        } else {
            // If neither top nor bottom, it means that the overlay
            // is vertically centered on the origin point.
            const smallestDistanceToViewportEdge =
                Math.min(viewport.bottom - origin.y, origin.y - viewport.left);
            const previousHeight = this._lastBoundingBoxSize.height;

            height = smallestDistanceToViewportEdge * 2; //tslint:disable-line
            top = origin.y - smallestDistanceToViewportEdge;

            if (height > previousHeight && !this._isInitialRender && !this._growAfterOpen) {
                top = origin.y - (previousHeight / 2); //tslint:disable-line
            }
        }

        // The overlay is opening 'right-ward' (the content flows to the right).
        const isBoundedByRightViewportEdge =
            (position.overlayX === 'start' && !isRtl) ||
            (position.overlayX === 'end' && isRtl);

        // The overlay is opening 'left-ward' (the content flows to the left).
        const isBoundedByLeftViewportEdge =
            (position.overlayX === 'end' && !isRtl) ||
            (position.overlayX === 'start' && isRtl);

        let width, left, right; //tslint:disable-line

        if (isBoundedByLeftViewportEdge) {
            right = viewport.right - origin.x + this._viewportMargin;
            width = origin.x - viewport.left;
        } else if (isBoundedByRightViewportEdge) {
            left = origin.x;
            width = viewport.right - origin.x;
        } else {
            // If neither start nor end, it means that the overlay
            // is horizontally centered on the origin point.
            const smallestDistanceToViewportEdge =
                Math.min(viewport.right - origin.x, origin.x - viewport.top);
            const previousWidth = this._lastBoundingBoxSize.width;

            width = smallestDistanceToViewportEdge * 2; //tslint:disable-line
            left = origin.x - smallestDistanceToViewportEdge;

            if (width > previousWidth && !this._isInitialRender && !this._growAfterOpen) {
                left = origin.x - (previousWidth / 2); //tslint:disable-line
            }
        }

        return { top, left, bottom, right, width, height };
    }

    /**
     * Sets the position and size of the overlay's sizing wrapper. The wrapper is positioned on the
     * origin's connection point and stetches to the bounds of the viewport.
     *
     * @param origin The point on the origin element where the overlay is connected.
     * @param position The position preference
     */
    private _setBoundingBoxStyles(origin: IPoint, position: IConnectedPosition): void {
        const boundingBoxRect = this._calculateBoundingBoxRect(origin, position);

        // It's weird if the overlay *grows* while scrolling, so we take the last size into account
        // when applying a new size.
        if (!this._isInitialRender && !this._growAfterOpen) {
            boundingBoxRect.height = Math.min(boundingBoxRect.height, this._lastBoundingBoxSize.height);
            boundingBoxRect.width = Math.min(boundingBoxRect.width, this._lastBoundingBoxSize.width);
        }

        const styles = {} as CSSStyleDeclaration;

        if (this._hasExactPosition()) {
            styles.top = styles.left = '0';
            styles.bottom = styles.right = '';
            styles.width = styles.height = '100%';
        } else {
            const maxHeight = this._overlayRef.getConfig().maxHeight;
            const maxWidth = this._overlayRef.getConfig().maxWidth;

            styles.height = coerceCssPixelValue(boundingBoxRect.height);
            styles.top = coerceCssPixelValue(boundingBoxRect.top);
            styles.bottom = coerceCssPixelValue(boundingBoxRect.bottom);
            styles.width = coerceCssPixelValue(boundingBoxRect.width);
            styles.left = coerceCssPixelValue(boundingBoxRect.left);
            styles.right = coerceCssPixelValue(boundingBoxRect.right);

            // Push the pane content towards the proper direction.
            if (position.overlayX === 'center') {
                styles.alignItems = 'center';
            } else {
                styles.alignItems = position.overlayX === 'end' ? 'flex-end' : 'flex-start';
            }

            if (position.overlayY === 'center') {
                styles.justifyContent = 'center';
            } else {
                styles.justifyContent = position.overlayY === 'bottom' ? 'flex-end' : 'flex-start';
            }

            if (maxHeight) {
                styles.maxHeight = coerceCssPixelValue(maxHeight);
            }

            if (maxWidth) {
                styles.maxWidth = coerceCssPixelValue(maxWidth);
            }
        }

        this._lastBoundingBoxSize = boundingBoxRect;

        extendStyles(this._boundingBox!.style, styles); //tslint:disable-line
    }

    /** Resets the styles for the bounding box so that a new positioning can be computed. */
    private _resetBoundingBoxStyles() {
        extendStyles(this._boundingBox!.style, { //tslint:disable-line
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            height: '',
            width: '',
            alignItems: '',
            justifyContent: ''
        } as CSSStyleDeclaration);
    }

    /** Resets the styles for the overlay pane so that a new positioning can be computed. */
    private _resetOverlayElementStyles() {
        extendStyles(this._pane.style, {
            top: '',
            left: '',
            bottom: '',
            right: '',
            position: ''
        } as CSSStyleDeclaration);
    }

    /** Sets positioning styles to the overlay element. */
    private _setOverlayElementStyles(originPoint: IPoint, position: IConnectedPosition): void {
        const styles = {} as CSSStyleDeclaration;

        if (this._hasExactPosition()) {
            extendStyles(styles, this._getExactOverlayY(position, originPoint));
            extendStyles(styles, this._getExactOverlayX(position, originPoint));
        } else {
            styles.position = 'static';
        }

        // Use a transform to apply the offsets. We do this because the `center` positions rely on
        // being in the normal flex flow and setting a `top` / `left` at all will completely throw
        // off the position. We also can't use margins, because they won't have an effect in some
        // cases where the element doesn't have anything to "push off of". Finally, this works
        // better both with flexible and non-flexible positioning.
        let transformString = '';
        let offsetX = this._getOffset(position, 'x'); //tslint:disable-line
        let offsetY = this._getOffset(position, 'y'); //tslint:disable-line

        if (offsetX) {
            transformString += `translateX(${offsetX}px) `;
        }

        if (offsetY) {
            transformString += `translateY(${offsetY}px)`;
        }

        styles.transform = transformString.trim();

        // If a maxWidth or maxHeight is specified on the overlay, we remove them. We do this because
        // we need these values to both be set to "100%" for the automatic flexible sizing to work.
        // The maxHeight and maxWidth are set on the boundingBox in order to enforce the constraint.
        if (this._hasFlexibleDimensions && this._overlayRef.getConfig().maxHeight) {
            styles.maxHeight = '';
        }

        if (this._hasFlexibleDimensions && this._overlayRef.getConfig().maxWidth) {
            styles.maxWidth = '';
        }

        extendStyles(this._pane.style, styles);
    }

    /** Gets the exact top/bottom for the overlay when not using flexible sizing or when pushing. */
    private _getExactOverlayY(position: IConnectedPosition, originPoint: IPoint) {
        // Reset any existing styles. This is necessary in case the
        // preferred position has changed since the last `apply`.
        let styles = { top: null, bottom: null } as CSSStyleDeclaration; //tslint:disable-line
        let overlayPoint = this._getOverlayPoint(originPoint, this._overlayRect, position);

        if (this._isPushed) {
            overlayPoint = this._pushOverlayOnScreen(overlayPoint, this._overlayRect);
        }

        // We want to set either `top` or `bottom` based on whether the overlay wants to appear
        // above or below the origin and the direction in which the element will expand.
        if (position.overlayY === 'bottom') {
            // When using `bottom`, we adjust the y position such that it is the distance
            // from the bottom of the viewport rather than the top.
            const documentHeight = this._document.documentElement!.clientHeight;
            styles.bottom = `${documentHeight - (overlayPoint.y + this._overlayRect.height)}px`;
        } else {
            styles.top = coerceCssPixelValue(overlayPoint.y);
        }

        return styles;
    }

    /** Gets the exact left/right for the overlay when not using flexible sizing or when pushing. */
    private _getExactOverlayX(position: IConnectedPosition, originPoint: IPoint) {
        // Reset any existing styles. This is necessary in case the preferred position has
        // changed since the last `apply`.
        let styles = { left: null, right: null } as CSSStyleDeclaration; //tslint:disable-line
        let overlayPoint = this._getOverlayPoint(originPoint, this._overlayRect, position);

        if (this._isPushed) {
            overlayPoint = this._pushOverlayOnScreen(overlayPoint, this._overlayRect);
        }

        // We want to set either `left` or `right` based on whether the overlay wants to appear "before"
        // or "after" the origin, which determines the direction in which the element will expand.
        // For the horizontal axis, the meaning of "before" and "after" change based on whether the
        // page is in RTL or LTR.
        let horizontalStyleProperty: 'left' | 'right';

        if (this._isRtl()) {
            horizontalStyleProperty = position.overlayX === 'end' ? 'left' : 'right';
        } else {
            horizontalStyleProperty = position.overlayX === 'end' ? 'right' : 'left';
        }

        // When we're setting `right`, we adjust the x position such that it is the distance
        // from the right edge of the viewport rather than the left edge.
        if (horizontalStyleProperty === 'right') {
            const documentWidth = this._document.documentElement!.clientWidth;
            styles.right = `${documentWidth - (overlayPoint.x + this._overlayRect.width)}px`;
        } else {
            styles.left = coerceCssPixelValue(overlayPoint.x);
        }

        return styles;
    }

    /**
     * Gets the view properties of the trigger and overlay, including whether they are clipped
     * or completely outside the view of any of the strategy's scrollables.
     */
    private _getScrollVisibility(): ScrollingVisibility {
        // Note: needs fresh rects since the position could've changed.
        const originBounds = this._origin.getBoundingClientRect();
        const overlayBounds = this._pane.getBoundingClientRect();

        // every time, we should be able to use the scrollTop of the containers if the size of those
        // containers hasn't changed.
        const scrollContainerBounds = this.scrollables.map((scrollable) => {
            return scrollable.getElementRef().nativeElement.getBoundingClientRect();
        });

        return {
            isOriginClipped: isElementClippedByScrolling(originBounds, scrollContainerBounds),
            isOriginOutsideView: isElementScrolledOutsideView(originBounds, scrollContainerBounds),
            isOverlayClipped: isElementClippedByScrolling(overlayBounds, scrollContainerBounds),
            isOverlayOutsideView: isElementScrolledOutsideView(overlayBounds, scrollContainerBounds)
        };
    }

    /** Subtracts the amount that an element is overflowing on an axis from it's length. */
    private _subtractOverflows(length: number, ...overflows: number[]): number {
        return overflows.reduce((currentValue: number, currentOverflow: number) => {
            return currentValue - Math.max(currentOverflow, 0);
        }, length);
    }

    /** Narrows the given viewport rect by the current _viewportMargin. */
    private _getNarrowedViewportRect(): ClientRect {
        // We recalculate the viewport rect here ourselves, rather than using the ViewportRuler,
        // because we want to use the `clientWidth` and `clientHeight` as the base. The difference
        // being that the client properties don't include the scrollbar, as opposed to `innerWidth`
        // and `innerHeight` that do. This is necessary, because the overlay container uses
        // 100% `width` and `height` which don't include the scrollbar either.
        const width = this._document.documentElement!.clientWidth;
        const height = this._document.documentElement!.clientHeight;
        const scrollPosition = this._viewportRuler.getViewportScrollPosition();

        return {
            top: scrollPosition.top + this._viewportMargin,
            left: scrollPosition.left + this._viewportMargin,
            right: scrollPosition.left + width - this._viewportMargin,
            bottom: scrollPosition.top + height - this._viewportMargin,
            width: width - (2 * this._viewportMargin), //tslint:disable-line
            height: height - (2 * this._viewportMargin) //tslint:disable-line
        };
    }

    /** Whether the we're dealing with an RTL context */
    private _isRtl() {
        return this._overlayRef.getDirection() === 'rtl';
    }

    /** Determines whether the overlay uses exact or flexible positioning. */
    private _hasExactPosition() {
        return !this._hasFlexibleDimensions || this._isPushed;
    }

    /** Retrieves the offset of a position along the x or y axis. */
    private _getOffset(position: IConnectedPosition, axis: 'x' | 'y') {
        if (axis === 'x') {
            // We don't do something like `position['offset' + axis]` in
            // order to avoid breking minifiers that rename properties.
            return position.offsetX == null ? this._offsetX : position.offsetX;
        }

        return position.offsetY == null ? this._offsetY : position.offsetY;
    }

    /** Validates that the current position match the expected values. */
    private _validatePositions(): void {
        if (!this._preferredPositions.length) {
            throw Error('FlexibleConnectedPositionStrategy: At least one position is required.');
        }

        // TODO(crisbeto): remove these once Angular's template type
        // checking is advanced enough to catch these cases.
        this._preferredPositions.forEach((pair) => {
            validateHorizontalPosition('originX', pair.originX);
            validateVerticalPosition('originY', pair.originY);
            validateHorizontalPosition('overlayX', pair.overlayX);
            validateVerticalPosition('overlayY', pair.overlayY);
        });
    }
}

/** A simple (x, y) coordinate. */
interface IPoint {
    x: number;
    y: number;
}

/** Record of measurements for how an overlay (at a given position) fits into the viewport. */
interface IOverlayFit {
    /** Whether the overlay fits completely in the viewport. */
    isCompletelyWithinViewport: boolean;

    /** Whether the overlay fits in the viewport on the y-axis. */
    fitsInViewportVertically: boolean;

    /** Whether the overlay fits in the viewport on the x-axis. */
    fitsInViewportHorizontally: boolean;

    /** The total visible area (in px^2) of the overlay inside the viewport. */
    visibleArea: number;
}

/** Record of the measurments determining whether an overlay will fit in a specific position. */
interface IFallbackPosition {
    position: IConnectedPosition;
    originPoint: IPoint;
    overlayPoint: IPoint;
    overlayFit: IOverlayFit;
    overlayRect: ClientRect;
}

/** Position and size of the overlay sizing wrapper for a specific position. */
interface IBoundingBoxRect {
    top: number;
    left: number;
    bottom: number;
    right: number;
    height: number;
    width: number;
}

/** Record of measures determining how well a given position will fit with flexible dimensions. */
interface IFlexibleFit {
    position: IConnectedPosition;
    origin: IPoint;
    overlayRect: ClientRect;
    boundingBoxRect: IBoundingBoxRect;
}

/** A connected position as specified by the user. */
export interface IConnectedPosition {
    originX: 'start' | 'center' | 'end';
    originY: 'top' | 'center' | 'bottom';

    overlayX: 'start' | 'center' | 'end';
    overlayY: 'top' | 'center' | 'bottom';

    weight?: number;
    offsetX?: number;
    offsetY?: number;
}

/** Shallow-extends a stylesheet object with another stylesheet object. */
function extendStyles(dest: CSSStyleDeclaration, source: CSSStyleDeclaration): CSSStyleDeclaration {
    for (let key in source) { //tslint:disable-line
        if (source.hasOwnProperty(key)) {
            dest[key] = source[key];
        }
    }

    return dest;
}
