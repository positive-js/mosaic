import { IOverlayReference } from '../overlay-reference';


/** Strategy for setting the position on an overlay. */
export interface IPositionStrategy {
    /** Attaches this position strategy to an overlay. */
    attach(overlayRef: IOverlayReference): void;

    /** Updates the position of the overlay element. */
    apply(): void;

    /** Called when the overlay is detached. */
    detach?(): void;

    /** Cleans up any DOM modifications made by the position strategy, if necessary. */
    dispose(): void;
}
