import { AnimationEvent } from '@angular/animations';
import { ChangeDetectorRef, EventEmitter, OnDestroy, TemplateRef } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { TooltipVisibility } from './constants';


// tslint:disable-next-line:naming-convention
export abstract class McBaseTooltip implements OnDestroy {
    visibleChange: EventEmitter<boolean> = new EventEmitter();

    protected classMap = {};
    protected prefix: string;

    /** Subject for notifying that the tooltip has been hidden from the view */
    protected readonly onHideSubject: Subject<any> = new Subject();

    protected closeOnInteraction: boolean = false;

    private visibility = TooltipVisibility.Initial;

    private showTimeoutId: any;
    private hideTimeoutId: any;

    protected constructor(private changeDetectorRef: ChangeDetectorRef) {}

    ngOnDestroy() {
        this.onHideSubject.complete();
    }

    isTemplateRef(value: any): boolean {
        return value instanceof TemplateRef;
    }

    show(delay: number): void {
        if (this.hideTimeoutId) {
            clearTimeout(this.hideTimeoutId);
        }

        this.closeOnInteraction = true;

        this.showTimeoutId = setTimeout(
            () => {
                this.showTimeoutId = undefined;

                this.visibility = TooltipVisibility.Visible;
                this.visibleChange.emit(true);
                // Mark for check so if any parent component has set the
                // ChangeDetectionStrategy to OnPush it will be checked anyways
                this.markForCheck();
            },
            delay
        );
    }

    hide(delay: number): void {
        if (this.showTimeoutId) {
            clearTimeout(this.showTimeoutId);
        }

        this.hideTimeoutId = setTimeout(
            () => {
                this.hideTimeoutId = undefined;
                this.visibility = TooltipVisibility.Hidden;

                this.visibleChange.emit(false);
                this.onHideSubject.next();

                // Mark for check so if any parent component has set the
                // ChangeDetectionStrategy to OnPush it will be checked anyways
                this.markForCheck();
            },
            delay
        );
    }

    isVisible(): boolean {
        return this.visibility === 'visible';
    }

    updateClassMap(placement: string, customClass: string, size: string = ''): void {
        this.classMap = {
            [`${this.prefix}_${size}`]: true,
            [`${this.prefix}_placement-${placement}`]: true,
            [customClass]: true
        };
    }

    /** Returns an observable that notifies when the tooltip has been hidden from view. */
    afterHidden(): Observable<void> {
        return this.onHideSubject.asObservable();
    }

    markForCheck(): void {
        this.changeDetectorRef.markForCheck();
    }

    protected animationStart() {
        this.closeOnInteraction = false;
    }

    protected animationDone({ toState }: AnimationEvent): void {
        if (toState === TooltipVisibility.Hidden && !this.isVisible()) {
            this.onHideSubject.next();
        }

        if (toState === TooltipVisibility.Visible || toState === TooltipVisibility.Hidden) {
            this.closeOnInteraction = true;
        }
    }
}
