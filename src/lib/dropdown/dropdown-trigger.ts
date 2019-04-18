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
import { LEFT_ARROW, RIGHT_ARROW, SPACE, ENTER } from '@ptsecurity/cdk/keycodes';
import {
    FlexibleConnectedPositionStrategy,
    HorizontalConnectionPos,
    Overlay,
    OverlayConfig,
    OverlayRef,
    VerticalConnectionPos,
    IScrollStrategy
} from '@ptsecurity/cdk/overlay';
import { normalizePassiveListenerOptions } from '@ptsecurity/cdk/platform';
import { TemplatePortal } from '@ptsecurity/cdk/portal';
import { asapScheduler, merge, of as observableOf, Subscription } from 'rxjs';
import { delay, filter, take, takeUntil } from 'rxjs/operators';

import { throwMcDropdownMissingError } from './dropdown-errors';
import { McDropdownItem } from './dropdown-item';
import { McDropdownPanel } from './dropdown-panel';
import { DropdownPositionX, DropdownPositionY } from './dropdown-positions';
import { McDropdown } from './dropdown.component';


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

/** Default top padding of the nested dropdown panel. */
export const NESTED_PANEL_TOP_PADDING = 1;

/** Options for binding a passive event listener. */
const passiveEventListenerOptions = normalizePassiveListenerOptions({passive: true});

/**
 * This directive is intended to be used in conjunction with an mc-dropdown tag.  It is
 * responsible for toggling the display of the provided dropdown instance.
 */
@Directive({
    selector: `[mcDropdownTriggerFor]`,
    host: {
        'aria-haspopup': 'true',
        '[attr.aria-expanded]': 'opened || null',
        '(mousedown)': '_handleMousedown($event)',
        '(keydown)': '_handleKeydown($event)',
        '(click)': '_handleClick($event)',
        '[class.mc-dropdown-trigger__opened]': '_opened'
    },
    exportAs: 'mcDropdownTrigger'
})
export class McDropdownTrigger implements AfterContentInit, OnDestroy {


    /**
     * Handles touch start events on the trigger.
     * Needs to be an arrow function so we can easily use addEventListener and removeEventListener.
     */
    private _handleTouchStart = () => this._openedBy = 'touch';

    /** The text direction of the containing app. */
    get dir(): Direction {
        return this._dir && this._dir.value === 'rtl' ? 'rtl' : 'ltr';
    }

    // Tracking input type is necessary so it's possible to only auto-focus
    // the first item of the list when the dropdown is opened via the keyboard
    _openedBy: 'mouse' | 'touch' | null = null;



    /** References the dropdown instance that the trigger is associated with. */
    @Input('mcDropdownTriggerFor')
    get dropdown() {
        return this._dropdown;
    }

    set dropdown(dropdown: McDropdownPanel) {
        if (dropdown === this._dropdown) {
            return;
        }

        this._dropdown = dropdown;
        this._closeSubscription.unsubscribe();

        if (dropdown) {
            this._closeSubscription = dropdown.closed.asObservable().subscribe(reason => {
                this._destroy();

                // If a click closed the dropdown, we should close the entire chain of nested dropdowns.
                if ((reason === 'click' || reason === 'tab') && this._parent) {
                    this._parent.closed.emit(reason);
                }
            });
        }
    }

    private _dropdown: McDropdownPanel;

    /** Data to be passed along to any lazily-rendered content. */
    @Input('mcDropdownTriggerData') data: any;

    /** Event emitted when the associated dropdown is opened. */
    @Output() readonly dropdownOpened: EventEmitter<void> = new EventEmitter<void>();

    /** Event emitted when the associated dropdown is closed. */
    @Output() readonly dropdownClosed: EventEmitter<void> = new EventEmitter<void>();

    private _portal: TemplatePortal;
    private _overlayRef: OverlayRef | null = null;
    private _opened: boolean = false;
    private _closeSubscription = Subscription.EMPTY;
    private _hoverSubscription = Subscription.EMPTY;

    constructor(private _overlay: Overlay,
                private _element: ElementRef<HTMLElement>,
                private _viewContainerRef: ViewContainerRef,
                @Inject(MC_DROPDOWN_SCROLL_STRATEGY) private _scrollStrategy: any,
                @Optional() private _parent: McDropdown,
                @Optional() @Self() private _dropdownItemInstance: McDropdownItem,
                @Optional() private _dir: Directionality,
                private _focusMonitor?: FocusMonitor) {

        _element.nativeElement.addEventListener('touchstart', this._handleTouchStart,
            passiveEventListenerOptions);

        if (_dropdownItemInstance) {
            _dropdownItemInstance._triggersSubmenu = this.triggersSubmenu();
        }
    }

