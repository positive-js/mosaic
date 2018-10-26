import {
    AfterContentInit,
    Directive,
    ElementRef,
    EventEmitter,
    Inject,
    InjectionToken,
    Input,
    OnDestroy,
    Optional,
    Output,
    Self,
    ViewContainerRef
} from '@angular/core';
import { FocusMonitor, FocusOrigin } from '@ptsecurity/cdk/a11y';
import { Direction, Directionality } from '@ptsecurity/cdk/bidi';
import { LEFT_ARROW, RIGHT_ARROW } from '@ptsecurity/cdk/keycodes';
import {
    FlexibleConnectedPositionStrategy,
    HorizontalConnectionPos,
    Overlay,
    OverlayConfig,
    OverlayRef,
    VerticalConnectionPos,
    IScrollStrategy
} from '@ptsecurity/cdk/overlay';
import { TemplatePortal } from '@ptsecurity/cdk/portal';
import { asapScheduler, merge, of as observableOf, Subscription } from 'rxjs';
import { delay, filter, take, takeUntil } from 'rxjs/operators';

import { McDropdown } from './dropdown';
import { throwMcDropdownMissingError } from './dropdown-errors';
import { McDropdownItem } from './dropdown-item';
import { McDropdownPanel } from './dropdown-panel';
import { DropdownPositionX, DropdownPositionY } from './dropdown-positions';


/** Injection token that determines the scroll handling while the dropdown is open. */
export const MC_DROPDOWN_SCROLL_STRATEGY =
    new InjectionToken<() => IScrollStrategy>('mc-dropdown-scroll-strategy');

/** @docs-private */
export function MC_DROPDOWN_SCROLL_STRATEGY_FACTORY(overlay: Overlay): () => IScrollStrategy {
    return () => overlay.scrollStrategies.reposition();
}

/** @docs-private */
export const MC_DROPDOWN_SCROLL_STRATEGY_FACTORY_PROVIDER = {
    provide: MC_DROPDOWN_SCROLL_STRATEGY,
    deps: [Overlay],
    useFactory: MC_DROPDOWN_SCROLL_STRATEGY_FACTORY
};

/** Default top padding of the dropdown panel. */
export const MENU_PANEL_TOP_PADDING = 8;

/**
 * This directive is intended to be used in conjunction with an mc-dropdown tag.  It is
 * responsible for toggling the display of the provided dropdown instance.
 */
@Directive({
    selector: `[mcDropdownTriggerFor]`,
    host: {
        'aria-haspopup': 'true',
        '[attr.aria-expanded]': 'menuOpen || null',
        '(touchstart)': '_openedBy = "touch"',
        '(keydown)': '_handleKeydown($event)',
        '(click)': '_handleClick($event)'
    },
    exportAs: 'mcDropdownTrigger'
})
export class McDropdownTrigger implements AfterContentInit, OnDestroy {

    /** Whether the dropdown is open. */
    get menuOpen(): boolean {
        return this._menuOpen;
    }

    /** The text direction of the containing app. */
    get dir(): Direction {
        return this._dir && this._dir.value === 'rtl' ? 'rtl' : 'ltr';
    }

    // Tracking input type is necessary so it's possible to only auto-focus
    // the first item of the list when the dropdown is opened via the keyboard
    _openedBy: 'mouse' | 'touch' | null = null;

    /** References the dropdown instance that the trigger is associated with. */
    @Input('mcDropdownTriggerFor') dropdown: McDropdownPanel;

    /** Data to be passed along to any lazily-rendered content. */
    @Input('mcDropdownTriggerData') dropdownData: any;

    /** Event emitted when the associated dropdown is opened. */
    @Output() readonly dropdownOpened: EventEmitter<void> = new EventEmitter<void>();

    /** Event emitted when the associated dropdown is closed. */
    @Output() readonly dropdownClosed: EventEmitter<void> = new EventEmitter<void>();

    /**
     * Event emitted when the associated dropdown is closed.
     * @deprecated Switch to `dropdownClosed` instead
     * @breaking-change 8.0.0
     */
        // tslint:disable-next-line:no-output-on-prefix
    @Output() readonly onMenuClose: EventEmitter<void> = this.dropdownClosed;
    private _portal: TemplatePortal;
    private _overlayRef: OverlayRef | null = null;
    private _menuOpen: boolean = false;
    private _closeSubscription = Subscription.EMPTY;
    private _hoverSubscription = Subscription.EMPTY;
    private _scrollStrategy: () => IScrollStrategy;


