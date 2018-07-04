import {
AfterViewInit,
    Component, Directive,
    ElementRef,
    HostBinding,
    Input,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { FocusMonitor } from '@ptsecurity/cdk/a11y';

import { CanDisable, debounce, mixinDisabled } from '@ptsecurity/mosaic/core';


const COLLAPSED_CLASS: string = 'mc-navbar-collapsed-title';
const MC_DROPDOWN = 'mc-dropdown';
const MC_ICON = 'mc-icon';
const MC_NAVBAR = 'mc-navbar';
const MC_NAVBAR_CONTAINER = 'mc-navbar-container';
const MC_NAVBAR_ITEM = 'mc-navbar-item';
const MC_NAVBAR_BRAND = 'mc-navbar-brand';
const MC_NAVBAR_TITLE = 'mc-navbar-title';
const MC_NAVBAR_LOGO = 'mc-navbar-logo';

export type McNavbarContainerPositionType = 'left' | 'right';

@Directive({
    selector: MC_NAVBAR_LOGO,
    host: {
        class: MC_NAVBAR_LOGO
    }
})
export class McNavbarLogo {}

@Directive({
    selector: MC_NAVBAR_BRAND,
    host: {
        class: MC_NAVBAR_BRAND
    }
})
export class McNavbarBrand {}

@Directive({
    selector: MC_NAVBAR_TITLE,
    host: {
        class: MC_NAVBAR_TITLE
    }
})
export class McNavbarTitle {}

export class McNavbarItemBase {
    constructor(public _elementRef: ElementRef) {}
}

export const _McNavbarMixinBase = mixinDisabled(McNavbarItemBase);

@Component({
    selector: MC_NAVBAR_ITEM,
    template: `
        <a [attr.tabindex]="disabled ? -1 : tabIndex" class="mc-navbar-item">
            <ng-content>
            </ng-content>
        </a>
    `,
    encapsulation: ViewEncapsulation.None,
    inputs: ['disabled'],
    host: {
        '[attr.disabled]': 'disabled || null'
    }
})
export class McNavbarItem extends _McNavbarMixinBase implements OnInit, OnDestroy, CanDisable {

    @Input()
    tabIndex: number = 0;

    @Input()
    set collapsedTitle(value: string) {
        this.elementRef.nativeElement.setAttribute('calculatedTitle', encodeURI(value));
    }

    constructor(
        public  elementRef: ElementRef,
        private _focusMonitor: FocusMonitor
    ) {
        super(elementRef);
    }

    ngOnInit() {
        this._denyClickIfDisabled();

        this._focusMonitor.monitor(this.elementRef.nativeElement, true);
    }

    ngOnDestroy() {
        this._focusMonitor.stopMonitoring(this.elementRef.nativeElement);
    }

    // This method is required due to angular 2 issue https://github.com/angular/angular/issues/11200
    private _denyClickIfDisabled() {
        const events: Event[] = this.elementRef.nativeElement.eventListeners('click');
        for (const event of events) {
            this.elementRef.nativeElement.removeEventListener('click', event);
        }

        this.elementRef.nativeElement.addEventListener('click', (event: MouseEvent) => {
            if (this.elementRef.nativeElement.hasAttribute('disabled')) {
                event.stopImmediatePropagation();
            }
        }, true);

        for (const event of events) {
            this.elementRef.nativeElement.addEventListener('click', event);
        }
    }
}

@Directive({
    selector: MC_NAVBAR_CONTAINER
})
export class McNavbarContainer {
    @Input()
    position: McNavbarContainerPositionType = 'left';

    @HostBinding('class')
    get getCssClasses(): string {
        return this.position === 'left' ? 'mc-navbar-left' : 'mc-navbar-right';
    }
}

class CachedCollapsedItemWidth {
    collapsed: boolean = false;

    constructor(
        public element: HTMLElement,
        public width: number
    ) {}
}

class CachedItemWidth {
    get canCollapse(): boolean {
        return this.itemsForCollapse.length > 0;
    }

    private get title(): string {
        const calculatedTitle = this.element.getAttribute('calculatedTitle');

        return calculatedTitle
            ? decodeURI(calculatedTitle)
            : (this.itemsForCollapse.length > 0 ? this.itemsForCollapse[0].element.innerText : '');
    }

    constructor(
        public element: HTMLElement,
        public width: number,
        public itemsForCollapse: CachedCollapsedItemWidth[] = []
    ) {}

    setCollapsed(collapsed: boolean): number {
        if (this.itemsForCollapse.length > 0) {
            if (collapsed) {
                this.element.setAttribute('title', this.title);
            } else {
                this.element.removeAttribute('title');
            }
        }

        let res = 0;

        for (const subItem of this.itemsForCollapse) {
            res += subItem.width;

            if (collapsed) {
                subItem.element.classList.add(COLLAPSED_CLASS);
            } else {
                subItem.element.classList.remove(COLLAPSED_CLASS);
            }

            subItem.collapsed = collapsed;
        }

        return res;
    }
}


@Component({
    selector: MC_NAVBAR,
    template: `
        <nav class="mc-navbar">
            <ng-content select=""[${MC_NAVBAR_CONTAINER}],${MC_NAVBAR_CONTAINER}"></ng-content>
        </nav>
    `,
    styleUrls: ['./navbar.css'],
    encapsulation: ViewEncapsulation.None,
    host: {
        '(window:resize)': 'updateCollapsedDebounce()'
    }
})
export class McNavbar implements AfterViewInit {

    private readonly forceRecalculateItemsWidth: boolean = false;
    private readonly resizeDebounceInterval: number = 200;
    private readonly firstLevelElement: string = MC_NAVBAR_CONTAINER;
    private readonly secondLevelElements: string[] = [
        MC_NAVBAR_ITEM,
        MC_NAVBAR_BRAND,
        MC_NAVBAR_TITLE
    ];

    private _totalItemsWidths: number | null = null;
    private _itemsWidths: CachedItemWidth[] | null = null;

    private get _maxAllowedWidth(): number {
        return this._elementRef.nativeElement.querySelector('nav').getBoundingClientRect().width;
    }

    private get itemsWidths(): CachedItemWidth[] {
        if (this._itemsWidths !== null && !this.forceRecalculateItemsWidth) {
            return this._itemsWidths;
        }

        const allItemsSelector = this.secondLevelElements.map((e: string) => `${this.firstLevelElement}>${e}`);
        const allItems: HTMLElement[] = Array.from(this._elementRef.nativeElement.querySelectorAll(allItemsSelector));

        this._itemsWidths = allItems.map((el) =>
            new CachedItemWidth(el, el.getBoundingClientRect().width, this._getItemsForCollapse(el))
        );

        return this._itemsWidths;
    }

    private get totalItemsWidth(): number {
        if (this._totalItemsWidths !== null && !this.forceRecalculateItemsWidth) {
            return this._totalItemsWidths;
        }

        this._totalItemsWidths = this.itemsWidths
            .reduce((acc, item) => acc + item.width, 0);

        return this._totalItemsWidths;
    }

    constructor(
        private _elementRef: ElementRef
    ) {}

    updateCollapsedDebounce() {
        debounce(this.updateCollapsed.bind(this), this.resizeDebounceInterval)();
    }

    updateCollapsed() {
        let collapseDelta = this.totalItemsWidth - this._maxAllowedWidth;
        for (let i = this.itemsWidths.length - 1; i >= 0; i--) {
            const item = this.itemsWidths[i];

            if (!item.canCollapse) {
                continue;
            }

            collapseDelta -= item.setCollapsed(collapseDelta > 0);
        }
    }

    ngAfterViewInit(): void {
        // Note: this wait is required for loading and rendering fonts for icons;
        // unfortunately we cannot control font rendering
        setTimeout(() => this.updateCollapsed(), 0);
    }

    private _getItemsForCollapse(element: HTMLElement): CachedCollapsedItemWidth[] {
        const icon = element.querySelector(`[${MC_ICON}],${MC_NAVBAR_LOGO},[${MC_NAVBAR_LOGO}]`);
        if (!icon) {
            return [];
        }

        return Array.from(element.querySelectorAll(MC_NAVBAR_TITLE))
            .map((el) => new CachedCollapsedItemWidth(<HTMLElement> el, el.getBoundingClientRect().width));
    }
}
