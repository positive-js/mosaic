import { Platform, supportsPassiveEventListeners } from '@angular/cdk/platform';
import {
    Directive,
    ElementRef,
    EventEmitter,
    Injectable,
    NgZone,
    OnDestroy,
    Optional,
    Output,
    SkipSelf
} from '@angular/core';
import { Observable, Subject, Subscription, of as observableOf } from 'rxjs';


// Through trial and error (on iPhone 6S) they found
// that a value of around 650ms seems appropriate.
export const TOUCH_BUFFER_MS = 650;


export type FocusOrigin = 'touch' | 'mouse' | 'keyboard' | 'program' | null;

// tslint:disable-next-line naming-convention
interface MonitoredElementInfo {
    checkChildren: boolean;
    subject: Subject<FocusOrigin>;
    unlisten(): void;
}


/** Monitors mouse and keyboard events to determine the cause of focus events. */
@Injectable({providedIn: 'root'})
export class FocusMonitor implements OnDestroy {
    /** The focus origin that the next focus event is a result of. */
    private origin: FocusOrigin = null;

    /** The FocusOrigin of the last focus event tracked by the FocusMonitor. */
    private lastFocusOrigin: FocusOrigin;

    /** Whether the window has just been focused. */
    private windowFocused = false;

    /** The target of the last touch event. */
    private lastTouchTarget: EventTarget | null;

    /** The timeout id of the touch timeout, used to cancel timeout later. */
    private touchTimeoutId: number;

    /** The timeout id of the window focus timeout. */
    private windowFocusTimeoutId: number;

    /** The timeout id of the origin clearing timeout. */
    private originTimeoutId: number;

    /** Map of elements being monitored to their info. */
    private elementInfo = new Map<HTMLElement, MonitoredElementInfo>();

    /** The number of elements currently being monitored. */
    private monitoredElementCount = 0;

    constructor(private _ngZone: NgZone, private _platform: Platform) {}

    /**
     * Monitors focus on an element and applies appropriate CSS classes.
     * @param element The element to monitor
     * @param checkChildren Whether to count the element as focused when its children are focused.
     * @returns An observable that emits when the focus state of the element changes.
     *     When the element is blurred, null will be emitted.
     */
    monitor(element: HTMLElement, checkChildren: boolean = false): Observable<FocusOrigin> {
        if (!this._platform.isBrowser) {
            return observableOf(null);
        }
        // Check if we're already monitoring this element.
        if (this.elementInfo.has(element)) {
            const cachedInfo = this.elementInfo.get(element);
            cachedInfo!.checkChildren = checkChildren;

            return cachedInfo!.subject.asObservable();
        }

        // Create monitored element info.
        const info: MonitoredElementInfo = {
            unlisten: () => {}, // tslint:disable-line no-empty
            checkChildren,
            subject: new Subject<FocusOrigin>()
        };
        this.elementInfo.set(element, info);
        this.incrementMonitoredElementCount();

        // Start listening. We need to listen in capture phase since focus events don't bubble.
        const focusListener = (event: FocusEvent) => this.onFocus(event, element);
        const blurListener = (event: FocusEvent) => this._onBlur(event, element);
        this._ngZone.runOutsideAngular(() => {
            element.addEventListener('focus', focusListener, true);
            element.addEventListener('blur', blurListener, true);
        });

        // Create an unlisten function for later.
        info.unlisten = () => {
            element.removeEventListener('focus', focusListener, true);
            element.removeEventListener('blur', blurListener, true);
        };

        return info.subject.asObservable();
    }

    /**
     * Stops monitoring an element and removes all focus classes.
     * @param element The element to stop monitoring.
     */
    stopMonitoring(element: HTMLElement): void {
        const elementInfo = this.elementInfo.get(element);

        if (elementInfo) {
            elementInfo.unlisten();
            elementInfo.subject.complete();

            this.setClasses(element);
            this.elementInfo.delete(element);
            this.decrementMonitoredElementCount();
        }
    }

    /**
     * Focuses the element via the specified focus origin.
     * @param element The element to focus.
     * @param origin The focus origin.
     */
    focusVia(element: HTMLElement, origin: FocusOrigin): void {
        this.setOriginForCurrentEventQueue(origin);

        // `focus` isn't available on the server
        if (typeof element.focus === 'function') {
            element.focus();
        }
    }

    ngOnDestroy() {
        this.elementInfo.forEach((_info, element) => this.stopMonitoring(element));
    }

    /**
     * Handles blur events on a registered element.
     * @param event The blur event.
     * @param element The monitored element.
     */
    // tslint:disable-next-line:naming-convention
    _onBlur(event: FocusEvent, element: HTMLElement) {
        // If we are counting child-element-focus as focused, make sure that we aren't just blurring in
        // order to focus another child of the monitored element.
        const elementInfo = this.elementInfo.get(element);

        if (!elementInfo || (elementInfo.checkChildren && event.relatedTarget instanceof Node &&
                element.contains(event.relatedTarget))) {
            return;
        }

        this.setClasses(element);
        elementInfo.subject.next(null);
    }

