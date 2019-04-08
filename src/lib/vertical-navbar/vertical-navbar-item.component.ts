import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation, Directive } from '@angular/core';
import { CanDisable, mixinDisabled } from '@ptsecurity/mosaic/core';


@Directive({
    selector: 'mc-vertical-navbar-item-icon',
    host: {
        class: 'mc-vertical-navbar-item-icon'
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
        class: 'mc-vertical-navbar-badge'
    }
})
export class McVerticalNavbarItemBadge {}


class McVerticalNavbarItemBase {}

@Component({
    selector: 'a[mc-vertical-navbar-item], mc-vertical-navbar-item',
    templateUrl: './vertical-navbar-item.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./vertical-navbar-item.component.css'],
    inputs: ['disabled'],
    host: {
        '[attr.disabled]': 'disabled || null',
        '[attr.tabindex]': 'disabled ? -1 : tabIndex'
    }
})
export class McVerticalNavbarItem extends mixinDisabled(McVerticalNavbarItemBase) implements CanDisable {
    @Input() tabIndex: number = 0;
}
