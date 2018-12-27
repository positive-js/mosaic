import { Injectable } from '@angular/core';
import { fakeAsync, TestBed, inject, flush } from '@angular/core/testing';

import { BreakpointObserver, IBreakpointState } from './breakpoints-observer';
import { LayoutModule } from './layout-module';
import { MediaMatcher } from './media-matcher';


/* tslint:disable:no-magic-numbers */
describe('BreakpointObserver', () => {
    let breakpointManager: BreakpointObserver;
    let mediaMatcher: FakeMediaMatcher;

    beforeEach(fakeAsync(() => {
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

    it('retrieves the whether a query is currently matched', fakeAsync(() => {
        const query = 'everything starts as true in the FakeMediaMatcher';
        expect(breakpointManager.isMatched(query)).toBeTruthy();
    }));

    it('reuses the same MediaQueryList for matching queries', fakeAsync(() => {
        expect(mediaMatcher.queryCount).toBe(0);
        breakpointManager.observe('query1');
        expect(mediaMatcher.queryCount).toBe(1);
        breakpointManager.observe('query1');
        expect(mediaMatcher.queryCount).toBe(1);
        breakpointManager.observe('query2');
        expect(mediaMatcher.queryCount).toBe(2);
        breakpointManager.observe('query1');
        expect(mediaMatcher.queryCount).toBe(2);
    }));

    it('splits combined query strings into individual matchMedia listeners', fakeAsync(() => {
        expect(mediaMatcher.queryCount).toBe(0);
        breakpointManager.observe('query1, query2');
        expect(mediaMatcher.queryCount).toBe(2);
        breakpointManager.observe('query1');
        expect(mediaMatcher.queryCount).toBe(2);
        breakpointManager.observe('query2, query3');
        expect(mediaMatcher.queryCount).toBe(3);
    }));

    it('accepts an array of queries', fakeAsync(() => {
        const queries = ['1 query', '2 query', 'red query', 'blue query'];
        breakpointManager.observe(queries);
        expect(mediaMatcher.queryCount).toBe(queries.length);
    }));

    it('completes all events when the breakpoint manager is destroyed', fakeAsync(() => {
        const firstTest = jasmine.createSpy('test1');
        breakpointManager.observe('test1').subscribe(undefined, undefined, firstTest);
        const secondTest = jasmine.createSpy('test2');
        breakpointManager.observe('test2').subscribe(undefined, undefined, secondTest);

        flush();
        expect(firstTest).not.toHaveBeenCalled();
        expect(secondTest).not.toHaveBeenCalled();

        breakpointManager.ngOnDestroy();
        flush();

        expect(firstTest).toHaveBeenCalled();
        expect(secondTest).toHaveBeenCalled();
    }));

    it('emits an event on the observable when values change', fakeAsync(() => {
        const query = '(width: 999px)';
        let queryMatchState = false;
        breakpointManager.observe(query).subscribe((state: IBreakpointState) => {
            queryMatchState = state.matches;
        });

        flush();
        expect(queryMatchState).toBeTruthy();
        mediaMatcher.setMatchesQuery(query, false);
        flush();
        expect(queryMatchState).toBeFalsy();
    }));

    it('emits an event on the observable with the matching state of all queries provided',
        fakeAsync(() => {
            const queryOne = '(width: 999px)';
            const queryTwo = '(width: 700px)';
            let state: IBreakpointState = {matches: false, breakpoints: {}};
            breakpointManager.observe([queryOne, queryTwo]).subscribe((breakpoint: IBreakpointState) => {
                state = breakpoint;
            });

            mediaMatcher.setMatchesQuery(queryOne, false);
            mediaMatcher.setMatchesQuery(queryTwo, false);
            flush();
            expect(state.breakpoints).toEqual({[queryOne]: false, [queryTwo]: false});

            mediaMatcher.setMatchesQuery(queryOne, true);
            mediaMatcher.setMatchesQuery(queryTwo, false);
            flush();
            expect(state.breakpoints).toEqual({[queryOne]: true, [queryTwo]: false});
        }));

    it('emits a true matches state when the query is matched', fakeAsync(() => {
        const query = '(width: 999px)';
        breakpointManager.observe(query).subscribe();
        mediaMatcher.setMatchesQuery(query, true);
        expect(breakpointManager.isMatched(query)).toBeTruthy();
    }));

    it('emits a false matches state when the query is not matched', fakeAsync(() => {
        const query = '(width: 999px)';
        breakpointManager.observe(query).subscribe();
        mediaMatcher.setMatchesQuery(query, false);
        expect(breakpointManager.isMatched(query)).toBeFalsy();
    }));
});

export class FakeMediaQueryList {
    /** The callback for change events. */
    addListenerCallback?: (mql: MediaQueryListEvent) => void;

    constructor(public matches, public media) {}

    /** Toggles the matches state and "emits" a change event. */
    setMatches(matches: boolean) {
        this.matches = matches;
        this.addListenerCallback!(this as any);
    }

    /** Registers the callback method for change events. */
    addListener(callback: (mql: MediaQueryListEvent) => void) {
        this.addListenerCallback = callback;
    }

    // Noop removal method for testing.
    // tslint:disable-next-line
    removeListener() { }
}

@Injectable()
export class FakeMediaMatcher {
    /** A map of match media queries. */
    private queries = new Map<string, FakeMediaQueryList>();

    /** The number of distinct queries created in the media matcher during a test. */
    get queryCount(): number {
        return this.queries.size;
    }

    /** Fakes the match media response to be controlled in tests. */
    matchMedia(query: string): FakeMediaQueryList {
        const mql = new FakeMediaQueryList(true, query);
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
            this.queries.get(query)!.setMatches(matches);
        } else {
            throw Error('This query is not being observed.');
        }
    }
}