    /** A map of global objects to lists of current listeners. */
    // tslint:disable-next-line no-empty
    private unregisterGlobalListeners = () => {};

    /** Register necessary event listeners on the document and window. */
    private registerGlobalListeners() {
        // Do nothing if we're not on the browser platform.
        if (!this._platform.isBrowser) {
            return;
        }

        // On keydown record the origin and clear any touch event that may be in progress.
        const documentKeydownListener = () => {
            this.lastTouchTarget = null;
            this.setOriginForCurrentEventQueue('keyboard');
        };

        // On mousedown record the origin only if there is not touch target, since a mousedown can
        // happen as a result of a touch event.
        const documentMousedownListener = () => {
            if (!this.lastTouchTarget) {
                this.setOriginForCurrentEventQueue('mouse');
            }
        };

        // When the touchstart event fires the focus event is not yet in the event queue. This means
        // we can't rely on the trick used above (setting timeout of 0ms). Instead we wait 650ms to
        // see if a focus happens.
        const documentTouchstartListener = (event: TouchEvent) => {
            if (this.touchTimeoutId != null) { clearTimeout(this.touchTimeoutId); }

            this.lastTouchTarget = event.target;

            this.touchTimeoutId = window.setTimeout(() => this.lastTouchTarget = null, TOUCH_BUFFER_MS);
        };

        // Make a note of when the window regains focus, so we can restore the origin info for the
        // focused element.
        const windowFocusListener = () => {
            this.windowFocused = true;

            this.windowFocusTimeoutId = window.setTimeout(() => this.windowFocused = false, 0);
        };

        // Note: we listen to events in the capture phase so we can detect them even if the user stops
        // propagation.
        this._ngZone.runOutsideAngular(() => {
            document.addEventListener('keydown', documentKeydownListener, true);
            document.addEventListener('mousedown', documentMousedownListener, true);
            document.addEventListener('touchstart', documentTouchstartListener,
                supportsPassiveEventListeners() ? ({ passive: true, capture: true } as any) : true);
            window.addEventListener('focus', windowFocusListener);
        });

        this.unregisterGlobalListeners = () => {
            document.removeEventListener('keydown', documentKeydownListener, true);
            document.removeEventListener('mousedown', documentMousedownListener, true);
            document.removeEventListener('touchstart', documentTouchstartListener,
                supportsPassiveEventListeners() ? ({ passive: true, capture: true } as any) : true);
            window.removeEventListener('focus', windowFocusListener);

            // Clear timeouts for all potentially pending timeouts to prevent the leaks.
            clearTimeout(this.windowFocusTimeoutId);
            clearTimeout(this.touchTimeoutId);
            clearTimeout(this.originTimeoutId);
        };
    }

    private toggleClass(element: Element, className: string, shouldSet: boolean) {
        if (shouldSet) {
            element.classList.add(className);
        } else {
            element.classList.remove(className);
        }
    }

    /**
     * Sets the focus classes on the element based on the given focus origin.
     * @param element The element to update the classes on.
     * @param origin The focus origin.
     */
    private setClasses(element: HTMLElement, origin?: FocusOrigin): void {
        const elementInfo = this.elementInfo.get(element);

        if (elementInfo) {
            this.toggleClass(element, 'cdk-focused', !!origin);
            this.toggleClass(element, 'cdk-touch-focused', origin === 'touch');
            this.toggleClass(element, 'cdk-keyboard-focused', origin === 'keyboard');
            this.toggleClass(element, 'cdk-mouse-focused', origin === 'mouse');
            this.toggleClass(element, 'cdk-program-focused', origin === 'program');
        }
    }

    /**
     * Sets the origin and schedules an async function to clear it at the end of the event queue.
     * @param origin The origin to set.
     */
    private setOriginForCurrentEventQueue(origin: FocusOrigin): void {
        this._ngZone.runOutsideAngular(() => {
            this.origin = origin;

            this.originTimeoutId = window.setTimeout(() => this.origin = null);
        });
    }

