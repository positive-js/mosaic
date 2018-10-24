import { Directive, ElementRef, OnInit, OnDestroy, NgZone, Optional } from '@angular/core';
import { Directionality } from '@ptsecurity/cdk/bidi';
import { getRtlScrollAxisType, RtlScrollAxisType, supportsScrollBehavior } from '@ptsecurity/cdk/platform';
import { fromEvent, Observable, Observer, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ScrollDispatcher } from './scroll-dispatcher';


export type _Without<T> = {[P in keyof T]?: never};
export type _XOR<T, U> = (_Without<T> & U) | (_Without<U> & T);

export interface _Top    { top?: number; }
export interface _Bottom { bottom?: number; }
export interface _Left   { left?: number; }
export interface _Right  { right?: number; }
export interface _Start  { start?: number; }
export interface _End    { end?: number; }

export type _XAxis = _XOR<_XOR<_Left, _Right>, _XOR<_Start, _End>>;
export type _YAxis = _XOR<_Top, _Bottom>;

/**
 * An extended version of ScrollToOptions that allows expressing scroll offsets relative to the
 * top, bottom, left, right, start, or end of the viewport rather than just the top and left.
 * Please note: the top and bottom properties are mutually exclusive, as are the left, right,
 * start, and end properties.
 */
export type ExtendedScrollToOptions = _XAxis & _YAxis & ScrollOptions;

/**
 * Sends an event when the directive's element is scrolled. Registers itself with the
 * ScrollDispatcher service to include itself as part of its collection of scrolling events that it
 * can be listened to through the service.
 */
@Directive({
    selector: '[cdk-scrollable], [cdkScrollable]'
})
export class CdkScrollable implements OnInit, OnDestroy {

    private destroyed = new Subject();

    private _elementScrolled: Observable<Event> = Observable.create((observer: Observer<Event>) =>
        this.ngZone.runOutsideAngular(() =>
            fromEvent(this.elementRef.nativeElement, 'scroll').pipe(takeUntil(this.destroyed))
                .subscribe(observer)));

    constructor(protected elementRef: ElementRef<HTMLElement>,
                protected scrollDispatcher: ScrollDispatcher,
                protected ngZone: NgZone,
                @Optional() protected dir?: Directionality
    ) {}

    ngOnInit() {
        this.scrollDispatcher.register(this);
    }

    ngOnDestroy() {
        this.scrollDispatcher.deregister(this);
        this.destroyed.next();
        this.destroyed.complete();
    }

    /** Returns observable that emits when a scroll event is fired on the host element. */
    elementScrolled(): Observable<Event> {
        return this._elementScrolled;
    }

    /** Gets the ElementRef for the viewport. */
    getElementRef(): ElementRef<HTMLElement> {
        return this.elementRef;
    }

    /**
     * Scrolls to the specified offsets. This is a normalized version of the browser's native scrollTo
     * method, since browsers are not consistent about what scrollLeft means in RTL. For this method
     * left and right always refer to the left and right side of the scrolling container irrespective
     * of the layout direction. start and end refer to left and right in an LTR context and vice-versa
     * in an RTL context.
     * @param options specified the offsets to scroll to.
     */
    scrollTo(options: ExtendedScrollToOptions): void {
        const el = this.elementRef.nativeElement;
        const isRtl = this.dir && this.dir.value == 'rtl';

        // Rewrite start & end offsets as right or left offsets.
        options.left = options.left == null ? (isRtl ? options.end : options.start) : options.left;
        options.right = options.right == null ? (isRtl ? options.start : options.end) : options.right;

        // Rewrite the bottom offset as a top offset.
        if (options.bottom != null) {
            options.top = el.scrollHeight - el.clientHeight - options.bottom;
        }

        // Rewrite the right offset as a left offset.
        if (isRtl && getRtlScrollAxisType() != RtlScrollAxisType.NORMAL) {
            if (options.left != null) {
                options.right = el.scrollWidth - el.clientWidth - options.left;
            }

            if (getRtlScrollAxisType() == RtlScrollAxisType.INVERTED) {
                options.left = options.right;
            } else if (getRtlScrollAxisType() == RtlScrollAxisType.NEGATED) {
                options.left = options.right ? -options.right : options.right;
            }
        } else {
            if (options.right != null) {
                options.left = el.scrollWidth - el.clientWidth - options.right;
            }
        }

        this.applyScrollToOptions(options);
    }

    /**
     * Measures the scroll offset relative to the specified edge of the viewport. This method can be
     * used instead of directly checking scrollLeft or scrollTop, since browsers are not consistent
     * about what scrollLeft means in RTL. The values returned by this method are normalized such that
     * left and right always refer to the left and right side of the scrolling container irrespective
     * of the layout direction. start and end refer to left and right in an LTR context and vice-versa
     * in an RTL context.
     * @param from The edge to measure from.
     */
    measureScrollOffset(from: 'top' | 'left' | 'right' | 'bottom' | 'start' | 'end'): number {
        const LEFT = 'left';
        const RIGHT = 'right';
        const el = this.elementRef.nativeElement;
        if (from == 'top') {
            return el.scrollTop;
        }
        if (from == 'bottom') {
            return el.scrollHeight - el.clientHeight - el.scrollTop;
        }

        // Rewrite start & end as left or right offsets.
        const isRtl = this.dir && this.dir.value == 'rtl';
        if (from == 'start') {
            from = isRtl ? RIGHT : LEFT;
        } else if (from == 'end') {
            from = isRtl ? LEFT : RIGHT;
        }

        if (isRtl && getRtlScrollAxisType() == RtlScrollAxisType.INVERTED) {
            // For INVERTED, scrollLeft is (scrollWidth - clientWidth) when scrolled all the way left and
            // 0 when scrolled all the way right.
            if (from == LEFT) {
                return el.scrollWidth - el.clientWidth - el.scrollLeft;
            } else {
                return el.scrollLeft;
            }
        } else if (isRtl && getRtlScrollAxisType() == RtlScrollAxisType.NEGATED) {
            // For NEGATED, scrollLeft is -(scrollWidth - clientWidth) when scrolled all the way left and
            // 0 when scrolled all the way right.
            if (from == LEFT) {
                return el.scrollLeft + el.scrollWidth - el.clientWidth;
            } else {
                return -el.scrollLeft;
            }
        } else {
            // For NORMAL, as well as non-RTL contexts, scrollLeft is 0 when scrolled all the way left and
            // (scrollWidth - clientWidth) when scrolled all the way right.
            if (from == LEFT) {
                return el.scrollLeft;
            } else {
                return el.scrollWidth - el.clientWidth - el.scrollLeft;
            }
        }
    }

    private applyScrollToOptions(options: ScrollToOptions): void {
        const el = this.elementRef.nativeElement;

        if (supportsScrollBehavior()) {
            el.scrollTo(options);
        } else {
            if (options.top != null) {
                el.scrollTop = options.top;
            }
            if (options.left != null) {
                el.scrollLeft = options.left;
            }
        }
    }


}
