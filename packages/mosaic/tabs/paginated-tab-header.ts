import { FocusKeyManager, FocusableOption } from '@angular/cdk/a11y';
import { Direction, Directionality } from '@angular/cdk/bidi';
import { coerceNumberProperty } from '@angular/cdk/coercion';
import { ENTER, SPACE, hasModifierKey } from '@angular/cdk/keycodes';
import { Platform, normalizePassiveListenerOptions } from '@angular/cdk/platform';
import { ViewportRuler } from '@angular/cdk/scrolling';
import {
    ChangeDetectorRef,
    ElementRef,
    NgZone,
    Optional,
    QueryList,
    EventEmitter,
    AfterContentChecked,
    AfterContentInit,
    AfterViewInit,
    OnDestroy,
    Directive,
    Inject,
    Input
} from '@angular/core';
import { ANIMATION_MODULE_TYPE } from '@angular/platform-browser/animations';
import { DOWN_ARROW, END, HOME, LEFT_ARROW, RIGHT_ARROW, UP_ARROW } from '@ptsecurity/cdk/keycodes';
import { merge, of as observableOf, Subject, timer, fromEvent } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


/** Config used to bind passive event listeners */
const passiveEventListenerOptions = normalizePassiveListenerOptions({ passive: true }) as EventListenerOptions;

/**
 * The directions that scrolling can go in when the header's tabs exceed the header width. 'After'
 * will scroll the header towards the end of the tabs list and 'before' will scroll towards the
 * beginning of the list.
 */
export type ScrollDirection = 'after' | 'before';

/**
 * The distance in pixels that will be overshot when scrolling a tab label into view. This helps
 * provide a small affordance to the label next to it.
 */
const EXAGGERATED_OVERSCROLL = 60;

/**
 * Amount of milliseconds to wait before starting to scroll the header automatically.
 * Set a little conservatively in order to handle fake events dispatched on touch devices.
 */
const HEADER_SCROLL_DELAY = 650;

/**
 * Interval in milliseconds at which to scroll the header
 * while the user is holding their pointer.
 */
const HEADER_SCROLL_INTERVAL = 100;

const VIEWPORT_THROTTLE_TIME = 150;
const SCROLL_DISTANCE_DELIMITER = 3;

/** Item inside a paginated tab header. */
export type McPaginatedTabHeaderItem = FocusableOption & { elementRef: ElementRef };

/**
 * Base class for a tab header that supported pagination.
 * @docs-private
 */
@Directive()
// tslint:disable-next-line:naming-convention
export abstract class McPaginatedTabHeader implements AfterContentChecked, AfterContentInit, AfterViewInit, OnDestroy {
    /** The index of the active tab. */
    get selectedIndex(): number {
        return this._selectedIndex;
    }

    set selectedIndex(value: number) {
        const coercedValue = coerceNumberProperty(value);
        this.selectedIndexChanged = this._selectedIndex !== coercedValue;
        this._selectedIndex = coercedValue;

        this.keyManager?.updateActiveItem(coercedValue);
    }

    private _selectedIndex = 0;


    /** Tracks which element has focus; used for keyboard navigation */
    get focusIndex(): number {
        return this.keyManager ? this.keyManager.activeItemIndex! : 0;
    }

    /** When the focus index is set, we must manually send focus to the correct label */
    set focusIndex(value: number) {
        if (!this.isValidIndex(value) || this.focusIndex === value || !this.keyManager) { return; }

        this.keyManager.setActiveItem(value);
    }

    /** Sets the distance in pixels that the tab header should be transformed in the X-axis. */
    get scrollDistance(): number {
        return this._scrollDistance;
    }

    set scrollDistance(v: number) {
        this._scrollDistance = Math.max(0, Math.min(this.getMaxScrollDistance(), v));

        // Mark that the scroll distance has changed so that after the view is checked, the CSS
        // transformation can move the header.
        this.scrollDistanceChanged = true;
        this.checkScrollingControls();
    }

    /** The distance in pixels that the tab labels should be translated to the left. */
    private _scrollDistance = 0;

    abstract items: QueryList<McPaginatedTabHeaderItem>;
    abstract inkBar: any;
    abstract tabListContainer: ElementRef<HTMLElement>;
    abstract tabList: ElementRef<HTMLElement>;
    abstract nextPaginator: ElementRef<HTMLElement>;
    abstract previousPaginator: ElementRef<HTMLElement>;