    /**
     * Checks whether the given focus event was caused by a touchstart event.
     * @param event The focus event to check.
     * @returns Whether the event was caused by a touch.
     */
    private wasCausedByTouch(event: FocusEvent): boolean {
        // Note(mmalerba): This implementation is not quite perfect, there is a small edge case.
        // Consider the following dom structure:
        //
        // <div #parent tabindex="0" cdkFocusClasses>
        //   <div #child (click)="#parent.focus()"></div>
        // </div>
        //
        // If the user touches the #child element and the #parent is programmatically focused as a
        // result, this code will still consider it to have been caused by the touch event and will
        // apply the cdk-touch-focused class rather than the cdk-program-focused class. This is a
        // relatively small edge-case that can be worked around by using
        // focusVia(parentEl, 'program') to focus the parent element.
        //
        // If we decide that we absolutely must handle this case correctly, we can do so by listening
        // for the first focus event after the touchstart, and then the first blur event after that
        // focus event. When that blur event fires we know that whatever follows is not a result of the
        // touchstart.
        const focusTarget = event.target;

        return this.lastTouchTarget instanceof Node && focusTarget instanceof Node &&
            (focusTarget === this.lastTouchTarget || focusTarget.contains(this.lastTouchTarget));
    }

    /**
     * Handles focus events on a registered element.
     * @param event The focus event.
     * @param element The monitored element.
     */
    private onFocus(event: FocusEvent, element: HTMLElement) {
        // NOTE(mmalerba): We currently set the classes based on the focus origin of the most recent
        // focus event affecting the monitored element. If we want to use the origin of the first event
        // instead we should check for the cdk-focused class here and return if the element already has
        // it. (This only matters for elements that have includesChildren = true).

        // If we are not counting child-element-focus as focused, make sure that the event target is the
        // monitored element itself.
        const elementInfo = this.elementInfo.get(element);
        if (!elementInfo || (!elementInfo.checkChildren && element !== event.target)) {
            return;
        }

        // If we couldn't detect a cause for the focus event, it's due to one of three reasons:
        // 1) The window has just regained focus, in which case we want to restore the focused state of
        //    the element from before the window blurred.
        // 2) It was caused by a touch event, in which case we mark the origin as 'touch'.
        // 3) The element was programmatically focused, in which case we should mark the origin as
        //    'program'.
        let origin = this.origin;
        if (!origin) {
            if (this.windowFocused && this.lastFocusOrigin) {
                origin = this.lastFocusOrigin;
            } else if (this.wasCausedByTouch(event)) {
                origin = 'touch';
            } else {
                origin = 'program';
            }
        }

        this.setClasses(element, origin);
        this.emitOrigin(elementInfo.subject, origin);
        this.lastFocusOrigin = origin;
    }

    private emitOrigin(subject: Subject<FocusOrigin>, origin: FocusOrigin) {
        this._ngZone.run(() => subject.next(origin));
    }

    private incrementMonitoredElementCount() {
        // Register global listeners when first element is monitored.
        if (++this.monitoredElementCount === 1) {
            this.registerGlobalListeners();
        }
    }

    private decrementMonitoredElementCount() {
        // Unregister global listeners when last element is unmonitored.
        if (!--this.monitoredElementCount) {
            this.unregisterGlobalListeners();
            this.unregisterGlobalListeners = () => {};  // tslint:disable-line no-empty
        }
    }
}

/**
 * Directive that determines how a particular element was focused (via keyboard, mouse, touch, or
 * programmatically) and adds corresponding classes to the element.
 *
 * There are two variants of this directive:
 * 1) cdkMonitorElementFocus: does not consider an element to be focused if one of its children is
 *    focused.
 * 2) cdkMonitorSubtreeFocus: considers an element focused if it or any of its children are focused.
 */
@Directive({
    selector: '[cdkMonitorElementFocus], [cdkMonitorSubtreeFocus]'
})
export class CdkMonitorFocus implements OnDestroy {

    @Output() cdkFocusChange = new EventEmitter<FocusOrigin>();

    private monitorSubscription: Subscription;

    constructor(private _elementRef: ElementRef, private _focusMonitor: FocusMonitor) {
        this.monitorSubscription = this._focusMonitor.monitor(
            this._elementRef.nativeElement,
            this._elementRef.nativeElement.hasAttribute('cdkMonitorSubtreeFocus'))
            .subscribe((origin) => this.cdkFocusChange.emit(origin));
    }

    ngOnDestroy() {
        this._focusMonitor.stopMonitoring(this._elementRef.nativeElement);
        this.monitorSubscription.unsubscribe();
    }
}

/** @docs-private @deprecated */
// tslint:disable-next-line:naming-convention
export function FOCUS_MONITOR_PROVIDER_FACTORY(parentDispatcher: FocusMonitor, ngZone: NgZone, platform: Platform) {
    return parentDispatcher || new FocusMonitor(ngZone, platform);
}

/** @docs-private */
export const FOCUS_MONITOR_PROVIDER = {
    // If there is already a FocusMonitor available, use that. Otherwise, provide a new one.
    provide: FocusMonitor,
    deps: [[new Optional(), new SkipSelf(), FocusMonitor], NgZone, Platform],
    // tslint:disable-next-line:deprecation
    useFactory: FOCUS_MONITOR_PROVIDER_FACTORY
};
