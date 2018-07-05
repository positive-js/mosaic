import {
    AfterViewInit,
    Component, ContentChildren, Directive,
    ElementRef,
    HostBinding,
    Input,
    OnDestroy,
    OnInit, QueryList, ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { FocusMonitor } from '@ptsecurity/cdk/a11y';
import { CanDisable, debounce, mixinDisabled } from '@ptsecurity/mosaic/core';

import { McIcon } from '../icon/icon.component';


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

export interface IMeasure {
    width: number;
}

export interface ISecondLevel extends IMeasure {
    canCollapse: boolean;
    order: number;
    collapsedWidth: number;
    setCollapsed(collapse: boolean);
}

export abstract class AbstractMeasure implements IMeasure {
    private _width: number | null = null;

    get width(): number {
        if (this._width !== null) {
            return this._width;
        }

        this._width = this.elementRef.nativeElement.getBoundingClientRect().width;

        return <number> this._width;
    }

    constructor(
        public elementRef: ElementRef
    ) {}
}

@Directive({
    selector: MC_NAVBAR_LOGO,
    host: {
        class: MC_NAVBAR_LOGO
    }
})
export class McNavbarLogo {}

@Directive({
    selector: MC_NAVBAR_TITLE,
    host: {
        '[class]': 'klass'
    }
})
export class McNavbarTitle extends AbstractMeasure implements ISecondLevel, AfterViewInit {
    klass: string = MC_NAVBAR_TITLE;

    canCollapse: boolean = false;

    order: number;

    collapsedWidth: number = 0;

    private readonly allowSetClassNative: boolean = false;

    constructor(
        private _elementRef: ElementRef
    ) {
        super(_elementRef);
    }

    setCollapsed(collapse: boolean) {
        if (!this.allowSetClassNative) {
            this.klass = collapse
                ? `${COLLAPSED_CLASS} ${MC_NAVBAR_TITLE}`
                : MC_NAVBAR_TITLE;
        } else {
            if (collapse) {
                this._elementRef.nativeElement.classList.add(COLLAPSED_CLASS);
            } else {
                this._elementRef.nativeElement.classList.remove(COLLAPSED_CLASS);
            }
        }
    }

    ngAfterViewInit(): void {
        this.order = this.elementRef.nativeElement.getBoundingClientRect().x;
        this.collapsedWidth = this.width;
    }
}

@Directive({
    selector: MC_NAVBAR_BRAND,
    host: {
        class: MC_NAVBAR_BRAND
    }
})
export class McNavbarBrand extends AbstractMeasure implements ISecondLevel, AfterViewInit {
    @ContentChildren(McNavbarLogo)
    logos: QueryList<McNavbarLogo>;

    @ContentChildren(McNavbarTitle)
    titles: QueryList<McNavbarTitle>;

    order: number;

    collapsedWidth: number = 0;

    get canCollapse(): boolean {
        return this.logos.length > 0 && this.titles.length > 0;
    }

    constructor(
        private _elementRef: ElementRef
    ) {
        super(_elementRef);
    }

    setCollapsed(collapse: boolean) {
        this.titles.forEach((t) => t.setCollapsed(collapse));
    }

    ngAfterViewInit(): void {
        this.order = this.elementRef.nativeElement.getBoundingClientRect().x;
        this.collapsedWidth = this.titles.reduce((acc, item) => acc + item.collapsedWidth, 0);
    }
}

export class McNavbarItemBase extends AbstractMeasure {}

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
        '[attr.disabled]': 'disabled || null',
        '[attr.title]': 'title'
    }
})
export class McNavbarItem extends _McNavbarMixinBase implements OnInit, OnDestroy, CanDisable, ISecondLevel {

    @ContentChildren(McNavbarTitle)
    titles: QueryList<McNavbarTitle>;

    @ContentChildren(McIcon)
    icons: QueryList<McIcon>;

    get canCollapse(): boolean {
        return this.icons.length > 0 && this.titles.length > 0;
    }

    order: number;

    collapsedWidth: number = 0;

    @Input()
    tabIndex: number = 0;

    @Input()
    collapsedTitle: string;

    title: string;

    constructor(
        public  elementRef: ElementRef,
        private _focusMonitor: FocusMonitor
    ) {
        super(elementRef);
    }

