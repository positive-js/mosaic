export {CdkScrollable, ScrollDispatcher} from '@ptsecurity/cdk/scrolling';

// Export pre-defined scroll strategies and interface to build custom ones.
export {IScrollStrategy} from './scroll-strategy';
export {ScrollStrategyOptions} from './scroll-strategy-options';
export {
  RepositionScrollStrategy,
  IRepositionScrollStrategyConfig
} from './reposition-scroll-strategy';
export {CloseScrollStrategy} from './close-scroll-strategy';
export {NoopScrollStrategy} from './noop-scroll-strategy';
export {BlockScrollStrategy} from './block-scroll-strategy';
