import {
    Attribute,
    ChangeDetectionStrategy,
    Component,
    Directive,
    ElementRef,
    Input,
    OnDestroy,
    ViewEncapsulation
} from '@angular/core';
import { FocusMonitor } from '@ptsecurity/cdk/a11y';
import {
    CanColor,
    CanColorCtor,
    CanDisable,
    CanDisableCtor,
    HasTabIndex,
    HasTabIndexCtor,
    mixinColor,
    mixinDisabled,
    mixinTabIndex
} from '@ptsecurity/mosaic/core';


// Boilerplate for applying mixins to McTabNav.
/** @docs-private */
export class McTabNavBase {
    // tslint:disable-next-line:naming-convention
    constructor(public _elementRef: ElementRef) {}
}
// tslint:disable-next-line:naming-convention
export const McTabNavMixinBase: CanColorCtor &
    typeof McTabNavBase = mixinColor(McTabNavBase);

/**
 * Navigation component matching the styles of the tab group header.
 */
@Component({
    selector: '[mc-tab-nav-bar]',
    exportAs: 'mcTabNavBar, mcTabNav',
    inputs: ['color'],
    templateUrl: 'tab-nav-bar.html',
    styleUrls: ['tab-nav-bar.css'],
    host: { class: 'mc-tab-nav-bar' },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class McTabNav extends McTabNavMixinBase
    implements CanColor {
        constructor(elementRef: ElementRef) {
            super(elementRef);
        }
     }

// Boilerplate for applying mixins to McTabLink.
export class McTabLinkBase {}
// tslint:disable-next-line:naming-convention
export const McTabLinkMixinBase: HasTabIndexCtor & CanDisableCtor &
    typeof McTabLinkBase = mixinTabIndex(mixinDisabled(McTabLinkBase));

/**
 * Link inside of a `mc-tab-nav-bar`.
 */
@Directive({
    selector: '[mc-tab-link], [mcTabLink]',
    exportAs: 'mcTabLink',
    inputs: ['disabled', 'tabIndex'],
    host: {
        class: 'mc-tab-link',
        '[attr.aria-current]': 'active',
        '[attr.aria-disabled]': 'disabled.toString()',
        '[attr.tabIndex]': 'tabIndex',
        '[class.mc-disabled]': 'disabled',
        '[class.mc-active]': 'active'
    }
})
export class McTabLink extends McTabLinkMixinBase
    implements OnDestroy, CanDisable, HasTabIndex {
    /** Whether the link is active. */
    @Input()
    get active(): boolean {
        return this.isActive;
    }
    set active(value: boolean) {
        if (value !== this.isActive) {
            this.isActive = value;
        }
    }

    /** Whether the tab link is active or not. */
    protected isActive: boolean = false;

    constructor(
        public elementRef: ElementRef,
        @Attribute('tabindex') tabIndex: string,
        private focusMonitor: FocusMonitor
    ) {
        super();

        this.tabIndex = parseInt(tabIndex) || 0;
        this.focusMonitor.monitor(this.elementRef.nativeElement);
    }

    ngOnDestroy() {
        this.focusMonitor.stopMonitoring(this.elementRef.nativeElement);
    }
}