    /** Event emitted when the option is selected. */
    readonly selectFocusedIndex: EventEmitter<number> = new EventEmitter<number>();

    /** Event emitted when a label is focused. */
    readonly indexFocused: EventEmitter<number> = new EventEmitter<number>();

    /** Whether the controls for pagination should be displayed */
    showPaginationControls = false;

    /** Whether the tab list can be scrolled more towards the end of the tab label list. */
    disableScrollAfter = true;

    /** Whether the tab list can be scrolled more towards the beginning of the tab label list. */
    disableScrollBefore = true;

    /**
     * Whether pagination should be disabled. This can be used to avoid unnecessary
     * layout recalculations if it's known that pagination won't be required.
     */
    @Input()
    disablePagination: boolean = false;

    /** Emits when the component is destroyed. */
    protected readonly destroyed = new Subject<void>();

    protected vertical: boolean = false;

    /**
     * The number of tab labels that are displayed on the header. When this changes, the header
     * should re-evaluate the scroll position.
     */
    private tabLabelCount: number;

    /** Whether the scroll distance has changed and should be applied after the view is checked. */
    private scrollDistanceChanged: boolean;

    /** Used to manage focus between the tabs. */
    private keyManager: FocusKeyManager<McPaginatedTabHeaderItem>;

    /** Cached text content of the header. */
    private currentTextContent: string;

    /** Stream that will stop the automated scrolling. */
    private stopScrolling = new Subject<void>();

    /** Whether the header should scroll to the selected index after the view has been checked. */
    private selectedIndexChanged = false;

    constructor(
        protected elementRef: ElementRef<HTMLElement>,
        protected changeDetectorRef: ChangeDetectorRef,
        private viewportRuler: ViewportRuler,
        private ngZone: NgZone,
        private platform: Platform,
        @Optional() private dir: Directionality,
        @Optional() @Inject(ANIMATION_MODULE_TYPE) public animationMode?: string
    ) {

        // Bind the `mouseleave` event on the outside since it doesn't change anything in the view.
        ngZone.runOutsideAngular(() => {
            fromEvent(elementRef.nativeElement, 'mouseleave')
                .pipe(takeUntil(this.destroyed))
                .subscribe(() => this.stopInterval());
        });
    }

    /** Called when the user has selected an item via the keyboard. */
    ngAfterViewInit() {
        // We need to handle these events manually, because we want to bind passive event listeners.
        fromEvent(this.previousPaginator.nativeElement, 'touchstart', passiveEventListenerOptions)
            .pipe(takeUntil(this.destroyed))
            .subscribe(() => this.handlePaginatorPress('before'));

        fromEvent(this.nextPaginator.nativeElement, 'touchstart', passiveEventListenerOptions)
            .pipe(takeUntil(this.destroyed))
            .subscribe(() => this.handlePaginatorPress('after'));
    }

    ngAfterContentInit() {
        const dirChange = this.dir ? this.dir.change : observableOf('ltr');
        const resize = this.viewportRuler.change(VIEWPORT_THROTTLE_TIME);

        const realign = () => {
            this.updatePagination();
            this.alignInkBarToSelectedTab();
        };

        this.keyManager = new FocusKeyManager<McPaginatedTabHeaderItem>(this.items)
            .withHorizontalOrientation(this.getLayoutDirection());

        this.keyManager.updateActiveItem(this._selectedIndex);

        // Defer the first call in order to allow for slower browsers to lay out the elements.
        // This helps in cases where the user lands directly on a page with paginated tabs.
        typeof requestAnimationFrame !== undefined ? requestAnimationFrame(realign) : realign();

        // On dir change or window resize, realign the ink bar and update the orientation of
        // the key manager if the direction has changed.
        merge(dirChange, resize, this.items.changes)
            .pipe(takeUntil(this.destroyed))
            .subscribe(() => {
                // We need to defer this to give the browser some time to recalculate
                // the element dimensions. The call has to be wrapped in `NgZone.run`,
                // because the viewport change handler runs outside of Angular.
                this.ngZone.run(() => Promise.resolve().then(realign));
                this.keyManager.withHorizontalOrientation(this.getLayoutDirection());
            });

        // If there is a change in the focus key manager we need to emit the `indexFocused`
        // event in order to provide a public event that notifies about focus changes. Also we realign
        // the tabs container by scrolling the new focused tab into the visible section.
        this.keyManager.change
            .pipe(takeUntil(this.destroyed))
            .subscribe((newFocusIndex) => {
                this.indexFocused.emit(newFocusIndex);
                this.setTabFocus(newFocusIndex);
            });
    }

