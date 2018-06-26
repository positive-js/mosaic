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

import { CanDisable, mixinDisabled } from '@ptsecurity/mosaic/core';


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

@Component({
    selector: MC_NAVBAR,
    template: `
        <nav class="mc-navbar">
            <ng-content select="[${MC_NAVBAR_CONTAINER}],${MC_NAVBAR_CONTAINER}"></ng-content>
        </nav>
    `,
    styleUrls: ['./navbar.css'],
    encapsulation: ViewEncapsulation.None,
    host: {
        '(window:resize)': 'collapse()'
    }
})
export class McNavbar implements AfterViewInit {

    private readonly collapsedClass: string = 'mc-navbar-collapsed-title';
    private readonly firstLevelElement: string = MC_NAVBAR_CONTAINER;
    private readonly secondLevelElements: string[] = [
        MC_NAVBAR_ITEM,
        MC_NAVBAR_BRAND,
        MC_NAVBAR_TITLE
    ];

    constructor(
        private _elementRef: ElementRef
    ) {}

    collapse() {
        const maxWidth = this._elementRef.nativeElement.querySelector('nav').getBoundingClientRect().width;

        this._uncollapseAll();

        const allItemsSelector = this.secondLevelElements.map((e: string) => `${this.firstLevelElement}>${e}`);
        const allItems: HTMLElement[] = Array.from(this._elementRef.nativeElement.querySelectorAll(allItemsSelector));

        const itemsWidth = allItems.reduce((acc, el) => acc + el.getBoundingClientRect().width, 0);
        if (itemsWidth <= maxWidth) {
            return;
        }

        let collapseDelta = itemsWidth - maxWidth;

        const firstLevelItems: NodeListOf<HTMLElement> =
            this._elementRef.nativeElement.querySelectorAll(`${MC_NAVBAR_ITEM},${MC_NAVBAR_BRAND}`);

        for (let i = firstLevelItems.length - 1; i >= 0; i--) {
            const item: HTMLElement = firstLevelItems[i];

            const icon = item.querySelector(`[${MC_ICON}],${MC_NAVBAR_LOGO},[${MC_NAVBAR_LOGO}]`);
            if (!icon) {
                continue;
            }

            const restElements: HTMLElement[] = Array.from(item.querySelectorAll(MC_NAVBAR_TITLE));

            const calculatedTitle = item.getAttribute('calculatedTitle');

            const title = calculatedTitle
                ? decodeURI(calculatedTitle)
                : (restElements.length > 0 ? restElements[0].innerText : '');

            item.setAttribute('title', title);

            for (const element of restElements) {
                collapseDelta -= element.getBoundingClientRect().width;

                element.classList.add(this.collapsedClass);
            }

            if (collapseDelta < 0) {
                return;
            }
        }
    }

    ngAfterViewInit(): void {
        this.collapse();
    }

    private _uncollapseAll() {
        const titles: HTMLElement[] = Array.from(
            this._elementRef.nativeElement.querySelectorAll(`${MC_NAVBAR_TITLE}.${this.collapsedClass}`)
        );
        for (const title of titles) {
            title.classList.remove(this.collapsedClass);
        }
    }
}
