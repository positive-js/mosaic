/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { Platform, supportsPassiveEventListeners } from '../platform';
import {
    Directive,
    ElementRef,
    EventEmitter,
    Injectable,
    NgZone,
    OnDestroy,
    OnInit,
    Output
} from '@angular/core';
import { EMPTY, Observable, Subject } from 'rxjs';


/** An event that is emitted when the autofill state of an input changes. */
export type AutofillEvent = {
    /** The element whose autofill state changes. */
    target: Element;
    /** Whether the element is currently autofilled. */
    isAutofilled: boolean;
};


/** Used to track info about currently monitored elements. */
type MonitoredElementInfo = {
    subject: Subject<AutofillEvent>;
    unlisten: () => void;
};


/** Options to pass to the animationstart listener. */
const listenerOptions: any = supportsPassiveEventListeners() ? { passive: true } : false;


/**
 * An injectable service that can be used to monitor the autofill state of an input.
 * Based on the following blog post:
 * https://medium.com/@brunn/detecting-autofilled-fields-in-javascript-aed598d25da7
 */
@Injectable({ providedIn: 'root' })
export class AutofillMonitor implements OnDestroy {
    private _monitoredElements = new Map<Element, MonitoredElementInfo>();

    constructor(private _platform: Platform, private _ngZone: NgZone) {
    }

    /**
     * Monitor for changes in the autofill state of the given input element.
     * @param element The element to monitor.
     * @return A stream of autofill state changes.
     */
    monitor(element: Element): Observable<AutofillEvent> {
        if (!this._platform.isBrowser) {
            return EMPTY;
        }

        const info = this._monitoredElements.get(element);

        if (info) {
            return info.subject.asObservable();
        }

        const result = new Subject<AutofillEvent>();
        const listener = (event: AnimationEvent) => {
            if (event.animationName === 'cdk-text-field-autofill-start') {
                element.classList.add('cdk-text-field-autofilled');
                this._ngZone.run(() => result.next({ target: event.target as Element, isAutofilled: true }));
            } else if (event.animationName === 'cdk-text-field-autofill-end') {
                element.classList.remove('cdk-text-field-autofilled');
                this._ngZone.run(() => result.next({ target: event.target as Element, isAutofilled: false }));
            }
        };

        this._ngZone.runOutsideAngular(() => {
            element.addEventListener('animationstart', listener, listenerOptions);
            element.classList.add('cdk-text-field-autofill-monitored');
        });

        this._monitoredElements.set(element, {
            subject: result,
            unlisten: () => {
                element.removeEventListener('animationstart', listener, listenerOptions);
            }
        });

        return result.asObservable();
    }

    /**
     * Stop monitoring the autofill state of the given input element.
     * @param element The element to stop monitoring.
     */
    stopMonitoring(element: Element) {
        const info = this._monitoredElements.get(element);

        if (info) {
            info.unlisten();
            info.subject.complete();
            element.classList.remove('cdk-text-field-autofill-monitored');
            element.classList.remove('cdk-text-field-autofilled');
            this._monitoredElements.delete(element);
        }
    }

    ngOnDestroy() {
        this._monitoredElements.forEach((_info, element) => this.stopMonitoring(element));
    }
}


/** A directive that can be used to monitor the autofill state of an input. */
@Directive({
    selector: '[cdkAutofill]'
})
export class CdkAutofill implements OnDestroy, OnInit {
    /** Emits when the autofill state of the element changes. */
    @Output() cdkAutofill: EventEmitter<AutofillEvent> = new EventEmitter<AutofillEvent>();

    constructor(private _elementRef: ElementRef, private _autofillMonitor: AutofillMonitor) {
    }

    ngOnInit() {
        this._autofillMonitor
            .monitor(this._elementRef.nativeElement)
            .subscribe((event) => this.cdkAutofill.emit(event));
    }

    ngOnDestroy() {
        this._autofillMonitor.stopMonitoring(this._elementRef.nativeElement);
    }
}
