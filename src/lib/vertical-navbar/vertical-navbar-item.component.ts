import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
    Directive,
    ContentChildren,
    QueryList,
    AfterContentInit,
    SkipSelf,
    Inject,
    forwardRef,
    Optional
} from '@angular/core';
import { FocusMonitor, FocusOrigin } from '@ptsecurity/cdk/a11y';
import { SPACE } from '@ptsecurity/cdk/keycodes';
import { CanDisable, CanDisableCtor, mixinDisabled } from '@ptsecurity/mosaic/core';
import { Observable, Subscription } from 'rxjs';

import { expandVerticalNavbarMenuAnimation } from './vertical-navbar.animation';


export class McVerticalNavbarItemBase {
    constructor(public _elementRef: ElementRef) {}
}

export const _McVerticalNavbarMixinBase: CanDisableCtor & typeof McVerticalNavbarItemBase = mixinDisabled(McVerticalNavbarItemBase);


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


@Component({
    selector: 'a[mc-vertical-navbar-item], mc-vertical-navbar-item',
    templateUrl: './vertical-navbar-item.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./vertical-navbar-item.component.css'],
    inputs: ['disabled'],
    host: {
        '[attr.disabled]': 'disabled || null',
        '[attr.tabindex]': 'disabled ? -1 : 0'
    },
    animations: [
        expandVerticalNavbarMenuAnimation()
    ]
})
export class McVerticalNavbarItem extends _McVerticalNavbarMixinBase implements OnInit, AfterContentInit, OnDestroy, CanDisable {

    @Input() alignNestedItems: 'bottom' | 'top' | undefined = 'bottom';

    @Input() tabIndex: number = 0;

    animating: boolean = false;

    get expanded(): boolean {
        return this._expanded;
    }
    set expanded(value: boolean) {
        this._expanded = value;
        this.animating = true;
        this._cdRef.detectChanges();
    }
    private _expanded: boolean = false;

    @ContentChildren(McVerticalNavbarItem)
    private nestedItems: QueryList<McVerticalNavbarItem>;

    get hasNestedItems() {
        return this.nestedItems && this.nestedItems.length > 1;
    }

    private _subscription: Subscription = new Subscription();
    private _focusMonitor$: Observable<FocusOrigin>;

    constructor(
        private elementRef: ElementRef,
        private _focusMonitor: FocusMonitor,
        private _cdRef: ChangeDetectorRef,
        @Optional() @SkipSelf() @Inject(forwardRef(() => McVerticalNavbarItem))
        private parent: McVerticalNavbarItem
    ) {
        super(elementRef);

        this._focusMonitor$ = this._focusMonitor.monitor(this.elementRef.nativeElement, true);
    }

    ngOnInit() {
        this.denyClickIfDisabled();
    }

    ngAfterContentInit() {
        if (!this.hasNestedItems) {
            return;
        }

        this.listenClickOutside();
    }

    ngOnDestroy() {
        this._subscription.unsubscribe();
        this._focusMonitor.stopMonitoring(this.elementRef.nativeElement);
    }

    handleClickByItem() {
        this.toggleDropdown();

        if (this.parent && ! this.hasNestedItems) {
            this.parent.forceCloseDropdown(true);
        }
    }

    handleKeydown($event: KeyboardEvent) {
        const isNavbarItem = ($event.target as HTMLElement).classList.contains('mc-vertical-navbar-item');

        // tslint:disable-next-line
        // if (this.hasDropdownContent && $event.keyCode === SPACE && isNavbarItem) {
        if (this.hasNestedItems && $event.keyCode === SPACE) {
            this.toggleDropdown();
        }
    }

    private listenClickOutside() {
        this._subscription.add(
            this._focusMonitor$.subscribe((origin) => {
                if (origin === null) {
                    this.forceCloseDropdown(false);
                }
            })
        );
    }

    private toggleDropdown() {
        this.expanded = ! this.expanded;
    }

    private forceCloseDropdown(passToParent: boolean) {
        this.expanded = false;

        if (this.parent && passToParent) {
            this.parent.forceCloseDropdown(passToParent);
        }

        this._cdRef.detectChanges();
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
