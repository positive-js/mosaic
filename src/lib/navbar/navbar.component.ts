import {
    AfterViewInit,
    Component,
    ElementRef,
    HostBinding,
    Input,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { FocusMonitor } from '@ptsecurity/cdk/a11y';

const MC_NAVBAR_ITEM_DISABLE_CLASS = 'mc-navbar-item-disabled';
const MC_DROPDOWN = 'mc-dropdown';
const MC_ICON = 'mc-icon';
const MC_NAVBAR = 'mc-navbar';
const MC_NAVBAR_CONTAINER = 'mc-navbar-container';
const MC_NAVBAR_ITEM = 'mc-navbar-item';
const MC_NAVBAR_BRAND = 'mc-navbar-brand';
const MC_NAVBAR_TITLE = 'mc-navbar-title';
const MC_NAVBAR_LOGO = 'mc-navbar-logo';

export type McNavbarContainerPositionType = 'left' | 'right';

@Component({
    selector: MC_NAVBAR_LOGO,
    template: `
        <ng-content></ng-content>
    `,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: MC_NAVBAR_LOGO
    }
})
export class McNavbarLogo {}

@Component({
    selector: MC_NAVBAR_BRAND,
    template: `
        <ng-content select="${MC_NAVBAR_TITLE},[${MC_NAVBAR_TITLE}],${MC_NAVBAR_LOGO},[${MC_NAVBAR_LOGO}]"></ng-content>
    `,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: MC_NAVBAR_BRAND
    }
})
export class McNavbarBrand {}

@Component({
    selector: MC_NAVBAR_TITLE,
    template: `
        <ng-content></ng-content>
    `,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: MC_NAVBAR_TITLE
    }
})
export class McNavbarTitle {}

@Component({
    selector: MC_NAVBAR_ITEM,
    template: `
        <a tabindex="0" class="mc-navbar-item">
            <ng-content select="[${MC_ICON}],[${MC_NAVBAR_TITLE}],${MC_NAVBAR_TITLE},[${MC_DROPDOWN}]">
            </ng-content>
        </a>
    `,
    encapsulation: ViewEncapsulation.None
})
export class McNavbarItem implements OnInit, OnDestroy {

    @Input()
    set collapsedTitle(value: string) {
        this.elementRef.nativeElement.setAttribute('calculatedTitle', value);
    }

    constructor(
        public  elementRef: ElementRef,
        private _focusMonitor: FocusMonitor
    ) {}

    ngOnInit() {
        this._denyClickIfDesabled();

        this._focusMonitor.monitor(this.elementRef.nativeElement, true);
    }

    ngOnDestroy() {
        this._focusMonitor.stopMonitoring(this.elementRef.nativeElement);
    }

    // This method is required due to angular 2 issue https://github.com/angular/angular/issues/11200
    private _denyClickIfDesabled() {
        const events: Event[] = this.elementRef.nativeElement.eventListeners('click');
        for (const event of events) {
            this.elementRef.nativeElement.removeEventListener('click', event);
        }

        this.elementRef.nativeElement.addEventListener('click', (event: MouseEvent) => {
            if (this.elementRef.nativeElement.classList.contains(MC_NAVBAR_ITEM_DISABLE_CLASS)) {
                event.stopImmediatePropagation();
            }
        }, true);

        for (const event of events) {
            this.elementRef.nativeElement.addEventListener('click', event);
        }
    }
}

@Component({
    selector: MC_NAVBAR_CONTAINER,
    // tslint:disable max-line-length
    template: `
        <ng-content select="[${MC_NAVBAR_ITEM}],${MC_NAVBAR_ITEM},[${MC_NAVBAR_TITLE}],${MC_NAVBAR_TITLE},${MC_NAVBAR_BRAND},[${MC_NAVBAR_BRAND}]">
        </ng-content>
    `,
    encapsulation: ViewEncapsulation.None
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
            <div class="mc-navbar-container">
                <ng-content select="[${MC_NAVBAR_CONTAINER}],${MC_NAVBAR_CONTAINER}"></ng-content>
            </div>
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
        const containerClass: string = 'mc-navbar-container';

        const maxWidth = this._elementRef.nativeElement.querySelector(`.${containerClass}`).getBoundingClientRect().width;

        this._uncollapseAll();

        const allItemsSelector = this.secondLevelElements.map((e: string) => `${this.firstLevelElement}>${e}`);
        const allItems: HTMLElement[] = Array.from(this._elementRef.nativeElement.querySelectorAll(allItemsSelector));

        const itemsWidth = allItems.reduce((acc, el) => acc + el.getBoundingClientRect().width, 0);
        if (itemsWidth <= maxWidth) {
            return;
        }

        let collapseDelta = itemsWidth - maxWidth;

        const firstLevelItems: NodeListOf<HTMLElement> = this._elementRef.nativeElement.querySelectorAll(`${MC_NAVBAR_ITEM},${MC_NAVBAR_BRAND}`);

        for (let i = firstLevelItems.length - 1; i >= 0; i--) {
            const item: HTMLElement = firstLevelItems[i];

            const icon = item.querySelector(`[${MC_ICON}],${MC_NAVBAR_LOGO},[${MC_NAVBAR_LOGO}]`);
            if (!icon) {
                continue;
            }

            const restElements: HTMLElement[] = Array.from(item.querySelectorAll(MC_NAVBAR_TITLE));

            const title = item.getAttribute('calculatedTitle') || (restElements.length > 0 ? restElements[0].innerText : '');
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
        const titles: HTMLElement[] = Array.from(this._elementRef.nativeElement.querySelectorAll(`${MC_NAVBAR_TITLE}.${this.collapsedClass}`));
        for (const title of titles) {
            title.classList.remove(this.collapsedClass);
        }
    }
}
