import { Direction, Directionality } from '@ptsecurity/cdk/bidi';

import { IPositionStrategy } from './position/position-strategy';
import { NoopScrollStrategy } from './scroll/noop-scroll-strategy';
import { IScrollStrategy } from './scroll/scroll-strategy';


/** Initial configuration used when creating an overlay. */
export class OverlayConfig {
    /** Strategy with which to position the overlay. */
    positionStrategy?: IPositionStrategy;

    /** Strategy to be used when handling scroll events while the overlay is open. */
    scrollStrategy?: IScrollStrategy = new NoopScrollStrategy();

    /** Custom class to add to the overlay pane. */
    panelClass?: string | string[] = '';

    /** Whether the overlay has a backdrop. */
    hasBackdrop?: boolean = false;

    /** Custom class to add to the backdrop */
    backdropClass?: string | string[] = 'cdk-overlay-dark-backdrop';

    /** The width of the overlay panel. If a number is provided, pixel units are assumed. */
    width?: number | string;

    /** The height of the overlay panel. If a number is provided, pixel units are assumed. */
    height?: number | string;

    /** The min-width of the overlay panel. If a number is provided, pixel units are assumed. */
    minWidth?: number | string;

    /** The min-height of the overlay panel. If a number is provided, pixel units are assumed. */
    minHeight?: number | string;

    /** The max-width of the overlay panel. If a number is provided, pixel units are assumed. */
    maxWidth?: number | string;

    /** The max-height of the overlay panel. If a number is provided, pixel units are assumed. */
    maxHeight?: number | string;

    /**
     * Direction of the text in the overlay panel. If a `Directionality` instance
     * is passed in, the overlay will handle changes to its value automatically.
     */
    direction?: Direction | Directionality;

    constructor(config?: OverlayConfig) {
        if (config) {
            Object.keys(config)
                .filter((key) => config[key] !== undefined)
                .forEach((key) => this[key] = config[key]);
        }
    }
}
