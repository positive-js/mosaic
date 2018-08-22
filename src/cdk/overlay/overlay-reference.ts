import { Direction, Directionality } from '@ptsecurity/cdk/bidi';
import { Portal } from '@ptsecurity/cdk/portal';


/**
 * Basic interface for an overlay. Used to avoid circular type references between
 * `OverlayRef`, `PositionStrategy` and `ScrollStrategy`, and `OverlayConfig`.
 * @docs-private
 */
export interface IOverlayReference {
    overlayElement: HTMLElement;
    hostElement: HTMLElement;

    attach(portal: Portal<any>): any;

    detach(): any;

    dispose(): void;

    getConfig(): any;

    hasAttached(): boolean;

    updateSize(config: any): void;

    updatePosition(): void;

    getDirection(): Direction;

    setDirection(dir: Direction | Directionality): void;
}
