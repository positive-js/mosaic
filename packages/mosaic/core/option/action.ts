import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ContentChild,
    ElementRef,
    EventEmitter,
    Inject,
    InjectionToken,
    OnDestroy,
    ViewEncapsulation
} from '@angular/core';
import { ENTER, SPACE, TAB } from '@ptsecurity/cdk/keycodes';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CanDisableCtor, HasTabIndexCtor, mixinDisabled, mixinTabIndex } from '../common-behaviors/index';


// tslint:disable-next-line:naming-convention
export interface McOptionActionParent {
    dropdownTrigger: {
        opened: boolean;
        restoreFocus: boolean;
        dropdownClosed: EventEmitter<void>;
        lastDestroyReason: void | 'click' | 'keydown' | 'tab';
        openedBy: Exclude<FocusOrigin, 'program' | null> | undefined;
        toggle(): void;
    };
    tooltipTrigger: {
        disabled: boolean;
    };
    focus(): void;
}

export const MC_OPTION_ACTION_PARENT = new InjectionToken<McOptionActionParent>('MC_OPTION_ACTION_PARENT');

export class McOptionActionBase {}

// tslint:disable-next-line:naming-convention
export const McOptionActionMixinBase:
    HasTabIndexCtor & CanDisableCtor & typeof McOptionActionBase = mixinTabIndex(mixinDisabled(McOptionActionBase));


@Component({
    selector: 'mc-option-action',
    exportAs: 'mcOptionAction',
    template: `
        <ng-container [ngSwitch]="!!customIcon">
            <i class="mc mc-icon mc-ellipsis_16" *ngSwitchCase="false"></i>
            <ng-content select="[mc-icon]" *ngSwitchCase="true"></ng-content>
        </ng-container>
    `,
    styleUrls: ['./action.scss'],
    host: {
        class: 'mc-option-action',
        '[class.mc-expanded]': 'false',

        '[attr.disabled]': 'disabled || null',
        '[attr.tabIndex]': '-1',

        '(focus)': 'onFocus($event)',
        '(blur)': 'onBlur()',
        '(click)': 'onClick($event)',
        '(keydown)': 'onKeyDown($event)'
    },
    inputs: ['disabled'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class McOptionActionComponent extends McOptionActionMixinBase implements AfterViewInit, OnDestroy {
    @ContentChild('customIcon') customIcon: ElementRef;

    hasFocus: boolean = false;

    get active(): boolean {
        return this.hasFocus || !!this.option.dropdownTrigger?.opened;
    }

    private readonly destroy = new Subject<void>();

    constructor(
        private elementRef: ElementRef,
        private focusMonitor: FocusMonitor,
        @Inject(MC_OPTION_ACTION_PARENT) private option: McOptionActionParent
    ) {
        super();

        this.focusMonitor.monitor(this.elementRef.nativeElement);
    }

    ngAfterViewInit(): void {
        if (!this.option.dropdownTrigger) { return; }

        this.option.dropdownTrigger.restoreFocus = false;

        this.option.dropdownTrigger.dropdownClosed
            .pipe(takeUntil(this.destroy))
            .subscribe(() => {
                this.preventShowingTooltip();

                const destroyReason: FocusOrigin = this.option.dropdownTrigger.lastDestroyReason === 'keydown' ?
                    'keyboard' :
                    'program';

                this.focus(destroyReason);
            });
    }

    ngOnDestroy(): void {
        this.destroy.next();
        this.destroy.complete();
        this.focusMonitor.stopMonitoring(this.elementRef.nativeElement);
    }

    focus(origin?: FocusOrigin, options?: FocusOptions) {
        if (this.focusMonitor && origin) {
            this.focusMonitor.focusVia(this.elementRef.nativeElement, origin, options);
        } else {
            this.elementRef.nativeElement.focus();
        }

        this.hasFocus = true;
    }

    onFocus($event) {
        $event.stopPropagation();

        this.hasFocus = true;
    }

    onBlur() {
        this.hasFocus = false;
    }

    onClick($event) {
        $event.stopPropagation();
    }

    onKeyDown($event) {
        if ([SPACE, ENTER].includes($event.keyCode) && this.option.dropdownTrigger) {
            this.option.dropdownTrigger.openedBy = 'keyboard';
            this.option.dropdownTrigger.toggle();
        } else if ($event.shiftKey && $event.keyCode === TAB) {
            this.hasFocus = false;

            this.option.focus();
        } else if ($event.keyCode === TAB) {
            return;
        }

        $event.preventDefault();
        $event.stopPropagation();
    }

    private preventShowingTooltip() {
        if (!this.option.tooltipTrigger) { return; }

        this.option.tooltipTrigger.disabled = true;

        setTimeout(() => this.option.tooltipTrigger.disabled = false);
    }
}
