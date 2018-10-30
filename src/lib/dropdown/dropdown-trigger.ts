import {
    AfterContentInit,
    Directive,
    ElementRef,
    EventEmitter,
    Inject,
    InjectionToken,
    Input,
    OnDestroy, OnInit,
    Optional,
    Output,
    ViewContainerRef
} from '@angular/core';
import { FocusMonitor, FocusOrigin } from '@ptsecurity/cdk/a11y';
import { Direction, Directionality } from '@ptsecurity/cdk/bidi';
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
import { merge, Subscription } from 'rxjs';
import { filter, take, takeUntil } from 'rxjs/operators';

import { throwMcDropdownMissingError } from './dropdown-errors';
import { McDropdownPanel } from './dropdown-panel';
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

/**
 * This directive is intended to be used in conjunction with an mc-dropdown tag.  It is
 * responsible for toggling the display of the provided dropdown instance.
 */
@Directive({
    selector: `[mcDropdownTriggerFor]`,
    host: {
        'aria-haspopup': 'true',
        '[attr.aria-expanded]': 'opened || null',
        '(touchstart)': '_openedBy = "touch"',
        '(click)': 'toggle()'
    },
    exportAs: 'mcDropdownTrigger'
})
export class McDropdownTrigger implements OnInit, AfterContentInit, OnDestroy {

    /** Whether the dropdown is open. */
    get opened(): boolean {
        return this._opened;
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
                @Optional() private _dir: Directionality,
                private _focusMonitor?: FocusMonitor) {}

    ngOnInit(): void {
        this.dropdown.closed = this.dropdown.closed || new EventEmitter<void | 'click' | 'keydown' | 'tab'>();
    }

    ngAfterContentInit() {
        this._check();

        this.dropdown.closed.asObservable().subscribe(() => {
            this._destroy();
        });
    }

    ngOnDestroy() {
        if (this._overlayRef) {
            this._overlayRef.dispose();
            this._overlayRef = null;
        }

        this._cleanUpSubscriptions();
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
        this._setPosition(overlayRef.getConfig().positionStrategy as FlexibleConnectedPositionStrategy);
        overlayRef.attach(this._portal);

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
                    .subscribe(() => dropdown.lazyContent.detach(), undefined, () => {
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
        } else {
            this.focus(this._openedBy);
        }

        this._openedBy = null;
    }

    // set state rather than toggle to support triggers sharing a dropdown
    private _setIsOpened(isOpen: boolean): void {
        this._opened = isOpen;
        // tslint:disable-next-line:no-void-expression
        this._opened ? this.dropdownOpened.emit() : this.dropdownClosed.emit();
    }

    /**
     * This method checks that a valid instance of Dropdown has been passed into
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
            this._portal = new TemplatePortal(this.dropdown.templateRef, this._viewContainerRef);
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
            hasBackdrop: this.dropdown.hasBackdrop === null || this.dropdown.hasBackdrop === undefined
                ? true
                : this.dropdown.hasBackdrop,
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
            // todo possibly we should not recompute positions there
            /*position.positionChanges.subscribe((change) => {
                const posX: DropdownPositionX = change.connectionPair.overlayX === 'start' ? 'after' : 'before';
                const posY: DropdownPositionY = change.connectionPair.overlayY === 'top' ? 'below' : 'above';

                this.dropdown.setPositionClasses!(posX, posY);
            });*/
            position.positionChanges.subscribe(() => {
                this.dropdown.setPositionClasses!(this.dropdown.xPosition, this.dropdown.yPosition);
            });
        }
    }

    /**
     * Sets the appropriate positions on a position strategy
     * so the overlay connects with the trigger correctly.
     * @param positionStrategy Strategy whose position to update.
     */
    private _setPosition(positionStrategy: FlexibleConnectedPositionStrategy) {
        const [originX, originFallbackX]: HorizontalConnectionPos[] =
            this.dropdown.xPosition === 'before' ? ['end', 'start'] : ['start', 'end'];

        const [overlayY, overlayFallbackY]: VerticalConnectionPos[] =
            this.dropdown.yPosition === 'above' ? ['bottom', 'top'] : ['top', 'bottom'];

        let [originY, originFallbackY] = [overlayY, overlayFallbackY];
        const [overlayX, overlayFallbackX] = [originX, originFallbackX];
        const offsetY = 0;

        if (!this.dropdown.overlapTrigger) {
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
    private _closingActions() {
        const backdrop = this._overlayRef!.backdropClick();
        const detachments = this._overlayRef!.detachments();

        return merge(backdrop, detachments);
    }
}