    ngAfterContentInit() {
        this._check();
        this._handleHover();
    }

    ngOnDestroy() {
        if (this._overlayRef) {
            this._overlayRef.dispose();
            this._overlayRef = null;
        }

        this._element.nativeElement.removeEventListener('touchstart', this._handleTouchStart,
            passiveEventListenerOptions);

        this._cleanUpSubscriptions();
        this._closeSubscription.unsubscribe();
    }

    /** Whether the dropdown is open. */
    get opened(): boolean {
        return this._opened;
    }

    /** Whether the dropdown triggers a sub-menu or a top-level one. */
    triggersSubmenu(): boolean {
        return !!(this._dropdownItemInstance && this._parent);
    }

    /** Toggles the dropdown between the open and closed states. */
    toggle(): void {
        // tslint:disable-next-line:no-void-expression
        return this._opened ? this.close() : this.open();
    }

    /** Opens the dropdown. */
    open(): void {
        if (this._opened) {
            return;
        }

        this._check();

        const overlayRef = this._createOverlay();
        const overlayConfig = overlayRef.getConfig();

        this._setPosition(overlayConfig.positionStrategy as FlexibleConnectedPositionStrategy);
        overlayConfig.hasBackdrop = this.dropdown.hasBackdrop == null ? !this.triggersSubmenu() :
            this.dropdown.hasBackdrop;
        overlayRef.attach(this._getPortal());

        if (this.dropdown.lazyContent) {
            this.dropdown.lazyContent.attach(this.data);
        }

        this._closeSubscription = this._closingActions().subscribe(() => this.close());
        this._init();

        if (this.dropdown instanceof McDropdown) {
            this.dropdown._startAnimation();
        }
    }

