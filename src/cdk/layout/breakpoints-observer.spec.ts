
import {Injectable} from '@angular/core';
import {async, TestBed, inject} from '@angular/core/testing';

import {BreakpointObserver, IBreakpointState} from './breakpoints-observer';
import {LayoutModule} from './layout-module';
import {MediaMatcher} from './media-matcher';


describe('BreakpointObserver', () => {
  let breakpointManager: BreakpointObserver;
  let mediaMatcher: FakeMediaMatcher;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [LayoutModule],
      providers: [{provide: MediaMatcher, useClass: FakeMediaMatcher}]
    });
  }));

  beforeEach(inject(
    [BreakpointObserver, MediaMatcher],
    (bm: BreakpointObserver, mm: FakeMediaMatcher) => {
      breakpointManager = bm;
      mediaMatcher = mm;
    }));

  afterEach(() => {
    mediaMatcher.clear();
  });

  it('retrieves the whether a query is currently matched', () => {
    let query = 'everything starts as true in the FakeMediaMatcher'; //tslint:disable-line
    expect(breakpointManager.isMatched(query)).toBeTruthy();
  });

  it('reuses the same MediaQueryList for matching queries', () => {
    expect(mediaMatcher.queryCount).toBe(0);
    breakpointManager.observe('query1');
    expect(mediaMatcher.queryCount).toBe(1);
    breakpointManager.observe('query1');
    expect(mediaMatcher.queryCount).toBe(1);
    breakpointManager.observe('query2');
    expect(mediaMatcher.queryCount).toBe(2); //tslint:disable-line
    breakpointManager.observe('query1');
    expect(mediaMatcher.queryCount).toBe(2); //tslint:disable-line
  });

  it('splits combined query strings into individual matchMedia listeners', () => {
    expect(mediaMatcher.queryCount).toBe(0);
    breakpointManager.observe('query1, query2');
    expect(mediaMatcher.queryCount).toBe(2); //tslint:disable-line
    breakpointManager.observe('query1');
    expect(mediaMatcher.queryCount).toBe(2); //tslint:disable-line
    breakpointManager.observe('query2, query3');
    expect(mediaMatcher.queryCount).toBe(3); //tslint:disable-line
  });

  it('accepts an array of queries', () => {
    let queries = ['1 query', '2 query', 'red query', 'blue query']; //tslint:disable-line
    breakpointManager.observe(queries);
    expect(mediaMatcher.queryCount).toBe(queries.length);
  });

  it('completes all events when the breakpoint manager is destroyed', () => {
    let firstTest = jasmine.createSpy('test1'); //tslint:disable-line
    breakpointManager.observe('test1').subscribe(undefined, undefined, firstTest);
    let secondTest = jasmine.createSpy('test2'); //tslint:disable-line
    breakpointManager.observe('test2').subscribe(undefined, undefined, secondTest);

    expect(firstTest).not.toHaveBeenCalled();
    expect(secondTest).not.toHaveBeenCalled();

    breakpointManager.ngOnDestroy();

    expect(firstTest).toHaveBeenCalled();
    expect(secondTest).toHaveBeenCalled();
  });

  it('emits an event on the observable when values change', () => {
    let query = '(width: 999px)'; //tslint:disable-line
    let queryMatchState: boolean = false;
    breakpointManager.observe(query).subscribe((state: IBreakpointState) => {
      queryMatchState = state.matches;
    });

    expect(queryMatchState).toBeTruthy();
    mediaMatcher.setMatchesQuery(query, false);
    expect(queryMatchState).toBeFalsy();
  });

  it('emits a true matches state when the query is matched', () => {
    let query = '(width: 999px)'; //tslint:disable-line
    mediaMatcher.setMatchesQuery(query, true);
    expect(breakpointManager.isMatched(query)).toBeTruthy();
  });

  it('emits a false matches state when the query is not matched', () => {
    let query = '(width: 999px)'; //tslint:disable-line
    mediaMatcher.setMatchesQuery(query, false);
    expect(breakpointManager.isMatched(query)).toBeTruthy();
  });
});

export class FakeMediaQueryList implements MediaQueryList {
  /** The callback for change events. */
  addListenerCallback?: (mql: MediaQueryList) => void;

  constructor(public matches, public media) {}

  /** Toggles the matches state and "emits" a change event. */
  setMatches(matches: boolean) {
    this.matches = matches;
    this.addListenerCallback!(this); //tslint:disable-line
  }

  /** Registers the callback method for change events. */
  addListener(callback: (mql: MediaQueryList) => void) {
    this.addListenerCallback = callback;
  }

  /** Noop, but required for implementing MediaQueryList. */
  removeListener() {} //tslint:disable-line
}

@Injectable()
export class FakeMediaMatcher {
  /** A map of match media queries. */
  private queries: Map<string, FakeMediaQueryList> = new Map();

  /** The number of distinct queries created in the media matcher during a test. */
  get queryCount(): number {
    return this.queries.size;
  }

  /** Fakes the match media response to be controlled in tests. */
  matchMedia(query: string): FakeMediaQueryList {
    let mql = new FakeMediaQueryList(true, query); //tslint:disable-line
    this.queries.set(query, mql);

    return mql;
  }

  /** Clears all queries from the map of queries. */
  clear() {
    this.queries.clear();
  }

  /** Toggles the matching state of the provided query. */
  setMatchesQuery(query: string, matches: boolean) {
    if (this.queries.has(query)) {
      this.queries.get(query)!.setMatches(matches); //tslint:disable-line
    }
  }
}
