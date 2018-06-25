import {IScrollStrategy} from './scroll-strategy';


/** Scroll strategy that doesn't do anything. */
export class NoopScrollStrategy implements IScrollStrategy {
  /** Does nothing, as this scroll strategy is a no-op. */
  enable() { } // tslint:disable-line
  /** Does nothing, as this scroll strategy is a no-op. */
  disable() { } // tslint:disable-line
  /** Does nothing, as this scroll strategy is a no-op. */
  attach() { } // tslint:disable-line
}
