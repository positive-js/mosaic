/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {
    AfterContentInit,
    Attribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    Directive,
    ElementRef,
    forwardRef,
    Inject,
    Input,
    NgZone,
    OnDestroy,
    Optional,
    QueryList,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { FocusMonitor } from '@ptsecurity/cdk/a11y';
import { Directionality } from '@ptsecurity/cdk/bidi';
import { ViewportRuler } from '@ptsecurity/cdk/scrolling';
import {
    CanColor, CanColorCtor,
    CanDisable, CanDisableCtor,
    HasTabIndex, HasTabIndexCtor,
    mixinColor,
    mixinDisabled,
    mixinTabIndex
} from '@ptsecurity/mosaic/core';
import { merge, of as observableOf, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


// Boilerplate for applying mixins to McTabNav.
/** @docs-private */
export class McTabNavBase {
    constructor(public _elementRef: ElementRef) { }
}
export const _McTabNavMixinBase:
    CanColorCtor & typeof
    McTabNavBase =
    mixinColor(McTabNavBase);

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
export class McTabNav extends _McTabNavMixinBase
    implements AfterContentInit, CanColor, OnDestroy {

    /** Query list of all tab links of the tab navigation. */
    @ContentChildren(forwardRef(() => McTabLink), { descendants: true })
    _tabLinks: QueryList<McTabLink>;

    /** Subject that emits when the component has been destroyed. */
    private readonly _onDestroy = new Subject<void>();

    constructor(elementRef: ElementRef,
                @Optional() private _dir: Directionality,
                private _ngZone: NgZone,
                private _viewportRuler: ViewportRuler) {
        super(elementRef);
    }

    ngAfterContentInit(): void {
        this._ngZone.runOutsideAngular(() => {
            const dirChange = this._dir ? this._dir.change : observableOf(null);

            // TODO _alignInkBar
            return merge(dirChange, this._viewportRuler.change(10))
                .pipe(takeUntil(this._onDestroy))
                .subscribe(() => { });
        });
    }

    ngOnDestroy() {
        this._onDestroy.next();
        this._onDestroy.complete();
    }
}


// Boilerplate for applying mixins to McTabLink.
export class McTabLinkBase { }
export const _McTabLinkMixinBase:
    HasTabIndexCtor &
    CanDisableCtor &
    typeof McTabLinkBase =
    mixinTabIndex(mixinDisabled(McTabLinkBase));

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
        '[class.mc-tab-disabled]': 'disabled',
        '[class.mc-tab-label-active]': 'active'
    }
})
export class McTabLink extends _McTabLinkMixinBase
    implements OnDestroy, CanDisable, HasTabIndex {

    /** Whether the link is active. */
    @Input()
    get active(): boolean { return this._isActive; }
    set active(value: boolean) {
        if (value !== this._isActive) {
            this._isActive = value;
        }
    }

    /** Whether the tab link is active or not. */
    protected _isActive: boolean = false;

    constructor(public _elementRef: ElementRef,
                @Attribute('tabindex') tabIndex: string,
        /**
         * @deprecated
         * @breaking-change 8.0.0 `_focusMonitor` parameter to be made required.
         */
                private focusMonitor?: FocusMonitor) {
        super();

        this.tabIndex = parseInt(tabIndex) || 0;

        if (focusMonitor) {
            focusMonitor.monitor(_elementRef.nativeElement);
        }
    }

    ngOnDestroy() {
        if (this.focusMonitor) {
            this.focusMonitor.stopMonitoring(this._elementRef.nativeElement);
        }
    }
}
