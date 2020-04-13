import { Direction, Directionality } from '@angular/cdk/bidi';
import { coerceNumberProperty } from '@angular/cdk/coercion';
import { ViewportRuler } from '@angular/cdk/scrolling';
import {
    AfterContentChecked,
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    ElementRef,
    EventEmitter,
    Input,
    NgZone,
    OnDestroy,
    Optional,
    Output,
    QueryList,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { FocusKeyManager } from '@ptsecurity/cdk/a11y';
import { END, ENTER, HOME, SPACE } from '@ptsecurity/cdk/keycodes';
import { merge, of as observableOf, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { McTabLabelWrapper } from './tab-label-wrapper';


const VIEWPORT_THROTTLE_TIME = 150;
const SCROLL_DISTANCE_DELIMITER = 3;


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

// Boilerplate for applying mixins to McTabHeader.
/** @docs-private */
export class McTabHeaderBase {}

/**
 * The header of the tab group which displays a list of all the tabs in the tab group.
 * When the tabs list's width exceeds the width of the header container,
 * then arrows will be displayed to allow the user to scroll
 * left and right across the header.
 * @docs-private
 */
@Component({
    selector: 'mc-tab-header',
    templateUrl: 'tab-header.html',
    styleUrls: ['tab-header.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'mc-tab-header',
        '[class.mc-tab-header__pagination-controls_enabled]': 'showPaginationControls',
        '[class.mc-tab-header_rtl]': 'getLayoutDirection() == \'rtl\''
    }
})
export class McTabHeader extends McTabHeaderBase
    implements AfterContentChecked, AfterContentInit, OnDestroy {
    /** The index of the active tab. */
    @Input()
    get selectedIndex(): number {
        return this._selectedIndex;
    }
    set selectedIndex(value: number) {
        const coercedValue = coerceNumberProperty(value);
        this.selectedIndexChanged = this._selectedIndex !== coercedValue;
        this._selectedIndex = coercedValue;

        if (this.keyManager) {
            this.keyManager.updateActiveItem(coercedValue);
        }
    }

    /** Tracks which element has focus; used for keyboard navigation */
    get focusIndex(): number {
        return this.keyManager ? this.keyManager.activeItemIndex : 0;
    }

    /** When the focus index is set, we must manually send focus to the correct label */
    set focusIndex(value: number) {
        if (
            !this.isValidIndex(value) ||
            this.focusIndex === value ||
            !this.keyManager
        ) {
            return;
        }

        this.keyManager.setActiveItem(value);
    }

    /** Sets the distance in pixels that the tab header should be transformed in the X-axis. */
    get scrollDistance(): number {
        return this._scrollDistance;
    }
    set scrollDistance(v: number) {
        this._scrollDistance = Math.max(
            0,
            Math.min(this.getMaxScrollDistance(), v)
        );

        // Mark that the scroll distance has changed so that after the view is checked, the CSS
        // transformation can move the header.
        this.scrollDistanceChanged = true;
        this.checkScrollingControls();
    }

    @ContentChildren(McTabLabelWrapper)
    labelWrappers: QueryList<McTabLabelWrapper>;
    @ViewChild('tabListContainer', {static: true})
    tabListContainer: ElementRef;
    @ViewChild('tabList', {static: true})
    tabList: ElementRef;

    /** Whether the controls for pagination should be displayed */
    showPaginationControls = false;

    /** Whether the tab list can be scrolled more towards the end of the tab label list. */
    disableScrollAfter = true;

    /** Whether the tab list can be scrolled more towards the beginning of the tab label list. */
    disableScrollBefore = true;

    /** Event emitted when the option is selected. */
    @Output()
    readonly selectFocusedIndex: EventEmitter<number> = new EventEmitter<number>();

    /** Event emitted when a label is focused. */
    @Output()
    readonly indexFocused: EventEmitter<number> = new EventEmitter<number>();

    /** The distance in pixels that the tab labels should be translated to the left. */
    private _scrollDistance = 0;

    /** Whether the header should scroll to the selected index after the view has been checked. */
    private selectedIndexChanged = false;

    /** Emits when the component is destroyed. */
    private readonly destroyed = new Subject<void>();

    /**
     * The number of tab labels that are displayed on the header. When this changes, the header
     * should re-evaluate the scroll position.
     */
    private tabLabelCount: number;

    /** Whether the scroll distance has changed and should be applied after the view is checked. */
    private scrollDistanceChanged: boolean;

    /** Used to manage focus between the tabs. */
    private keyManager: FocusKeyManager<McTabLabelWrapper>;

    /** Cached text content of the header. */
    private currentTextContent: string;

    private _selectedIndex: number = 0;

    constructor(
        private elementRef: ElementRef,
        private changeDetectorRef: ChangeDetectorRef,
        private viewportRuler: ViewportRuler,
        @Optional() private dir: Directionality,
        private ngZone: NgZone
    ) {
        super();
    }

    ngAfterContentChecked(): void {
        // If the number of tab labels have changed, check if scrolling should be enabled
        if (this.tabLabelCount !== this.labelWrappers.length) {
            this.updatePagination();
            this.tabLabelCount = this.labelWrappers.length;
            this.changeDetectorRef.markForCheck();
        }

        // If the selected index has changed, scroll to the label and check if the scrolling controls
        // should be disabled.
        if (this.selectedIndexChanged) {
            this.scrollToLabel(this._selectedIndex);
            this.checkScrollingControls();
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

    handleKeydown(event: KeyboardEvent) {
        // tslint:disable-next-line: deprecation
        switch (event.keyCode) {
            case HOME:
                this.keyManager.setFirstItemActive();
                event.preventDefault();
                break;
            case END:
                this.keyManager.setLastItemActive();
                event.preventDefault();
                break;
            case ENTER:
            case SPACE:
                this.selectFocusedIndex.emit(this.focusIndex);
                event.preventDefault();
                break;
            default:
                this.keyManager.onKeydown(event);
        }
    }

    ngAfterContentInit() {
        const dirChange = this.dir ? this.dir.change : observableOf(null);
        const resize = this.viewportRuler.change(VIEWPORT_THROTTLE_TIME);
        const realign = () => {
            this.updatePagination();
        };

        this.keyManager = new FocusKeyManager(this.labelWrappers)
            .withHorizontalOrientation(this.getLayoutDirection())
            .withWrap();

        this.keyManager.updateActiveItem(0);

        // Defer the first call in order to allow for slower browsers to lay out the elements.
        // This helps in cases where the user lands directly on a page with paginated tabs.
        typeof requestAnimationFrame === undefined
            ? realign()
            : requestAnimationFrame(realign);

        // On dir change or window resize, update the orientation of
        // the key manager if the direction has changed.
        merge(dirChange, resize)
            .pipe(takeUntil(this.destroyed))
            .subscribe(() => {
                realign();
                this.keyManager.withHorizontalOrientation(
                    this.getLayoutDirection()
                );
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

    ngOnDestroy() {
        this.destroyed.next();
        this.destroyed.complete();
    }

    /**
     * Callback for when the MutationObserver detects that the content has changed.
     */
    onContentChanges() {
        const textContent = this.elementRef.nativeElement.textContent;

        // We need to diff the text content of the header, because the MutationObserver callback
        // will fire even if the text content didn't change which is inefficient and is prone
        // to infinite loops if a poorly constructed expression is passed in.

        if (textContent !== this.currentTextContent) {
            this.currentTextContent = textContent;

            const zoneCallback = () => {
                this.updatePagination();
                this.changeDetectorRef.markForCheck();
            };

            // The content observer runs outside the `NgZone` by default, which
            // means that we need to bring the callback back in ourselves.
            // TODO: Remove null check for `_ngZone` once it's a required parameter.
            this.ngZone ? this.ngZone.run(zoneCallback) : zoneCallback();
        }
    }

    /**
     * Updating the view whether pagination should be enabled or not
     *
     * WARNING: Calling this method can be very costly in terms of performance.  It should be called
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
        if (!this.labelWrappers) {
            return true;
        }

        const tab = this.labelWrappers
            ? this.labelWrappers.toArray()[index]
            : null;

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

        if (this.labelWrappers && this.labelWrappers.length) {
            this.labelWrappers.toArray()[tabIndex].focus();

            // Do not let the browser manage scrolling to focus the element, this will be handled
            // by using translation. In LTR, the scroll left should be 0. In RTL, the scroll width
            // should be the full width minus the offset width.
            const containerEl = this.tabListContainer.nativeElement;
            const dir = this.getLayoutDirection();

            if (dir === 'ltr') {
                containerEl.scrollLeft = 0;
            } else {
                containerEl.scrollLeft =
                    containerEl.scrollWidth - containerEl.offsetWidth;
            }
        }
    }

    /** The layout direction of the containing app. */
    getLayoutDirection(): Direction {
        return this.dir && this.dir.value === 'rtl' ? 'rtl' : 'ltr';
    }

    /** Performs the CSS transformation on the tab list that will cause the list to scroll. */
    updateTabScrollPosition() {
        const scrollDistance = this.scrollDistance;
        const translateX =
            this.getLayoutDirection() === 'ltr'
                ? -scrollDistance
                : scrollDistance;

        // Don't use `translate3d` here because we don't want to create a new layer. A new layer
        // seems to cause flickering and overflow in Internet Explorer.
        // See: https://github.com/angular/material2/issues/10276
        // We round the `transform` here, because transforms with sub-pixel precision cause some
        // browsers to blur the content of the element.
        this.tabList.nativeElement.style.transform = `translateX(${Math.round(translateX)}px)`;

        // Setting the `transform` on IE will change the scroll offset of the parent, causing the
        // position to be thrown off in some cases. We have to reset it ourselves to ensure that
        // it doesn't get thrown off.
        this.tabList.nativeElement.scrollLeft = 0;
    }

    /**
     * Moves the tab list in the 'before' or 'after' direction (towards the beginning of the list or
     * the end of the list, respectively). The distance to scroll is computed to be a third of the
     * length of the tab list view window.
     *
     * This is an expensive call that forces a layout reflow to compute box and scroll metrics and
     * should be called sparingly.
     */
    scrollHeader(scrollDir: ScrollDirection) {
        const viewLength = this.tabListContainer.nativeElement.offsetWidth;

        // Move the scroll distance one-third the length of the tab list's viewport.
        this.scrollDistance +=
            ((scrollDir === 'before' ? -1 : 1) * viewLength) / SCROLL_DISTANCE_DELIMITER;
    }

    /**
     * Moves the tab list such that the desired tab label (marked by index) is moved into view.
     *
     * This is an expensive call that forces a layout reflow to compute box and scroll metrics and
     * should be called sparingly.
     */
    scrollToLabel(labelIndex: number) {
        const selectedLabel = this.labelWrappers
            ? this.labelWrappers.toArray()[labelIndex]
            : null;

        if (!selectedLabel) {
            return;
        }

        // The view length is the visible width of the tab labels.
        const viewLength: number = this.tabListContainer.nativeElement.offsetWidth;

        let labelBeforePos: number;
        let labelAfterPos: number;

        if (this.getLayoutDirection() === 'ltr') {
            labelBeforePos = selectedLabel.getOffsetLeft();
            labelAfterPos = labelBeforePos + selectedLabel.getOffsetWidth();
        } else {
            labelAfterPos =
                this.tabList.nativeElement.offsetWidth -
                selectedLabel.getOffsetLeft();
            labelBeforePos = labelAfterPos - selectedLabel.getOffsetWidth();
        }

        const beforeVisiblePos = this.scrollDistance;
        const afterVisiblePos = this.scrollDistance + viewLength;

        if (labelBeforePos < beforeVisiblePos) {
            // Scroll header to move label to the before direction
            this.scrollDistance -=
                beforeVisiblePos - labelBeforePos + EXAGGERATED_OVERSCROLL;
        } else if (labelAfterPos > afterVisiblePos) {
            // Scroll header to move label to the after direction
            this.scrollDistance +=
                labelAfterPos - afterVisiblePos + EXAGGERATED_OVERSCROLL;
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
        const isEnabled =
            this.tabList.nativeElement.scrollWidth >
            this.elementRef.nativeElement.offsetWidth;

        if (!isEnabled) {
            this.scrollDistance = 0;
        }

        if (isEnabled !== this.showPaginationControls) {
            this.changeDetectorRef.markForCheck();
        }

        this.showPaginationControls = isEnabled;
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
        // Check if the pagination arrows should be activated.
        this.disableScrollBefore = this.scrollDistance === 0;
        this.disableScrollAfter =
            this.scrollDistance === this.getMaxScrollDistance();
        this.changeDetectorRef.markForCheck();
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

        return lengthOfTabList - viewLength || 0;
    }
}