    setCollapsed(collapse: boolean) {
        this.titles.forEach((t) => t.setCollapsed(collapse));

        this.title = collapse && this.canCollapse
            ? this.collapsedTitle || this.titles.first.elementRef.nativeElement.innerText
            : '';
    }

    ngOnInit() {
        this._denyClickIfDisabled();

        this._focusMonitor.monitor(this.elementRef.nativeElement, true);
    }

    ngAfterViewInit(): void {
        this.order = this.elementRef.nativeElement.getBoundingClientRect().x;
        this.collapsedWidth = this.titles.reduce((acc, item) => acc + item.collapsedWidth, 0);
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

    @ContentChildren(McNavbarItem)
    items: QueryList<McNavbarItem>;

    @ContentChildren(McNavbarBrand)
    brands: QueryList<McNavbarBrand>;

    @ContentChildren(McNavbarTitle)
    titles: QueryList<McNavbarTitle>;

    @Input()
    position: McNavbarContainerPositionType = 'left';

    @HostBinding('class')
    get getCssClasses(): string {
        return this.position === 'left' ? 'mc-navbar-left' : 'mc-navbar-right';
    }

    get allSecondLevelItems(): ISecondLevel[] {
        if (this._allSecondLevelItems) {
            return this._allSecondLevelItems;
        }

        this._allSecondLevelItems = this.getSecondLevelItems(McNavbarItem)
            .concat(this.getSecondLevelItems(McNavbarBrand))
            .concat(this.getSecondLevelItems(McNavbarTitle));

        return this._allSecondLevelItems;
    }

    private _allSecondLevelItems: ISecondLevel[];

    private getSecondLevelItems<T extends ISecondLevel>(typeToGet: new(...args: any[]) => T): ISecondLevel[] {
        switch (typeToGet.name) {
            case McNavbarItem.name:
                return this.items.toArray();
            case McNavbarBrand.name:
                return this.brands.toArray();
            case McNavbarTitle.name:
                return this.titles.toArray();
            default:
                throw new Error('Type dis not supported');
        }
    }
}

@Component({
    selector: MC_NAVBAR,
    template: `
        <nav class="mc-navbar" #nav>
            <ng-content select="[${MC_NAVBAR_CONTAINER}],${MC_NAVBAR_CONTAINER}"></ng-content>
        </nav>
    `,
    styleUrls: ['./navbar.css'],
    encapsulation: ViewEncapsulation.None,
    host: {
        '(window:resize)': 'updateCollapsedDebounce()'
    }
})
export class McNavbar implements AfterViewInit {

    @ViewChild('nav')
    private navElement: ElementRef;

    @ContentChildren(McNavbarContainer)
    private containers: QueryList<McNavbarContainer>;

    private get maxAllowedWidth(): number {
        return this.navElement.nativeElement.getBoundingClientRect().width;
    }

    private _allSecondLevelItems: ISecondLevel[];

    private get allSecondLevelItems(): ISecondLevel[] {
        if (this._allSecondLevelItems) {
            return this._allSecondLevelItems;
        }

        this._allSecondLevelItems = this.containers
            .map((c) => c.allSecondLevelItems)
            .reduce((acc, item) => acc.concat(item))
            .sort((a, b) => b.order - a.order);

        return this._allSecondLevelItems;
    }

    private get totalItemsWidth(): number {
        return this.allSecondLevelItems
            .reduce((acc, item) => acc + item.width, 0);
    }

    private readonly resizeDebounceInterval: number = 200;

    updateCollapsedDebounce() {
        debounce(this.updateCollapsed.bind(this), this.resizeDebounceInterval)();
    }

    updateCollapsed() {
        let collapseDelta = this.totalItemsWidth - this.maxAllowedWidth;

        for (const item of this.allSecondLevelItems) {
            if (!item.canCollapse) {
                continue;
            }

            item.setCollapsed(collapseDelta > 0);
            collapseDelta -= item.collapsedWidth;
        }
    }

    ngAfterViewInit(): void {
        // Note: this wait is required for loading and rendering fonts for icons;
        // unfortunately we cannot control font rendering
        setTimeout(() => this.updateCollapsed(), 0);
    }
}
