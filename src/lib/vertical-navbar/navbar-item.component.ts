import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ElementRef,
    Input,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild,
    ViewEncapsulation, Directive
} from '@angular/core';
import { FocusMonitor, FocusOrigin } from '@ptsecurity/cdk/a11y';
import { SPACE } from '@ptsecurity/cdk/keycodes';
import { Platform } from '@ptsecurity/cdk/platform';
import { CanDisable, CanDisableCtor, mixinDisabled } from '@ptsecurity/mosaic/core';
import { Observable, Subscription } from 'rxjs';


export const MC_NAVBAR_ITEM = 'mc-vertical-navbar-item';
export const MC_NAVBAR_ITEM_ICON = 'mc-vertical-navbar-item-icon';


export interface IMcNavbarDropdownItem {
    link?: string;
    text: string;
}

export class McNavbarItemBase {
    constructor(public _elementRef: ElementRef) {}
}

export const _McNavbarMixinBase: CanDisableCtor & typeof McNavbarItemBase = mixinDisabled(McNavbarItemBase);


@Directive({
    selector: MC_NAVBAR_ITEM_ICON,
    host: {
        class: MC_NAVBAR_ITEM_ICON
    },
    // template: `
    //     <i mc-icon="{{icon}}"></i>
    //     <!--<i mc-icon="mc-hamburger_16"></i>-->
    //     <i [attr.mc-icon]="icon"></i>
    // `
})
export class McVerticalNavbarItemIcon {
    @Input() icon: string;
}


@Component({
    selector: MC_NAVBAR_ITEM,
    templateUrl: './navbar-item.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    inputs: ['disabled'],
    host: {
        '[attr.disabled]': 'disabled || null',
        '[attr.tabindex]': '-1'
    }
})
export class McVerticalNavbarItem extends _McNavbarMixinBase implements OnInit, AfterViewInit, OnDestroy, CanDisable {

    @Input()
    tabIndex: number = 0;

    @Input()
    dropdownItems: IMcNavbarDropdownItem[] = [];

    @Input()
    set collapsedTitle(value: string) {
        this.elementRef.nativeElement.setAttribute('computedTitle', encodeURI(value));
    }

    @ContentChild('dropdownItemTmpl', { read: TemplateRef })
    dropdownItemTmpl: TemplateRef<IMcNavbarDropdownItem>;

    @ViewChild('dropdownContent', { read: ElementRef })
    dropdownContent: ElementRef;

    get hasDropdownContent() {
        return this.dropdownItems.length > 0;
    }

    isCollapsed: boolean = true;

    private _subscription: Subscription = new Subscription();
    private _focusMonitor$: Observable<FocusOrigin>;

    private get _dropdownElements(): HTMLElement[] {
        return this.dropdownContent ? this.dropdownContent.nativeElement.querySelectorAll('li > *') : [];
    }

    constructor(
        public  elementRef: ElementRef,
        private _focusMonitor: FocusMonitor,
        private _platform: Platform,
        private _cdRef: ChangeDetectorRef
    ) {
        super(elementRef);
    }

    ngOnInit() {
        this.denyClickIfDisabled();

        this._focusMonitor$ = this._focusMonitor.monitor(this.elementRef.nativeElement, true);

        if (this.hasDropdownContent) {
            this.listenClickOutside();
        }
    }

    ngAfterViewInit() {
        if (!this.hasDropdownContent) {
            return;
        }

        this.startListenFocusDropdownItems();
    }

    ngOnDestroy() {
        this._subscription.unsubscribe();
        this._focusMonitor.stopMonitoring(this.elementRef.nativeElement);
        this.stopListenFocusDropdownItems();
    }

    isActiveDropdownLink(link: string): boolean {
        if (!this._platform.isBrowser) {
            return false;
        }

        return window.location.href.indexOf(link) >= 0;
    }

    handleClickByItem() {
        this.toggleDropdown();
    }

    handleKeydown($event: KeyboardEvent) {
        const isNavbarItem = ($event.target as HTMLElement).classList.contains(MC_NAVBAR_ITEM);

        // tslint:disable-next-line
        if (this.hasDropdownContent && $event.keyCode === SPACE && isNavbarItem) {
            this.toggleDropdown();
        }
    }

    handleClickByDropdownItem() {
        this.forceCloseDropdown();
    }

    private listenClickOutside() {
        this._subscription.add(
            this._focusMonitor$.subscribe((origin) => {
                if (origin === null) {
                    this.forceCloseDropdown();
                }
            })
        );
    }

    private toggleDropdown() {
        this.isCollapsed = !this.isCollapsed;
    }

    private forceCloseDropdown() {
        this.isCollapsed = true;
        this._cdRef.detectChanges();
    }

    private startListenFocusDropdownItems() {
        this._dropdownElements.forEach((el) => {
            this._focusMonitor.monitor(el, true);
        });
    }

    private stopListenFocusDropdownItems() {
        this._dropdownElements.forEach((el) => {
            this._focusMonitor.stopMonitoring(el);
        });
    }

    // This method is required due to angular 2 issue https://github.com/angular/angular/issues/11200
    private denyClickIfDisabled() {
        const events: Event[] = this.elementRef.nativeElement.eventListeners('click');

        events.forEach((event) => this.elementRef.nativeElement.removeEventListener('click', event));

        this.elementRef.nativeElement.addEventListener('click', (event: MouseEvent) => {
            if (this.elementRef.nativeElement.hasAttribute('disabled')) {
                event.stopImmediatePropagation();
            }
        }, true);

        events.forEach((event) => this.elementRef.nativeElement.addEventListener('click', event));
    }
}