    ngAfterContentChecked(): void {
        // If the number of tab labels have changed, check if scrolling should be enabled
        if (this.tabLabelCount !== this.items.length) {
            this.updatePagination();
            this.tabLabelCount = this.items.length;
            this.changeDetectorRef.markForCheck();
        }

        // If the selected index has changed, scroll to the label and check if the scrolling controls
        // should be disabled.
        if (this.selectedIndexChanged) {
            this.scrollToLabel(this._selectedIndex);
            this.checkScrollingControls();
            this.alignInkBarToSelectedTab();
            this.selectedIndexChanged = false;
            this.changeDetectorRef.markForCheck();
        }

        // If the scroll distance has been changed (tab selected, focused, scroll controls activated),
        // then translate the header to reflect this.
        if (this.scrollDistanceChanged) {
            this.updateTabScrollPosition();
            this.scrollDistanceChanged = false;
            this.changeDetectorRef.markForCheck();
        }
    }

    ngOnDestroy() {
        this.destroyed.next();
        this.destroyed.complete();
        this.stopScrolling.complete();
    }

    handleKeydown(event: KeyboardEvent) {
        // We don't handle any key bindings with a modifier key.
        if (hasModifierKey(event)) { return; }

        // tslint:disable-next-line: deprecation
        const key = event.keyCode;

        if (key === HOME) {
            this.keyManager.setFirstItemActive();
        } else if (key === END) {
            this.keyManager.setLastItemActive();
        } else if (key === UP_ARROW && this.vertical) {
            this.keyManager.setPreviousItemActive();
        } else if (key === DOWN_ARROW && this.vertical) {
            this.keyManager.setNextItemActive();
        } else if (key === RIGHT_ARROW && !this.vertical) {
            this.keyManager.setNextItemActive();
        } else if (key === LEFT_ARROW && !this.vertical) {
            this.keyManager.setPreviousItemActive();
        } else if ([ENTER, SPACE].includes(key)) {
            this.selectFocusedIndex.emit(this.focusIndex);
        }

        if ([HOME, END, UP_ARROW, DOWN_ARROW, RIGHT_ARROW, LEFT_ARROW, SPACE, ENTER].includes(key)) {
            event.preventDefault();
        }
    }

    /**
     * Callback for when the MutationObserver detects that the content has changed.
     */
    onContentChanges() {
        const textContent = this.elementRef.nativeElement.textContent;

        // We need to diff the text content of the header, because the MutationObserver callback
        // will fire even if the text content didn't change which is inefficient and is prone
        // to infinite loops if a poorly constructed expression is passed in (see #14249).
        if (textContent !== this.currentTextContent) {
            this.currentTextContent = textContent || '';

            // The content observer runs outside the `NgZone` by default, which
            // means that we need to bring the callback back in ourselves.
            this.ngZone.run(() => {
                this.updatePagination();
                this.alignInkBarToSelectedTab();
                this.changeDetectorRef.markForCheck();
            });
        }
    }

    /**
     * Updates the view whether pagination should be enabled or not.
     *
     * WARNING: Calling this method can be very costly in terms of performance. It should be called
     * as infrequently as possible from outside of the Tabs component as it causes a reflow of the
     * page.
     */
    updatePagination() {
        this.checkPaginationEnabled();
        this.checkScrollingControls();
        this.updateTabScrollPosition();
    }

    /**
     * Determines if an index is valid.  If the tabs are not ready yet, we assume that the user is
     * providing a valid index and return true.
     */
    isValidIndex(index: number): boolean {
        if (!this.items) { return true; }

        const tab = this.items ? this.items.toArray()[index] : null;

        return !!tab && !tab.disabled;
    }

    /**
     * Sets focus on the HTML element for the label wrapper and scrolls it into the view if
     * scrolling is enabled.
     */
    setTabFocus(tabIndex: number) {
        if (this.showPaginationControls) {
            this.scrollToLabel(tabIndex);
        }

        if (this.items?.length) {
            this.items.toArray()[tabIndex].focus();

            // Do not let the browser manage scrolling to focus the element, this will be handled
            // by using translation. In LTR, the scroll left should be 0. In RTL, the scroll width
            // should be the full width minus the offset width.
            const containerEl = this.tabListContainer.nativeElement;
            const dir = this.getLayoutDirection();

            if (dir === 'ltr') {
                containerEl.scrollLeft = 0;
            } else {
                containerEl.scrollLeft = containerEl.scrollWidth - containerEl.offsetWidth;
            }
        }
    }