    /** Closes the dropdown. */
    close(): void {
        this.dropdown.closed.emit();
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

    /** Closes the dropdown and does the necessary cleanup. */
    private _destroy() {
        if (!this._overlayRef || !this.opened) {
            return;
        }

        const dropdown = this.dropdown;

        this._closeSubscription.unsubscribe();
        this._overlayRef.detach();

        if (dropdown instanceof McDropdown) {
            dropdown._resetAnimation();

            if (dropdown.lazyContent) {
                // Wait for the exit animation to finish before detaching the content.
                dropdown._animationDone
                    .pipe(
                        filter((event) => event.toState === 'void'),
                        take(1),
                        // Interrupt if the content got re-attached.
                        takeUntil(dropdown.lazyContent._attached)
                    )
                    .subscribe(() => dropdown.lazyContent!.detach(), undefined, () => {
                        // No matter whether the content got re-attached, reset the dropdown.
                        this._reset();
                    });
            } else {
                this._reset();
            }
        } else {
            this._reset();

            if (dropdown.lazyContent) {
                dropdown.lazyContent.detach();
            }
        }
    }

    /**
     * This method sets the dropdown state to open and focuses the first item if
     * the dropdown was opened via the keyboard.
     */
    private _init(): void {
        this.dropdown.parent = this.triggersSubmenu() ? this._parent : undefined;
        this.dropdown.direction = this.dir;
        this._setIsOpened(true);
        this.dropdown.focusFirstItem(this._openedBy || 'program');
    }

    /**
     * This method resets the dropdown when it's closed, most importantly restoring
     * focus to the dropdown trigger if the dropdown was opened via the keyboard.
     */
    private _reset(): void {
        this._setIsOpened(false);

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
    private _setIsOpened(isOpen: boolean): void {
        this._opened = isOpen;
        // tslint:disable-next-line:no-void-expression
        this._opened ? this.dropdownOpened.emit() : this.dropdownClosed.emit();

        if (this.triggersSubmenu()) {
            this._dropdownItemInstance._highlighted = isOpen;
        }
    }

    /**
     * This method checks that a valid instance of McDropdown has been passed into
     * mcDropdownTriggerFor. If not, an exception is thrown.
     */
    private _check() {
        if (!this.dropdown) {
            throwMcDropdownMissingError();
        }
    }

    /**
     * This method creates the overlay from the provided dropdown's template and saves its
     * OverlayRef so that it can be attached to the DOM when open is called.
     */
    private _createOverlay(): OverlayRef {
        if (!this._overlayRef) {
            const config = this._getOverlayConfig();
            this._subscribeToPositions(config.positionStrategy as FlexibleConnectedPositionStrategy);
            this._overlayRef = this._overlay.create(config);

            // Consume the `keydownEvents` in order to prevent them from going to another overlay.
            // Ideally we'd also have our keyboard event logic in here, however doing so will
            // break anybody that may have implemented the `McDropdownPanel` themselves.
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
                .withTransformOriginOn('.mc-dropdown__panel'),
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
            position.positionChanges.subscribe(change => {
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

        let [originX, originFallbackX, overlayX, overlayFallbackX]: HorizontalConnectionPos[] =
            this.dropdown.xPosition === 'before' ?
                ['end', 'start', 'end', 'start'] :
                ['start', 'end', 'start', 'end'];

        let [overlayY, overlayFallbackY, originY, originFallbackY]: VerticalConnectionPos[] =
            this.dropdown.yPosition === 'above' ?
                ['bottom', 'top', 'bottom', 'top'] :
                ['top', 'bottom', 'top', 'bottom'];

        let offsetY = 0;

        if (this.triggersSubmenu()) {
            // When the dropdown is a sub-menu, it should always align itself
            // to the edges of the trigger, instead of overlapping it.
            overlayFallbackX = originX = this.dropdown.xPosition === 'before' ? 'start' : 'end';
            originFallbackX = overlayX = originX === 'end' ? 'start' : 'end';
            offsetY = overlayY === 'bottom' ? NESTED_PANEL_TOP_PADDING : -NESTED_PANEL_TOP_PADDING;
        } else {
            if (!this.dropdown.overlapTriggerY) {
                originY = overlayY === 'top' ? 'bottom' : 'top';
                originFallbackY = overlayFallbackY === 'top' ? 'bottom' : 'top';
            }

            if (!this.dropdown.overlapTriggerX) {
                overlayFallbackX = originX = this.dropdown.xPosition === 'before' ? 'start' : 'end';
                originFallbackX = overlayX = originX === 'end' ? 'start' : 'end';
            }
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
    private _closingActions() {
        const backdrop = this._overlayRef!.backdropClick();
        const detachments = this._overlayRef!.detachments();
        const parentClose = this._parent ? this._parent.closed : observableOf();
        const hover = this._parent ? this._parent._hovered().pipe(
            filter(active => active !== this._dropdownItemInstance),
            filter(() => this._opened)
        ) : observableOf();

        return merge(backdrop, parentClose, hover, detachments);
    }

    /** Handles mouse presses on the trigger. */
    _handleMousedown(event: MouseEvent): void {
        // Since right or middle button clicks won't trigger the `click` event,
        // we shouldn't consider the dropdown as opened by mouse in those cases.
        this._openedBy = event.button === 0 ? 'mouse' : null;

        // Since clicking on the trigger won't close the dropdown if it opens a sub-menu,
        // we should prevent focus from moving onto it via click to avoid the
        // highlight from lingering on the dropdown item.
        if (this.triggersSubmenu()) {
            event.preventDefault();
        }
    }

    /** Handles key presses on the trigger. */
    _handleKeydown(event: KeyboardEvent): void {
        const keyCode = event.keyCode;

        if (keyCode == SPACE || keyCode == ENTER) {
            this.open();
        }

        if (this.triggersSubmenu() && (
            (keyCode === RIGHT_ARROW && this.dir === 'ltr') ||
            (keyCode === LEFT_ARROW && this.dir === 'rtl'))) {
            this.open();
        }
    }

    /** Handles click events on the trigger. */
    _handleClick(event: MouseEvent): void {
        if (this.triggersSubmenu()) {
            // Stop event propagation to avoid closing the parent dropdown.
            event.stopPropagation();
            this.open();
        } else {
            this.toggle();
        }
    }

    /** Handles the cases where the user hovers over the trigger. */
    private _handleHover() {
        // Subscribe to changes in the hovered item in order to toggle the panel.
        if (!this.triggersSubmenu()) {
            return;
        }

        this._hoverSubscription = this._parent._hovered()
        // Since we might have multiple competing triggers for the same dropdown (e.g. a sub-menu
        // with different data and triggers), we have to delay it by a tick to ensure that
        // it won't be closed immediately after it is opened.
            .pipe(
                filter(active => active === this._dropdownItemInstance && !active.disabled),
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
                        .pipe(take(1), delay(0, asapScheduler), takeUntil(this._parent._hovered()))
                        .subscribe(() => this.open());
                } else {
                    this.open();
                }
            });
    }

    /** Gets the portal that should be attached to the overlay. */
    private _getPortal(): TemplatePortal {
        // Note that we can avoid this check by keeping the portal on the dropdown panel.
        // While it would be cleaner, we'd have to introduce another required method on
        // `McDropdownPanel`, making it harder to consume.
        if (!this._portal || this._portal.templateRef !== this.dropdown.templateRef) {
            this._portal = new TemplatePortal(this.dropdown.templateRef, this._viewContainerRef);
        }

        return this._portal;
    }

}
