import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    AfterContentInit,
    Attribute,
    ChangeDetectionStrategy,
    Component,
    ContentChildren,
    ElementRef,
    Input,
    OnDestroy,
    QueryList,
    Renderer2,
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
@Component({
    selector: 'a[mc-tab-link], a[mcTabLink]',
    exportAs: 'mcTabLink',
    template: '<ng-content></ng-content>',
    inputs: ['disabled', 'tabIndex'],
    host: {
        class: 'mc-tab-link',
        '[class.mc-active]': 'active',
        '[class.mc-tab-label_vertical]': 'vertical',
        '[class.mc-tab-label_horizontal]': '!vertical',

        '[attr.tabindex]': 'tabIndex',
        '[attr.disabled]': 'disabled || null'
    }
})
export class McTabLink extends McTabLinkMixinBase implements OnDestroy, CanDisable, HasTabIndex {
    vertical = false;

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
        private readonly focusMonitor: FocusMonitor,
        private readonly renderer: Renderer2
    ) {
        super();

        this.focusMonitor.monitor(this.elementRef.nativeElement);
    }

    ngAfterViewInit(): void {
        this.addClassModifierForIcons(Array.from(this.elementRef.nativeElement.querySelectorAll('.mc-icon')));
    }

    ngOnDestroy() {
        this.focusMonitor.stopMonitoring(this.elementRef.nativeElement);
    }

    private addClassModifierForIcons(icons: HTMLElement[]) {
        const twoIcons = 2;
        const [firstIconElement, secondIconElement] = icons;

        if (icons.length === 1) {
            const COMMENT_NODE = 8;

            if (firstIconElement.nextSibling && firstIconElement.nextSibling.nodeType !== COMMENT_NODE) {
                this.renderer.addClass(firstIconElement, 'mc-icon_left');
            }

            if (firstIconElement.previousSibling && firstIconElement.previousSibling.nodeType !== COMMENT_NODE) {
                this.renderer.addClass(firstIconElement, 'mc-icon_right');
            }
        } else if (icons.length === twoIcons) {
            this.renderer.addClass(firstIconElement, 'mc-icon_left');
            this.renderer.addClass(secondIconElement, 'mc-icon_right');
        }
    }
}


/**
 * Navigation component matching the styles of the tab group header.
 */
@Component({
    selector: '[mc-tab-nav-bar]',
    exportAs: 'mcTabNavBar, mcTabNav',
    template: '<ng-content></ng-content>',
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
