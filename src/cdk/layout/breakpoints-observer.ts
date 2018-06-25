
import {Injectable, NgZone, OnDestroy} from '@angular/core';
import {coerceArray} from '@ptsecurity/cdk/coercion';
import {combineLatest, fromEventPattern, Observable, Subject} from 'rxjs';
import {map, startWith, takeUntil} from 'rxjs/operators';

import {MediaMatcher} from './media-matcher';


/** The current state of a layout breakpoint. */
export interface IBreakpointState {
  /** Whether the breakpoint is currently matching. */
  matches: boolean;
}

interface IQuery {
  observable: Observable<IBreakpointState>;
  mql: MediaQueryList;
}

/** Utility for checking the matching state of @media queries. */
@Injectable({providedIn: 'root'})
export class BreakpointObserver implements OnDestroy {
  /**  A map of all media queries currently being listened for. */
  private _queries: Map<string, IQuery> = new Map();
  /** A subject for all other observables to takeUntil based on. */
  private _destroySubject: Subject<{}> = new Subject();

  constructor(private mediaMatcher: MediaMatcher, private zone: NgZone) {}

  /** Completes the active subject, signalling to all other observables to complete. */
  ngOnDestroy() {
    this._destroySubject.next();
    this._destroySubject.complete();
  }

  /**
   * Whether one or more media queries match the current viewport size.
   * @param value One or more media queries to check.
   * @returns Whether any of the media queries match.
   */
  isMatched(value: string | string[]): boolean {
    const queries = splitQueries(coerceArray(value));

    return queries.some((mediaQuery) => this._registerQuery(mediaQuery).mql.matches);
  }

  /**
   * Gets an observable of results for the given queries that will emit new results for any changes
   * in matching of the given queries.
   * @param value One or more media queries to check.
   * @returns A stream of matches for the given queries.
   */
  observe(value: string | string[]): Observable<IBreakpointState> {
    const queries = splitQueries(coerceArray(value));
    const observables = queries.map((query) => this._registerQuery(query).observable);

    return combineLatest(observables).pipe(map((breakpointStates: IBreakpointState[]) => {
      return {
        matches: breakpointStates.some((state) => state && state.matches)
      };
    }));
  }

  /** Registers a specific query to be listened for. */
  private _registerQuery(query: string): IQuery {
    // Only set up a new MediaQueryList if it is not already being listened for.
    if (this._queries.has(query)) {
      return this._queries.get(query)!; //tslint:disable-line
    }

    const mql: MediaQueryList = this.mediaMatcher.matchMedia(query);
    // Create callback for match changes and add it is as a listener.
    const queryObservable = fromEventPattern(
      // Listener callback methods are wrapped to be placed back in ngZone. Callbacks must be placed
      // back into the zone because matchMedia is only included in Zone.js by loading the
      // webapis-media-query.js file alongside the zone.js file.  Additionally, some browsers do not
      // have MediaQueryList inherit from EventTarget, which causes inconsistencies in how Zone.js
      // patches it.
      (listener: MediaQueryListListener) => {
        mql.addListener((e: MediaQueryList) => this.zone.run(() => listener(e)));
      },
      (listener: MediaQueryListListener) => {
        mql.removeListener((e: MediaQueryList) => this.zone.run(() => listener(e)));
      })
      .pipe(
        takeUntil(this._destroySubject),
        startWith(mql),
        map((nextMql: MediaQueryList) => ({matches: nextMql.matches}))
      );

    // Add the MediaQueryList to the set of queries.
    const output = {observable: queryObservable, mql: mql}; //tslint:disable-line
    this._queries.set(query, output);

    return output;
  }
}

/**
 * Split each query string into separate query strings if two queries are provided as comma
 * separated.
 */
function splitQueries(queries: string[]): string[] {
  return queries.map((query: string) => query.split(','))
                .reduce((a1: string[], a2: string[]) => a1.concat(a2))
                .map((query) => query.trim());
}
