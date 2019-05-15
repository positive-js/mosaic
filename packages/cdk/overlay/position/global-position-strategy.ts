import { IOverlayReference } from '../overlay-reference';

import { IPositionStrategy } from './position-strategy';


/**
 * A strategy for positioning overlays. Using this strategy, an overlay is given an
 * explicit position relative to the browser's viewport. We use flexbox, instead of
 * transforms, in order to avoid issues with subpixel rendering which can cause the
 * element to become blurry.
 */
export class GlobalPositionStrategy implements IPositionStrategy {
    /** The overlay to which this strategy is attached. */
    private _overlayRef: IOverlayReference;
    private _cssPosition: string = 'static';
    private _topOffset: string = '';
    private _bottomOffset: string = '';
    private _leftOffset: string = '';
    private _rightOffset: string = '';
    private _alignItems: string = '';
    private _justifyContent: string = '';
    private _width: string = '';
    private _height: string = '';

    attach(overlayRef: IOverlayReference): void {
        const config = overlayRef.getConfig();

        this._overlayRef = overlayRef;

        if (this._width && !config.width) {
            overlayRef.updateSize({ width: this._width });
        }

        if (this._height && !config.height) {
            overlayRef.updateSize({ height: this._height });
        }

        overlayRef.hostElement.classList.add('cdk-global-overlay-wrapper');
    }

    /**
     * Sets the top position of the overlay. Clears any previously set vertical position.
     * @param value New top offset.
     */
    top(value: string = ''): this {
        this._bottomOffset = '';
        this._topOffset = value;
        this._alignItems = 'flex-start';

        return this;
    }

    /**
     * Sets the left position of the overlay. Clears any previously set horizontal position.
     * @param value New left offset.
     */
    left(value: string = ''): this {
        this._rightOffset = '';
        this._leftOffset = value;
        this._justifyContent = 'flex-start';

        return this;
    }

    /**
     * Sets the bottom position of the overlay. Clears any previously set vertical position.
     * @param value New bottom offset.
     */
    bottom(value: string = ''): this {
        this._topOffset = '';
        this._bottomOffset = value;
        this._alignItems = 'flex-end';

        return this;
    }

    /**
     * Sets the right position of the overlay. Clears any previously set horizontal position.
     * @param value New right offset.
     */
    right(value: string = ''): this {
        this._leftOffset = '';
        this._rightOffset = value;
        this._justifyContent = 'flex-end';

        return this;
    }

    /**
     * Sets the overlay width and clears any previously set width.
     * @param value New width for the overlay
     * @deprecated Pass the `width` through the `OverlayConfig`.
     * @deletion-target 7.0.0
     */
    width(value: string = ''): this {
        if (this._overlayRef) {
            this._overlayRef.updateSize({ width: value });
        } else {
            this._width = value;
        }

        return this;
    }

    /**
     * Sets the overlay height and clears any previously set height.
     * @param value New height for the overlay
     * @deprecated Pass the `height` through the `OverlayConfig`.
     * @deletion-target 7.0.0
     */
    height(value: string = ''): this {
        if (this._overlayRef) {
            this._overlayRef.updateSize({ height: value });
        } else {
            this._height = value;
        }

        return this;
    }

    /**
     * Centers the overlay horizontally with an optional offset.
     * Clears any previously set horizontal position.
     *
     * @param offset Overlay offset from the horizontal center.
     */
    centerHorizontally(offset: string = ''): this {
        this.left(offset);
        this._justifyContent = 'center';

        return this;
    }

    /**
     * Centers the overlay vertically with an optional offset.
     * Clears any previously set vertical position.
     *
     * @param offset Overlay offset from the vertical center.
     */
    centerVertically(offset: string = ''): this {
        this.top(offset);
        this._alignItems = 'center';

        return this;
    }

    /**
     * Apply the position to the element.
     * @docs-private
     */
    apply(): void {
        // Since the overlay ref applies the strategy asynchronously, it could
        // have been disposed before it ends up being applied. If that is the
        // case, we shouldn't do anything.
        if (!this._overlayRef.hasAttached()) {
            return;
        }

        const styles = this._overlayRef.overlayElement.style;
        const parentStyles = this._overlayRef.hostElement.style;
        const config = this._overlayRef.getConfig();

        styles.position = this._cssPosition;
        styles.marginLeft = config.width === '100%' ? '0' : this._leftOffset;
        styles.marginTop = config.height === '100%' ? '0' : this._topOffset;
        styles.marginBottom = this._bottomOffset;
        styles.marginRight = this._rightOffset;

        if (config.width === '100%') {
            parentStyles.justifyContent = 'flex-start';
        } else if (this._overlayRef.getConfig().direction === 'rtl') {
            // In RTL the browser will invert `flex-start` and `flex-end` automatically, but we
            // don't want that because our positioning is explicitly `left` and `right`, hence
            // why we do another inversion to ensure that the overlay stays in the same position.
            if (this._justifyContent === 'flex-start') {
                parentStyles.justifyContent = 'flex-end';
            } else if (this._justifyContent === 'flex-end') {
                parentStyles.justifyContent = 'flex-start';
            }
        } else {
            parentStyles.justifyContent = this._justifyContent;
        }

        parentStyles.alignItems = config.height === '100%' ? 'flex-start' : this._alignItems;
    }

    /**
     * Noop implemented as a part of the IPositionStrategy interface.
     * @docs-private
     */
    dispose(): void {
    } //tslint:disable-line
}
