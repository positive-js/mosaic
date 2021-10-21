import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import {
    ChangeDetectionStrategy,
    Component,
    ContentChild,
    ElementRef,
    OnDestroy,
    OnInit,
    Optional,
    Self,
    ViewEncapsulation
} from '@angular/core';
import { ENTER, SPACE, TAB } from '@ptsecurity/cdk/keycodes';
import {
    CanDisableCtor,
    HasTabIndexCtor,
    mixinDisabled,
    mixinTabIndex
} from '@ptsecurity/mosaic/core';
import { McDropdownTrigger } from '@ptsecurity/mosaic/dropdown';
import { McIcon } from '@ptsecurity/mosaic/icon';
import { McTooltipTrigger } from '@ptsecurity/mosaic/tooltip';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { McTreeOption } from './tree-option.component';


export class McTreeNodeActionBase {}

// tslint:disable-next-line:naming-convention
export const McTreeNodeActionMixinBase:
    HasTabIndexCtor & CanDisableCtor & typeof McTreeNodeActionBase = mixinTabIndex(mixinDisabled(McTreeNodeActionBase));


@Component({
    selector: 'mc-tree-node-action',
    exportAs: 'mcTreeNodeAction',
    template: `
        <ng-container [ngSwitch]="!!customIcon">
            <i class="mc mc-icon mc-ellipsis_16" *ngSwitchCase="false"></i>
            <ng-content select="[mc-icon]" *ngSwitchCase="true"></ng-content>
        </ng-container>
        `,
    styleUrls: ['./action.scss'],
    host: {
        class: 'mc-tree-node-action',
        '[class.mc-opened]': 'false',

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
export class McTreeNodeActionComponent extends McTreeNodeActionMixinBase implements OnInit, OnDestroy {
    @ContentChild(McIcon) customIcon: McIcon;

    hasFocus: boolean = false;

    get active(): boolean {
        return this.dropdownTrigger?.opened || this.hasFocus;
    }

    private readonly destroy = new Subject<void>();

    constructor(
        private elementRef: ElementRef,
        private focusMonitor: FocusMonitor,
        private option: McTreeOption,
        @Optional() @Self() private dropdownTrigger: McDropdownTrigger,
        @Optional() @Self() private tooltip: McTooltipTrigger
    ) {
        super();
    }

    ngOnInit(): void {
        if (this.dropdownTrigger) {
            this.dropdownTrigger.restoreFocus = false;

            this.dropdownTrigger.dropdownClosed
                .pipe(takeUntil(this.destroy))
                .subscribe(() => {
                    this.preventShowingTooltip();

                    const destroyReason: FocusOrigin = this.dropdownTrigger.lastDestroyReason === 'click' ?
                        'program' :
                        'keyboard';

                    this.focus(destroyReason);
                });
        }

        this.focusMonitor.monitor(this.elementRef.nativeElement);
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
        if ([SPACE, ENTER].includes($event.keyCode)) {
            this.dropdownTrigger?.toggle();
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
        if (!this.tooltip) { return; }

        this.tooltip.disabled = true;

        setTimeout(() => this.tooltip.disabled = false);
    }
}
