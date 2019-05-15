import {
    ChangeDetectionStrategy,
    Component,
    Input,
    ViewEncapsulation,
    Directive,
    ElementRef,
    OnDestroy,
    Optional,
    Self
} from '@angular/core';
import { FocusMonitor } from '@ptsecurity/cdk/a11y';
import { CanDisable, mixinDisabled, CanDisableCtor } from '@ptsecurity/mosaic/core';
import { McDropdownTrigger } from '@ptsecurity/mosaic/dropdown';


@Directive({
    selector: 'mc-vertical-navbar-item-icon',
    host: {
        class: 'mc-vertical-navbar__item-icon'
    }
})
export class McVerticalNavbarItemIcon {}


@Component({
    selector: 'mc-vertical-navbar-badge',
    template: `
        <span class="mc-badge mc-badge_light">
            <ng-content></ng-content>
        </span>
    `,
    host: {
        class: 'mc-vertical-navbar__badge'
    }
})
export class McVerticalNavbarItemBadge {}


class McVerticalNavbarItemBase {
    constructor(public _elementRef: ElementRef) {}
}

export const _McVerticalNavbarMixinBase: CanDisableCtor & typeof McVerticalNavbarItemBase
    = mixinDisabled(McVerticalNavbarItemBase);


@Component({
    selector: 'a[mc-vertical-navbar-item], mc-vertical-navbar-item',
    templateUrl: './vertical-navbar-item.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./vertical-navbar-item.component.css'],
    inputs: ['disabled'],
    host: {
        '[attr.disabled]': 'disabled || null',
        '[attr.tabindex]': 'disabled ? -1 : 0'
    }
})
export class McVerticalNavbarItem extends _McVerticalNavbarMixinBase implements CanDisable, OnDestroy {
    @Input() tabIndex: number = 0;

    constructor(
        private element: ElementRef,
        private focusMonitor: FocusMonitor,
        @Optional() @Self() private trigger: McDropdownTrigger
    ) {
        super(element);

        this.focusMonitor.monitor(this.element.nativeElement).subscribe();
    }

    get hasDropdownAttached() {
        return !! this.trigger;
    }

    ngOnDestroy() {
        this.focusMonitor.stopMonitoring(this.element.nativeElement);
    }
}