    get parentMenu() {
        return this._parentMenu;
    }

    constructor(private _overlay: Overlay,
                private _element: ElementRef<HTMLElement>,
                private _viewContainerRef: ViewContainerRef,
                @Inject(MC_DROPDOWN_SCROLL_STRATEGY) scrollStrategy: any,
                @Optional() private _parentMenu: McDropdown,
                @Optional() @Self() private _menuItemInstance: McDropdownItem,
                @Optional() private _dir: Directionality,
                private _focusMonitor?: FocusMonitor) {

        if (_menuItemInstance) {
            _menuItemInstance._triggersSubmenu = this.triggersSubmenu();
        }

        this._scrollStrategy = scrollStrategy;
    }

    ngAfterContentInit() {
        this._checkMenu();

        this.dropdown.close.asObservable().subscribe((reason) => {
            this._destroyMenu();

            // If a click closed the dropdown, we should close the entire chain of nested menus.
            if ((reason === 'click' || reason === 'tab') && this._parentMenu) {
                this._parentMenu.closed.emit(reason);
            }
        });

        this._handleHover();
    }

    ngOnDestroy() {
        if (this._overlayRef) {
            this._overlayRef.dispose();
            this._overlayRef = null;
        }

        this._cleanUpSubscriptions();
    }

    /** Whether the dropdown triggers a sub-dropdown or a top-level one. */
    triggersSubmenu(): boolean {
        return !!(this._menuItemInstance && this._parentMenu);
    }

    /** Toggles the dropdown between the open and closed states. */
    toggleMenu(): void {
        // tslint:disable-next-line:no-void-expression
        return this._menuOpen ? this.closeMenu() : this.openMenu();
    }

    /** Opens the dropdown. */
    openMenu(): void {
        if (this._menuOpen) {
            return;
        }

        this._checkMenu();

        const overlayRef = this._createOverlay();
        this._setPosition(overlayRef.getConfig().positionStrategy as FlexibleConnectedPositionStrategy);
        overlayRef.attach(this._portal);

        if (this.dropdown.lazyContent) {
            this.dropdown.lazyContent.attach(this.dropdownData);
        }

        this._closeSubscription = this._menuClosingActions().subscribe(() => this.closeMenu());
        this._initMenu();

        if (this.dropdown instanceof McDropdown) {
            this.dropdown._startAnimation();
        }
    }

    /** Closes the dropdown. */
    closeMenu(): void {
        this.dropdown.close.emit();
    }

    /**
     * Focuses the dropdown trigger.
     * @param origin Source of the dropdown trigger's focus.
     */
    focus(origin: FocusOrigin = 'program') {
        if (this._focusMonitor) {
            this._focusMonitor.focusVia(this._element.nativeElement, origin);
        } else {
            this._element.nativeElement.focus();
        }
    }

    /** Handles key presses on the trigger. */
    _handleKeydown(event: KeyboardEvent): void {
        // tslint:disable-next-line:deprecation
        const keyCode = event.keyCode;

        if (this.triggersSubmenu() && (
            (keyCode === RIGHT_ARROW && this.dir === 'ltr') ||
            (keyCode === LEFT_ARROW && this.dir === 'rtl'))) {
            this.openMenu();
        }
    }

    /** Handles click events on the trigger. */
    _handleClick(event: MouseEvent): void {
        if (this.triggersSubmenu()) {
            // Stop event propagation to avoid closing the parent dropdown.
            event.stopPropagation();
            this.openMenu();
        } else {
            this.toggleMenu();
        }
    }

    /** Closes the dropdown and does the necessary cleanup. */
    private _destroyMenu() {
        if (!this._overlayRef || !this.menuOpen) {
            return;
        }

        const menu = this.dropdown;

        this._closeSubscription.unsubscribe();
        this._overlayRef.detach();

        if (menu instanceof McDropdown) {
            menu._resetAnimation();

            if (menu.lazyContent) {
                // Wait for the exit animation to finish before detaching the content.
                menu._animationDone
                    .pipe(
                        filter((event) => event.toState === 'void'),
                        take(1),
                        // Interrupt if the content got re-attached.
                        takeUntil(menu.lazyContent._attached)
                    )
                    .subscribe(() => menu.lazyContent.detach(), undefined, () => {
                        // No matter whether the content got re-attached, reset the dropdown.
                        this._resetMenu();
                    });
            } else {
                this._resetMenu();
            }
        } else {
            this._resetMenu();

            if (menu.lazyContent) {
                menu.lazyContent.detach();
            }
        }
    }