    /** The layout direction of the containing app. */
    getLayoutDirection(): Direction {
        return this.dir?.value === 'rtl' ? 'rtl' : 'ltr';
    }

    /** Performs the CSS transformation on the tab list that will cause the list to scroll. */
    updateTabScrollPosition() {
        if (this.disablePagination) { return; }

        const scrollDistance = this.scrollDistance;
        const translateX = this.getLayoutDirection() === 'ltr' ? -scrollDistance : scrollDistance;

        // Don't use `translate3d` here because we don't want to create a new layer. A new layer
        // seems to cause flickering and overflow in Internet Explorer. For example, the ink bar
        // and ripples will exceed the boundaries of the visible tab bar.
        // See: https://github.com/angular/components/issues/10276
        // We round the `transform` here, because transforms with sub-pixel precision cause some
        // browsers to blur the content of the element.
        this.tabList.nativeElement.style.transform = `translateX(${Math.round(translateX)}px)`;

        // Setting the `transform` on IE will change the scroll offset of the parent, causing the
        // position to be thrown off in some cases. We have to reset it ourselves to ensure that
        // it doesn't get thrown off. Note that we scope it only to IE and Edge, because messing
        // with the scroll position throws off Chrome 71+ in RTL mode (see #14689).
        if (this.platform.TRIDENT || this.platform.EDGE) {
            this.tabListContainer.nativeElement.scrollLeft = 0;
        }
    }

    /**
     * Moves the tab list in the 'before' or 'after' direction (towards the beginning of the list or
     * the end of the list, respectively). The distance to scroll is computed to be a third of the
     * length of the tab list view window.
     *
     * This is an expensive call that forces a layout reflow to compute box and scroll metrics and
     * should be called sparingly.
     */
    scrollHeader(direction: ScrollDirection) {
        const viewLength = this.tabListContainer.nativeElement.offsetWidth;

        // Move the scroll distance one-third the length of the tab list's viewport.
        const scrollAmount = (direction === 'before' ? -1 : 1) * viewLength / SCROLL_DISTANCE_DELIMITER;

        return this.scrollTo(this.scrollDistance + scrollAmount);
    }

    /** Handles click events on the pagination arrows. */
    handlePaginatorClick(direction: ScrollDirection) {
        this.stopInterval();
        this.scrollHeader(direction);
    }

    /**
     * Moves the tab list such that the desired tab label (marked by index) is moved into view.
     *
     * This is an expensive call that forces a layout reflow to compute box and scroll metrics and
     * should be called sparingly.
     */
    scrollToLabel(labelIndex: number) {
        if (this.disablePagination) { return; }

        const selectedLabel = this.items ? this.items.toArray()[labelIndex] : null;

        if (!selectedLabel) { return; }

        // The view length is the visible width of the tab labels.
        const viewLength = this.tabListContainer.nativeElement.offsetWidth;
        const { offsetLeft, offsetWidth } = selectedLabel.elementRef.nativeElement;

        let labelBeforePos: number;
        let labelAfterPos: number;

        if (this.getLayoutDirection() === 'ltr') {
            labelBeforePos = offsetLeft;
            labelAfterPos = labelBeforePos + (offsetWidth as number);
        } else {
            labelAfterPos = this.tabList.nativeElement.offsetWidth - offsetLeft;
            labelBeforePos = labelAfterPos - offsetWidth;
        }

        const beforeVisiblePos = this.scrollDistance;
        const afterVisiblePos = this.scrollDistance + viewLength;

        if (labelBeforePos < beforeVisiblePos) {
            // Scroll header to move label to the before direction
            this.scrollDistance -= beforeVisiblePos - labelBeforePos + EXAGGERATED_OVERSCROLL;
        } else if (labelAfterPos > afterVisiblePos) {
            // Scroll header to move label to the after direction
            this.scrollDistance += labelAfterPos - afterVisiblePos + EXAGGERATED_OVERSCROLL;
        }
    }

