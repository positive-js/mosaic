import { coerceBooleanProperty, coerceNumberProperty } from '@angular/cdk/coercion';
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
    OnDestroy,
    Output,
    QueryList,
    ViewChild,
    ViewEncapsulation,
    InjectionToken,
    Inject,
    Optional,
    Directive, Attribute
} from '@angular/core';
import {
    CanColor,
    CanColorCtor,
    mixinColor,
    mixinDisabled
} from '@ptsecurity/mosaic/core';
import { merge, Subscription } from 'rxjs';

import { McTab } from './tab';
import { McTabHeader } from './tab-header';


@Directive({
    selector: 'mc-tab-group[mc-light-tabs], [mc-tab-nav-bar][mc-light-tabs]',
    host: { class: 'mc-tab-group_light' }
})
export class McLightTabsCssStyler { }

@Directive({
    selector: 'mc-tab-group[mc-align-tabs-center], [mc-tab-nav-bar][mc-align-tabs-center]',
    host: { class: 'mc-tab-group_align-labels-center' }
})
export class McAlignTabsCenterCssStyler { }

@Directive({
    selector: 'mc-tab-group[mc-align-tabs-end], [mc-tab-nav-bar][mc-align-tabs-end]',
    host: { class: 'mc-tab-group_align-labels-end' }
})
export class McAlignTabsEndCssStyler { }

@Directive({
    selector: 'mc-tab-group[mc-stretch-tabs], [mc-tab-nav-bar][mc-stretch-tabs]',
    host: { class: 'mc-tab-group_stretch-labels' }
})
export class McStretchTabsCssStyler { }

/** Used to generate unique ID's for each tab component */
let nextId = 0;

/** A simple change event emitted on focus or selection changes. */
export class McTabChangeEvent {
    /** Index of the currently-selected tab. */
    index: number;
    /** Reference to the currently-selected tab. */
    tab: McTab;
}

/** Possible positions for the tab header. */
export type McTabHeaderPosition = 'above' | 'below';

/** Object that can be used to configure the default options for the tabs module. */
export interface IMcTabsConfig {
    /** Duration for the tab animation. Must be a valid CSS value (e.g. 600ms). */
    animationDuration?: string;
}

/** Injection token that can be used to provide the default options the tabs module. */
export const MC_TABS_CONFIG = new InjectionToken<string>('MC_TABS_CONFIG');

// Boilerplate for applying mixins to McTabGroup.
/** @docs-private */
export class McTabGroupBase {
    // tslint:disable-next-line:naming-convention
    constructor(public _elementRef: ElementRef) { }
}
// tslint:disable-next-line:naming-convention
export const McTabGroupMixinBase:
    CanColorCtor &
    typeof McTabGroupBase =
    mixinColor(mixinDisabled(McTabGroupBase));

/**
 * Tab-group component.  Supports basic tab pairs (label + content) and includes
 * keyboard navigation.
 */
