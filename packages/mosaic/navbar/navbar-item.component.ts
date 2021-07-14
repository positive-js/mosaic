import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceNumberProperty } from '@angular/cdk/coercion';
import {
    AfterContentInit,
    ChangeDetectorRef,
    Component,
    ContentChild,
    Directive,
    ElementRef,
    Input,
    OnDestroy,
    ViewEncapsulation
} from '@angular/core';
import { McButtonCssStyler } from '@ptsecurity/mosaic/button';
import { CanDisable, CanDisableCtor, mixinDisabled } from '@ptsecurity/mosaic/core';


const COLLAPSED_CLASS: string = 'mc-navbar-collapsed-title';

@Directive({
    selector: 'mc-navbar-logo',
    host: {
        class: 'mc-navbar-logo'
    }
})
export class McNavbarLogo {}


@Directive({
    selector: 'mc-navbar-title',
    host: {
        class: 'mc-navbar-title'
    }
})
export class McNavbarTitle {}


@Directive({
    selector: 'mc-navbar-brand',
    host: {
        class: 'mc-navbar-brand'
    }
})
export class McNavbarBrand {}


@Directive({
    selector: 'mc-navbar-divider',
    host: {
        class: 'mc-navbar-divider'
    }
})
export class McNavbarDivider {}


@Directive({
    selector: 'mc-navbar-item, mc-navbar-divider, mc-navbar-brand',
    host: {
        '[class.mc-vertical]': 'vertical',
        '[class.mc-horizontal]': 'horizontal',
        '[class.mc-opened]': 'vertical && !closed',
        '[class.mc-closed]': 'vertical && closed'
    }
})
export class McNavbarItemBase {
    @ContentChild(McButtonCssStyler) button: McButtonCssStyler;

    vertical: boolean;
    horizontal: boolean;

    closed: boolean;

    constructor(public elementRef: ElementRef) {}
}

// tslint:disable-next-line:naming-convention
export const McNavbarMixinBase: CanDisableCtor & typeof McNavbarItemBase = mixinDisabled(McNavbarItemBase);


@Component({
    selector: 'mc-navbar-item',
    template: `<ng-content></ng-content>`,
    styleUrls: [
        './navbar-item.scss',
        './navbar-brand.scss',
        './navbar-divider.scss'
    ],
    host: {
        class: 'mc-navbar-item',
        '[class.mc-navbar-item_button]': 'button',

        '[attr.tabindex]': 'tabIndex',
        '[attr.disabled]': 'disabled || null'
    },
    inputs: ['disabled'],
    encapsulation: ViewEncapsulation.None
})
export class McNavbarItem extends McNavbarMixinBase implements OnDestroy, CanDisable, AfterContentInit {
    @ContentChild(McButtonCssStyler) button: McButtonCssStyler;

    @Input()
    set collapsedTitle(value: string) {
        this.elementRef.nativeElement.setAttribute('computedTitle', encodeURI(value));
    }

    get tabIndex(): number {
        return this.disabled || this.button ? -1 : this._tabIndex;
    }

    set tabIndex(value: number) {
        this._tabIndex = value != null ? coerceNumberProperty(value) : 0;
    }

    private _tabIndex: number = 0;

    constructor(
        private focusMonitor: FocusMonitor,
        public changeDetectorRef: ChangeDetectorRef,
        elementRef: ElementRef
    ) {
        super(elementRef);
    }

    ngOnDestroy() {
        this.focusMonitor.stopMonitoring(this.elementRef.nativeElement);
    }

    ngAfterContentInit(): void {
        if (this.button) { return; }

        this.focusMonitor.monitor(this.elementRef.nativeElement, true);
    }
}


export class CollapsibleItem {
    private collapsed: boolean = false;

    constructor(public element: HTMLElement, public width: number) {}

    processCollapsed(collapsed: boolean) {
        this.collapsed = collapsed;

        this.updateCollapsedClass();
    }

    private updateCollapsedClass() {
        if (this.collapsed) {
            this.element.classList.add(COLLAPSED_CLASS);
        } else {
            this.element.classList.remove(COLLAPSED_CLASS);
        }
    }
}

export class CachedItemWidth {
    get canCollapse(): boolean {
        return this.itemsForCollapse.length > 0;
    }

    get collapsedItemsWidth(): number {
        if (this._collapsedItemsWidth !== undefined) {
            return this._collapsedItemsWidth;
        }

        this.calculateAndCacheCollapsedItemsWidth();

        return this._collapsedItemsWidth;
    }

    private _collapsedItemsWidth: number;

    constructor(
        public element: HTMLElement,
        public width: number,
        public itemsForCollapse: CollapsibleItem[] = []
    ) {}

    processCollapsed(collapsed: boolean) {
        if (this.itemsForCollapse.length > 0) {
            this.updateTitle(collapsed);
        }

        this.itemsForCollapse.forEach((item) => item.processCollapsed(collapsed));
    }

    private calculateAndCacheCollapsedItemsWidth() {
        this._collapsedItemsWidth = this.itemsForCollapse
            .reduce((acc, item) => acc + item.width, 0);
    }

    private getTitle(): string {
        const computedTitle = this.element.getAttribute('computedTitle');

        return computedTitle
            ? decodeURI(computedTitle)
            : (this.itemsForCollapse.length > 0 ? this.itemsForCollapse[0].element.innerText : '');
    }

    private updateTitle(collapsed: boolean) {
        if (collapsed) {
            this.element.setAttribute('title', this.getTitle());
        } else {
            this.element.removeAttribute('title');
        }
    }
}