    /**
     * Evaluate whether the pagination controls should be displayed. If the scroll width of the
     * tab list is wider than the size of the header container, then the pagination controls should
     * be shown.
     *
     * This is an expensive call that forces a layout reflow to compute box and scroll metrics and
     * should be called sparingly.
     */
    checkPaginationEnabled() {
        if (this.disablePagination) {
            this.showPaginationControls = false;
        } else {
            const isEnabled = this.tabList.nativeElement.scrollWidth > this.elementRef.nativeElement.offsetWidth;

            if (!isEnabled) {
                this.scrollDistance = 0;
            }

            if (isEnabled !== this.showPaginationControls) {
                this.changeDetectorRef.markForCheck();
            }

            this.showPaginationControls = isEnabled;
        }
    }

    /**
     * Evaluate whether the before and after controls should be enabled or disabled.
     * If the header is at the beginning of the list (scroll distance is equal to 0) then disable the
     * before button. If the header is at the end of the list (scroll distance is equal to the
     * maximum distance we can scroll), then disable the after button.
     *
     * This is an expensive call that forces a layout reflow to compute box and scroll metrics and
     * should be called sparingly.
     */
    checkScrollingControls() {
        if (this.disablePagination) {
            this.disableScrollAfter = this.disableScrollBefore = true;
        } else {
            // Check if the pagination arrows should be activated.
            this.disableScrollBefore = this.scrollDistance === 0;
            this.disableScrollAfter = this.scrollDistance === this.getMaxScrollDistance();
            this.changeDetectorRef.markForCheck();
        }
    }

    /**
     * Determines what is the maximum length in pixels that can be set for the scroll distance. This
     * is equal to the difference in width between the tab list container and tab header container.
     *
     * This is an expensive call that forces a layout reflow to compute box and scroll metrics and
     * should be called sparingly.
     */
    getMaxScrollDistance(): number {
        const lengthOfTabList = this.tabList.nativeElement.scrollWidth;
        const viewLength = this.tabListContainer.nativeElement.offsetWidth;

        return (lengthOfTabList - viewLength) || 0;
    }

    /** Tells the ink-bar to align itself to the current label wrapper */
    alignInkBarToSelectedTab(): void {
        const selectedItem = this.items?.length ? this.items.toArray()[this.selectedIndex] : null;

        const selectedLabelWrapper = selectedItem ? selectedItem.elementRef.nativeElement : null;

        if (selectedLabelWrapper) {
            this.inkBar.alignToElement(selectedLabelWrapper);
        } else {
            this.inkBar.hide();
        }
    }

    /** Stops the currently-running paginator interval.  */
    stopInterval() {
        this.stopScrolling.next();
    }

    /**
     * Handles the user pressing down on one of the paginators.
     * Starts scrolling the header after a certain amount of time.
     * @param direction In which direction the paginator should be scrolled.
     */
    handlePaginatorPress(direction: ScrollDirection, mouseEvent?: MouseEvent) {
        // Don't start auto scrolling for right mouse button clicks. Note that we shouldn't have to
        // null check the `button`, but we do it so we don't break tests that use fake events.
        if (mouseEvent && mouseEvent.button != null && mouseEvent.button !== 0) { return; }

        // Avoid overlapping timers.
        this.stopInterval();

        // Start a timer after the delay and keep firing based on the interval.
        timer(HEADER_SCROLL_DELAY, HEADER_SCROLL_INTERVAL)
            // Keep the timer going until something tells it to stop or the component is destroyed.
            .pipe(takeUntil(merge(this.stopScrolling, this.destroyed)))
            .subscribe(() => {
                const { maxScrollDistance, distance } = this.scrollHeader(direction);

                // Stop the timer if we've reached the start or the end.
                if (distance === 0 || distance >= maxScrollDistance) {
                    this.stopInterval();
                }
            });
    }

    protected abstract itemSelected(event: KeyboardEvent): void;

    /**
     * Scrolls the header to a given position.
     * @param position Position to which to scroll.
     * @returns Information on the current scroll distance and the maximum.
     */
    private scrollTo(position: number) {
        if (this.disablePagination) {
            return { maxScrollDistance: 0, distance: 0 };
        }

        const maxScrollDistance = this.getMaxScrollDistance();
        this.scrollDistance = Math.max(0, Math.min(maxScrollDistance, position));

        // Mark that the scroll distance has changed so that after the view is checked, the CSS
        // transformation can move the header.
        this.scrollDistanceChanged = true;
        this.checkScrollingControls();

        return { maxScrollDistance, distance: this.scrollDistance };
    }
}
