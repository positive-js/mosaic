import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    AfterContentInit,
    Attribute,
    ChangeDetectionStrategy,
    Component, ContentChildren,
    Directive,
    ElementRef,
    Input,
    OnDestroy, QueryList,
    ViewEncapsulation
} from '@angular/core';
import {
    CanDisable,
    CanDisableCtor,
    HasTabIndex,
    HasTabIndexCtor,
    mixinDisabled,
    mixinTabIndex
} from '@ptsecurity/mosaic/core';
import { delay } from 'rxjs/operators';


// Boilerplate for applying mixins to McTabLink.
export class McTabLinkBase {}
// tslint:disable-next-line:naming-convention
export const McTabLinkMixinBase: HasTabIndexCtor & CanDisableCtor &
    typeof McTabLinkBase = mixinTabIndex(mixinDisabled(McTabLinkBase));

/**
 * Link inside of a `mc-tab-nav-bar`.
 */
@Directive({
    selector: 'a[mc-tab-link], a[mcTabLink]',
    exportAs: 'mcTabLink',
    inputs: ['disabled', 'tabIndex'],
    host: {
        class: 'mc-tab-link',
        '[attr.tabindex]': 'tabIndex',
        '[class.mc-disabled]': 'disabled',
        '[class.mc-active]': 'active',
        '[class.mc-tab-label_vertical]': 'vertical',
        '[class.mc-tab-label_horizontal]': '!vertical'
    }
})
export class McTabLink extends McTabLinkMixinBase implements OnDestroy, CanDisable, HasTabIndex {
    vertical;

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
        private focusMonitor: FocusMonitor
    ) {
        super();

        this.focusMonitor.monitor(this.elementRef.nativeElement);
    }

    ngOnDestroy() {
        this.focusMonitor.stopMonitoring(this.elementRef.nativeElement);
    }
}


/**
 * Navigation component matching the styles of the tab group header.
 */
@Component({
    selector: '[mc-tab-nav-bar]',
    exportAs: 'mcTabNavBar, mcTabNav',
    templateUrl: 'tab-nav-bar.html',
    styleUrls: ['tab-nav-bar.scss'],
    host: {
        class: 'mc-tab-nav-bar'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class McTabNav implements AfterContentInit {
    vertical = false;

    @ContentChildren(McTabLink) links: QueryList<McTabLink>;

    constructor(@Attribute('vertical') vertical: string) {
        this.vertical = coerceBooleanProperty(vertical);
    }

    ngAfterContentInit(): void {
        this.links.changes
            .pipe(delay(0))
            .subscribe((links) => links.forEach((link) => link.vertical = this.vertical));

        this.links.notifyOnChanges();
    }
}