    /**
     * This method sets the dropdown state to open and focuses the first item if
     * the dropdown was opened via the keyboard.
     */
    private _initMenu(): void {
        // this.dropdown.parentMenu = this.triggersSubmenu() ? this._parentMenu : undefined;
        this.dropdown.direction = this.dir;
        this._setMenuElevation();
        this._setIsMenuOpen(true);
        this.dropdown.focusFirstItem(this._openedBy || 'program');
    }

    /** Updates the dropdown elevation based on the amount of parent menus that it has. */
    private _setMenuElevation(): void {
        if (this.dropdown.setElevation) {
            let depth = 0;
            // let parentMenu = this.dropdown.parentMenu;
            let parentMenu;

            while (parentMenu) {
                depth++;
                parentMenu = parentMenu.parentMenu;
            }

            this.dropdown.setElevation(depth);
        }
    }

    /**
     * This method resets the dropdown when it's closed, most importantly restoring
     * focus to the dropdown trigger if the dropdown was opened via the keyboard.
     */
    private _resetMenu(): void {
        this._setIsMenuOpen(false);

        // We should reset focus if the user is navigating using a keyboard or
        // if we have a top-level trigger which might cause focus to be lost
        // when clicking on the backdrop.
        if (!this._openedBy) {
            // Note that the focus style will show up both for `program` and
            // `keyboard` so we don't have to specify which one it is.
            this.focus();
        } else if (!this.triggersSubmenu()) {
            this.focus(this._openedBy);
        }

        this._openedBy = null;
    }

    // set state rather than toggle to support triggers sharing a dropdown
    private _setIsMenuOpen(isOpen: boolean): void {
        this._menuOpen = isOpen;
        // tslint:disable-next-line:no-void-expression
        this._menuOpen ? this.dropdownOpened.emit() : this.dropdownClosed.emit();

        if (this.triggersSubmenu()) {
            this._menuItemInstance._highlighted = isOpen;
        }
    }

    /**
     * This method checks that a valid instance of MatMenu has been passed into
     * matMenuTriggerFor. If not, an exception is thrown.
     */
    private _checkMenu() {
        if (!this.dropdown) {
            throwMcDropdownMissingError();
        }
    }

    /**
     * This method creates the overlay from the provided dropdown's template and saves its
     * OverlayRef so that it can be attached to the DOM when openMenu is called.
     */
    private _createOverlay(): OverlayRef {
        if (!this._overlayRef) {
            this._portal = new TemplatePortal(this.dropdown.templateRef, this._viewContainerRef);
            const config = this._getOverlayConfig();
            this._subscribeToPositions(config.positionStrategy as FlexibleConnectedPositionStrategy);
            this._overlayRef = this._overlay.create(config);

            // Consume the `keydownEvents` in order to prevent them from going to another overlay.
            // Ideally we'd also have our keyboard event logic in here, however doing so will
            // break anybody that may have implemented the `MatMenuPanel` themselves.
            this._overlayRef.keydownEvents().subscribe();
        }

        return this._overlayRef;
    }

    /**
     * This method builds the configuration object needed to create the overlay, the OverlayState.
     * @returns OverlayConfig
     */
    private _getOverlayConfig(): OverlayConfig {
        return new OverlayConfig({
            positionStrategy: this._overlay.position()
                .flexibleConnectedTo(this._element)
                .withLockedPosition()
                .withTransformOriginOn('.mat-dropdown-panel'),
            hasBackdrop: this.dropdown.hasBackdrop == null ? !this.triggersSubmenu() : this.dropdown.hasBackdrop,
            backdropClass: this.dropdown.backdropClass || 'cdk-overlay-transparent-backdrop',
            scrollStrategy: this._scrollStrategy(),
            direction: this._dir
        });
    }

    /**
     * Listens to changes in the position of the overlay and sets the correct classes
     * on the dropdown based on the new position. This ensures the animation origin is always
     * correct, even if a fallback position is used for the overlay.
     */
    private _subscribeToPositions(position: FlexibleConnectedPositionStrategy): void {
        if (this.dropdown.setPositionClasses) {
            position.positionChanges.subscribe((change) => {
                const posX: DropdownPositionX = change.connectionPair.overlayX === 'start' ? 'after' : 'before';
                const posY: DropdownPositionY = change.connectionPair.overlayY === 'top' ? 'below' : 'above';

                this.dropdown.setPositionClasses!(posX, posY);
            });
        }
    }

