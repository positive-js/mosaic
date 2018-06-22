
export * from './overlay-config';
export * from './position/connected-position';
export * from './scroll/index';
export * from './overlay-module';
export {Overlay} from './overlay';
export {OverlayContainer} from './overlay-container';
export {CdkOverlayOrigin, CdkConnectedOverlay} from './overlay-directives';
export {FullscreenOverlayContainer} from './fullscreen-overlay-container';
export {OverlayRef, IOverlaySizeConfig} from './overlay-ref';
export {ViewportRuler} from '@ptsecurity/cdk/scrolling';
export {IComponentType} from '@ptsecurity/cdk/portal';
export {OverlayKeyboardDispatcher} from './keyboard/overlay-keyboard-dispatcher';
export {OverlayPositionBuilder} from './position/overlay-position-builder';

// Export pre-defined position strategies and interface to build custom ones.
export {IPositionStrategy} from './position/position-strategy';
export {GlobalPositionStrategy} from './position/global-position-strategy';
export {ConnectedPositionStrategy} from './position/connected-position-strategy';
export {
  IConnectedPosition,
  FlexibleConnectedPositionStrategy,
} from './position/flexible-connected-position-strategy';
export {VIEWPORT_RULER_PROVIDER} from '@ptsecurity/cdk/scrolling';
