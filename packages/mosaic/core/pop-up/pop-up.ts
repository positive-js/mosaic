import { AnimationEvent } from '@angular/animations';
import { ChangeDetectorRef, Directive, EventEmitter, OnDestroy, TemplateRef } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { PopUpVisibility } from './constants';


@Directive()
// tslint:disable-next-line:naming-convention
export abstract class McPopUp implements OnDestroy {
    header: string | TemplateRef<any>;
    content: string | TemplateRef<any>;

    classMap = {};

    warning: boolean;

    visibility = PopUpVisibility.Initial;
    visibleChange = new EventEmitter<boolean>();

    protected prefix: string;

    /** Subject for notifying that the tooltip has been hidden from the view */
    protected readonly onHideSubject = new Subject<any>();

    protected closeOnInteraction: boolean = false;

    private showTimeoutId: any;
    private hideTimeoutId: any;

    protected constructor(private changeDetectorRef: ChangeDetectorRef) {}

    ngOnDestroy() {
        clearTimeout(this.showTimeoutId);
        clearTimeout(this.hideTimeoutId);

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

                this.visibility = PopUpVisibility.Visible;
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
                this.visibility = PopUpVisibility.Hidden;

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
        return this.visibility === PopUpVisibility.Visible;
    }

    updateClassMap(placement: string, customClass: string, classMap?): void {
        this.classMap = {
            [`${this.prefix}_placement-${placement}`]: true,
            [customClass]: !!customClass,
            ...classMap
        };
    }

    /** Returns an observable that notifies when the tooltip has been hidden from view. */
    afterHidden(): Observable<void> {
        return this.onHideSubject.asObservable();
    }

    markForCheck(): void {
        this.changeDetectorRef.markForCheck();
    }

    detectChanges(): void {
        this.changeDetectorRef.detectChanges();
    }

    animationStart() {
        this.closeOnInteraction = false;
    }

    animationDone({ toState }: AnimationEvent): void {
        if (toState === PopUpVisibility.Hidden && !this.isVisible()) {
            this.onHideSubject.next();
        }

        if (toState === PopUpVisibility.Visible || toState === PopUpVisibility.Hidden) {
            this.closeOnInteraction = true;
        }
    }

    handleBodyInteraction(): void {
        if (this.closeOnInteraction) {
            this.hide(0);
        }
    }
}