    /**
     * Sets the appropriate positions on a position strategy
     * so the overlay connects with the trigger correctly.
     * @param positionStrategy Strategy whose position to update.
     */
    private _setPosition(positionStrategy: FlexibleConnectedPositionStrategy) {
        let [originX, originFallbackX]: HorizontalConnectionPos[] =
            this.dropdown.xPosition === 'before' ? ['end', 'start'] : ['start', 'end'];

        const [overlayY, overlayFallbackY]: VerticalConnectionPos[] =
            this.dropdown.yPosition === 'above' ? ['bottom', 'top'] : ['top', 'bottom'];

        let [originY, originFallbackY] = [overlayY, overlayFallbackY];
        let [overlayX, overlayFallbackX] = [originX, originFallbackX];
        let offsetY = 0;

        if (this.triggersSubmenu()) {
            // When the dropdown is a sub-dropdown, it should always align itself
            // to the edges of the trigger, instead of overlapping it.
            overlayFallbackX = originX = this.dropdown.xPosition === 'before' ? 'start' : 'end';
            originFallbackX = overlayX = originX === 'end' ? 'start' : 'end';
            offsetY = overlayY === 'bottom' ? MENU_PANEL_TOP_PADDING : -MENU_PANEL_TOP_PADDING;
        } else if (!this.dropdown.overlapTrigger) {
            originY = overlayY === 'top' ? 'bottom' : 'top';
            originFallbackY = overlayFallbackY === 'top' ? 'bottom' : 'top';
        }

        positionStrategy.withPositions([
            {originX, originY, overlayX, overlayY, offsetY},
            {originX: originFallbackX, originY, overlayX: overlayFallbackX, overlayY, offsetY},
            {
                originX,
                originY: originFallbackY,
                overlayX,
                overlayY: overlayFallbackY,
                offsetY: -offsetY
            },
            {
                originX: originFallbackX,
                originY: originFallbackY,
                overlayX: overlayFallbackX,
                overlayY: overlayFallbackY,
                offsetY: -offsetY
            }
        ]);
    }

    /** Cleans up the active subscriptions. */
    private _cleanUpSubscriptions(): void {
        this._closeSubscription.unsubscribe();
        this._hoverSubscription.unsubscribe();
    }

    /** Returns a stream that emits whenever an action that should close the dropdown occurs. */
    private _menuClosingActions() {
        const backdrop = this._overlayRef!.backdropClick();
        const detachments = this._overlayRef!.detachments();
        const parentClose = this._parentMenu ? this._parentMenu.closed : observableOf();
        const hover = this._parentMenu ? this._parentMenu._hovered().pipe(
            filter((active) => active !== this._menuItemInstance),
            filter(() => this._menuOpen)
        ) : observableOf();

        return merge(backdrop, parentClose, hover, detachments);
    }

    /** Handles the cases where the user hovers over the trigger. */
    private _handleHover() {
        // Subscribe to changes in the hovered item in order to toggle the panel.
        if (!this.triggersSubmenu()) {
            return;
        }

        this._hoverSubscription = this._parentMenu._hovered()
        // Since we might have multiple competing triggers for the same dropdown (e.g. a sub-dropdown
        // with different data and triggers), we have to delay it by a tick to ensure that
        // it won't be closed immediately after it is opened.
            .pipe(
                filter((active) => active === this._menuItemInstance && !active.disabled),
                delay(0, asapScheduler)
            )
            .subscribe(() => {
                this._openedBy = 'mouse';

                // If the same dropdown is used between multiple triggers, it might still be animating
                // while the new trigger tries to re-open it. Wait for the animation to finish
                // before doing so. Also interrupt if the user moves to another item.
                if (this.dropdown instanceof McDropdown && this.dropdown._isAnimating) {
                    // We need the `delay(0)` here in order to avoid
                    // 'changed after checked' errors in some cases. See #12194.
                    this.dropdown._animationDone
                        .pipe(take(1), delay(0, asapScheduler), takeUntil(this._parentMenu._hovered()))
                        .subscribe(() => this.openMenu());
                } else {
                    this.openMenu();
                }
            });
    }

}