@Component({
    selector: 'mc-tab-group',
    exportAs: 'mcTabGroup',
    templateUrl: 'tab-group.html',
    styleUrls: ['tab-group.css'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    inputs: ['color'],
    host: {
        class: 'mc-tab-group',
        '[class.mc-tab-group_dynamic-height]': 'dynamicHeight',
        '[class.mc-tab-group_inverted-header]': 'headerPosition === "below"'
    }
})
export class McTabGroup extends McTabGroupMixinBase implements AfterContentInit,
    AfterContentChecked, OnDestroy, CanColor {
    lightTab: boolean;

    /** Whether the tab group should grow to the size of the active tab. */
    @Input()
    get dynamicHeight(): boolean { return this._dynamicHeight; }
    set dynamicHeight(value: boolean) { this._dynamicHeight = coerceBooleanProperty(value); }

    /** The index of the active tab. */
    @Input()
    get selectedIndex(): number | null { return this._selectedIndex; }
    set selectedIndex(value: number | null) {
        this.indexToSelect = coerceNumberProperty(value, null);
    }

    @ContentChildren(McTab) tabs: QueryList<McTab>;

    @ViewChild('tabBodyWrapper', {static: false}) tabBodyWrapper: ElementRef;

    @ViewChild('tabHeader', {static: false}) tabHeader: McTabHeader;

    /** Position of the tab header. */
    @Input() headerPosition: McTabHeaderPosition = 'above';

    /** Duration for the tab animation. Must be a valid CSS value (e.g. 600ms). */
    @Input() animationDuration: string;

    /** Output to enable support for two-way binding on `[(selectedIndex)]` */
    @Output() readonly selectedIndexChange: EventEmitter<number> = new EventEmitter<number>();

    /** Event emitted when focus has changed within a tab group. */
    @Output() readonly focusChange: EventEmitter<McTabChangeEvent> =
        new EventEmitter<McTabChangeEvent>();

    /** Event emitted when the body animation has completed */
    @Output() readonly animationDone: EventEmitter<void> = new EventEmitter<void>();

    /** Event emitted when the tab selection has changed. */
    @Output() readonly selectedTabChange: EventEmitter<McTabChangeEvent> =
        new EventEmitter<McTabChangeEvent>(true);

    /** The tab index that should be selected after the content has been checked. */
    private indexToSelect: number | null = 0;

    /** Snapshot of the height of the tab body wrapper before another tab is activated. */
    private tabBodyWrapperHeight: number = 0;

    /** Subscription to tabs being added/removed. */
    private tabsSubscription = Subscription.EMPTY;

    /** Subscription to changes in the tab labels. */
    private tabLabelSubscription = Subscription.EMPTY;
    private _dynamicHeight: boolean = false;
    private _selectedIndex: number | null = null;

    private groupId: number;

    constructor(
        elementRef: ElementRef,
        private changeDetectorRef: ChangeDetectorRef,
        @Attribute('mc-light-tabs') lightTabs: string,
        @Inject(MC_TABS_CONFIG) @Optional() defaultConfig?: IMcTabsConfig
    ) {
        super(elementRef);

        this.lightTab = coerceBooleanProperty(lightTabs);

        this.groupId = nextId++;
        this.animationDuration = defaultConfig && defaultConfig.animationDuration ?
            defaultConfig.animationDuration : '0ms';
    }

    /**
     * After the content is checked, this component knows what tabs have been defined
     * and what the selected index should be. This is where we can know exactly what position
     * each tab should be in according to the new selected index, and additionally we know how
     * a new selected tab should transition in (from the left or right).
     */
    ngAfterContentChecked() {
        // Don't clamp the `indexToSelect` immediately in the setter because it can happen that
        // the amount of tabs changes before the actual change detection runs.
        const indexToSelect = this.indexToSelect = this.clampTabIndex(this.indexToSelect);

        // If there is a change in selected index, emit a change event. Should not trigger if
        // the selected index has not yet been initialized.
        if (this._selectedIndex !== indexToSelect) {
            const isFirstRun = this._selectedIndex == null;

            if (!isFirstRun) {
                this.selectedTabChange.emit(this.createChangeEvent(indexToSelect));
            }

            // Changing these values after change detection has run
            // since the checked content may contain references to them.
            Promise.resolve().then(() => {
                this.tabs.forEach((tab, index) => tab.isActive = index === indexToSelect);

                if (!isFirstRun) {
                    this.selectedIndexChange.emit(indexToSelect);
                }
            });
        }

        // Setup the position for each tab and optionally setup an origin on the next selected tab.
        this.tabs.forEach((tab: McTab, index: number) => {
            tab.position = index - indexToSelect;

            // If there is already a selected tab, then set up an origin for the next selected tab
            // if it doesn't have one already.
            if (this._selectedIndex != null && tab.position === 0 && !tab.origin) {
                tab.origin = indexToSelect - this._selectedIndex;
            }
        });

        if (this._selectedIndex !== indexToSelect) {
            this._selectedIndex = indexToSelect;
            this.changeDetectorRef.markForCheck();
        }
    }

    ngAfterContentInit() {
        this.subscribeToTabLabels();

        // Subscribe to changes in the amount of tabs, in order to be
        // able to re-render the content as new tabs are added or removed.
        this.tabsSubscription = this.tabs.changes.subscribe(() => {
            const indexToSelect = this.clampTabIndex(this.indexToSelect);

            // Maintain the previously-selected tab if a new tab is added or removed and there is no
            // explicit change that selects a different tab.
            if (indexToSelect === this._selectedIndex) {
                const tabs = this.tabs.toArray();

                for (let i = 0; i < tabs.length; i++) {
                    if (tabs[i].isActive) {
                        // Assign both to the `_indexToSelect` and `_selectedIndex` so we don't fire a changed
                        // event, otherwise the consumer may end up in an infinite loop in some edge cases like
                        // adding a tab within the `selectedIndexChange` event.
                        this.indexToSelect = this._selectedIndex = i;
                        break;
                    }
                }
            }

            this.subscribeToTabLabels();
            this.changeDetectorRef.markForCheck();
        });
    }

    ngOnDestroy() {
        this.tabsSubscription.unsubscribe();
        this.tabLabelSubscription.unsubscribe();
    }

    focusChanged(index: number) {
        this.focusChange.emit(this.createChangeEvent(index));
    }

    /** Returns a unique id for each tab label element */
    getTabLabelId(i: number): string {
        return `mc-tab-label-${this.groupId}-${i}`;
    }

    /** Returns a unique id for each tab content element */
    getTabContentId(i: number): string {
        return `mc-tab-content-${this.groupId}-${i}`;
    }

    /**
     * Sets the height of the body wrapper to the height of the activating tab if dynamic
     * height property is true.
     */
    setTabBodyWrapperHeight(tabHeight: number): void {
        if (!this._dynamicHeight || !this.tabBodyWrapperHeight) { return; }

        const wrapper: HTMLElement = this.tabBodyWrapper.nativeElement;

        wrapper.style.height = `${this.tabBodyWrapperHeight}px`;

        // This conditional forces the browser to paint the height so that
        // the animation to the new height can have an origin.
        if (this.tabBodyWrapper.nativeElement.offsetHeight) {
            wrapper.style.height = `${tabHeight}px`;
        }
    }

    /** Removes the height of the tab body wrapper. */
    removeTabBodyWrapperHeight(): void {
        this.tabBodyWrapperHeight = this.tabBodyWrapper.nativeElement.clientHeight;
        this.tabBodyWrapper.nativeElement.style.height = '';
        this.animationDone.emit();
    }

    /** Handle click events, setting new selected index if appropriate. */
    handleClick(tab: McTab, tabHeader: McTabHeader, index: number) {
        if (!tab.disabled) {
            this.selectedIndex = tabHeader.focusIndex = index;
        }
    }

    /** Retrieves the tabindex for the tab. */
    getTabIndex(tab: McTab, index: number): number | null {
        if (tab.disabled) {
            return null;
        }

        return this.selectedIndex === index ? 0 : -1;
    }

    private createChangeEvent(index: number): McTabChangeEvent {
        const event = new McTabChangeEvent();
        event.index = index;
        if (this.tabs && this.tabs.length) {
            event.tab = this.tabs.toArray()[index];
        }

        return event;
    }

    /**
     * Subscribes to changes in the tab labels. This is needed, because the @Input for the label is
     * on the McTab component, whereas the data binding is inside the McTabGroup. In order for the
     * binding to be updated, we need to subscribe to changes in it and trigger change detection
     * manually.
     */
    private subscribeToTabLabels() {
        if (this.tabLabelSubscription) {
            this.tabLabelSubscription.unsubscribe();
        }

        this.tabLabelSubscription = merge(...this.tabs.map((tab) => tab.stateChanges))
            .subscribe(() => this.changeDetectorRef.markForCheck());
    }

    /** Clamps the given index to the bounds of 0 and the tabs length. */
    private clampTabIndex(index: number | null): number {
        // Note the `|| 0`, which ensures that values like NaN can't get through
        // and which would otherwise throw the component into an infinite loop
        // (since Mch.max(NaN, 0) === NaN).
        return Math.min(this.tabs.length - 1, Math.max(index || 0, 0));
    }
}
