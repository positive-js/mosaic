/* tslint:disable:no-empty */

import { ActiveDescendantKeyManager } from '@ptsecurity/cdk/a11y';
import { Directionality } from '@ptsecurity/cdk/bidi';
import { coerceBooleanProperty } from '@ptsecurity/cdk/coercion';
import { SelectionModel } from '@ptsecurity/cdk/collections';
import {
    DOWN_ARROW,
    END,
    ENTER,
    HOME,
    LEFT_ARROW,
    RIGHT_ARROW,
    SPACE,
    UP_ARROW,
    A
} from '@ptsecurity/cdk/keycodes';
import {
    CdkConnectedOverlay,
    Overlay,
    RepositionScrollStrategy,
    IScrollStrategy,
    ViewportRuler
} from '@ptsecurity/cdk/overlay';

import {
    AfterContentInit, AfterViewInit,
    Attribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ContentChildren,
    Directive,
    DoCheck,
    ElementRef,
    EventEmitter,
    Inject,
    InjectionToken,
    Input,
    isDevMode, IterableDiffers,
    NgZone,
    OnChanges,
    OnDestroy,
    OnInit,
    Optional,
    Output,
    QueryList, Renderer2,
    Self,
    SimpleChanges,
    ViewChild, ViewChildren,
    ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import { CdkTree } from '@ptsecurity/cdk/tree';
import {
    _countGroupLabelsBeforeOption,
    _getOptionScrollPosition,
    CanDisable,
    CanDisableCtor,
    CanUpdateErrorState,
    CanUpdateErrorStateCtor,
    ErrorStateMatcher,
    HasTabIndex, HasTabIndexCtor,
    MC_OPTION_PARENT_COMPONENT,
    McOptgroup,
    McOption,
    McOptionSelectionChange,
    mixinDisabled,
    mixinErrorState,
    mixinTabIndex
} from '@ptsecurity/mosaic/core';

import { McFormField, McFormFieldControl } from '@ptsecurity/mosaic/form-field';
import { McTag } from '@ptsecurity/mosaic/tag';


import { defer, merge, Observable, Subject } from 'rxjs';
import {
    filter,
    map,
    startWith,
    switchMap,
    take,
    takeUntil,
    distinctUntilChanged
} from 'rxjs/operators';

import {
    getMcSelectDynamicMultipleError,
    getMcSelectNonArrayValueError,
    getMcSelectNonFunctionValueError
} from './select-errors';

import { mcSelectAnimations } from './select-animations';


let nextUniqueId = 0;

/**
 * The following style constants are necessary to save here in order
 * to properly calculate the alignment of the selected option over
 * the trigger element.
 */

/** The max height of the select's overlay panel */
export const TREE_SELECT_PANEL_MAX_HEIGHT = 224;

/** The panel's padding on the x-axis */
export const TREE_SELECT_PANEL_PADDING_X = 1;

/** The panel's x axis padding if it is indented (e.g. there is an option group). */
/* tslint:disable-next-line:no-magic-numbers */
export const TREE_SELECT_PANEL_INDENT_PADDING_X = TREE_SELECT_PANEL_PADDING_X * 2;

/** The height of the select items in `em` units. */
export const TREE_SELECT_ITEM_HEIGHT_EM = 2;

/**
 * The select panel will only "fit" inside the viewport if it is positioned at
 * this value or more away from the viewport boundary.
 */
export const TREE_SELECT_PANEL_VIEWPORT_PADDING = 8;

/** Injection token that determines the scroll handling while a select is open. */
export const MC_TREE_SELECT_SCROLL_STRATEGY =
    new InjectionToken<() => IScrollStrategy>('mc-select-scroll-strategy');

/** @docs-private */
function mcSelectScrollStrategyProviderFactory(overlay: Overlay):
    () => RepositionScrollStrategy {
    return () => overlay.scrollStrategies.reposition();
}

/** @docs-private */
export const MC_TREE_SELECT_SCROLL_STRATEGY_PROVIDER = {
    provide: MC_TREE_SELECT_SCROLL_STRATEGY,
    deps: [Overlay],
    useFactory: mcSelectScrollStrategyProviderFactory
};

/** Change event object that is emitted when the select value has changed. */
export class McTreeSelectChange {
    constructor(
        /** Reference to the select that emitted the change event. */
        public source: McTreeSelect,
        /** Current value of the select that emitted the event. */
        public value: any) {
    }
}

// Boilerplate for applying mixins to McTreeSelect.
/** @docs-private */
export class McTreeSelectBase<T> extends CdkTree<T> {
    constructor(
        public _elementRef: ElementRef,
        public _defaultErrorStateMatcher: ErrorStateMatcher,
        public _parentForm: NgForm,
        public _parentFormGroup: FormGroupDirective,
        public ngControl: NgControl,
        public _differs: IterableDiffers,
        public _changeDetectorRef: ChangeDetectorRef
    ) {
        super(_differs, _changeDetectorRef);
    }
}

export const _McTreeSelectMixinBase:
    CanDisableCtor &
    HasTabIndexCtor &
    CanUpdateErrorStateCtor & typeof McTreeSelectBase
    = mixinTabIndex(mixinDisabled(mixinErrorState(McTreeSelectBase)));

/**
 * Allows the user to customize the trigger that is displayed when the select has a value.
 */
@Directive({ selector: 'mc-select-trigger' })
export class McTreeSelectTrigger {}


@Component({
    selector: 'mc-tree-select',
    exportAs: 'mcTreeSelect',
    templateUrl: 'tree-select.html',
    styleUrls: ['./tree-select.css'],
    inputs: ['disabled', 'tabIndex'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '[attr.id]': 'id',
        '[attr.tabindex]': 'tabIndex',
        class: 'mc-select',
        '[class.mc-disabled]': 'disabled',
        '[class.mc-select-invalid]': 'errorState',
        '[class.mc-select-required]': 'required',
        '(keydown)': '_handleKeydown($event)',
        '(focus)': '_onFocus()',
        '(blur)': '_onBlur()',
        '(window:resize)': '_calculateHiddenItems()'
    },
    animations: [
        mcSelectAnimations.transformPanel,
        mcSelectAnimations.fadeInContent
    ],
    providers: [
        { provide: McFormFieldControl, useExisting: McTreeSelect },
        { provide: MC_OPTION_PARENT_COMPONENT, useExisting: McTreeSelect }
    ]
})
export class McTreeSelect extends _McTreeSelectMixinBase implements
    AfterContentInit, AfterViewInit, OnChanges, OnDestroy, OnInit, DoCheck, ControlValueAccessor, CanDisable,
    HasTabIndex, McFormFieldControl<any>, CanUpdateErrorState {

    /** A name for this control that can be used by `mc-form-field`. */
    controlType = 'mc-select';

    hiddenItems: number = 0;
    oneMoreText: string = '...ещё';

    /** The last measured value for the trigger's client bounding rect. */
    _triggerRect: ClientRect;

    /** The cached font-size of the trigger element. */
    _triggerFontSize = 0;

    /** Deals with the selection logic. */
    _selectionModel: SelectionModel<McOption>;

    /** Manages keyboard events for options in the panel. */
    _keyManager: ActiveDescendantKeyManager<McOption>;

    /** The IDs of child options to be passed to the aria-owns attribute. */
    _optionIds: string = '';

    /** The value of the select panel's transform-origin property. */
    _transformOrigin: string = 'top';

    /** Whether the panel's animation is done. */
    _panelDoneAnimating: boolean = false;

    /** Emits when the panel element is finished transforming in. */
    _panelDoneAnimatingStream = new Subject<string>();

    /** Strategy that will be used to handle scrolling while the select panel is open. */
    _scrollStrategy = this._scrollStrategyFactory();

    /**
     * The y-offset of the overlay panel in relation to the trigger's top start corner.
     * This must be adjusted to align the selected option text over the trigger text.
     * when the panel opens. Will change based on the y-position of the selected option.
     */
    _offsetY = 0;

    /**
     * This position config ensures that the top "start" corner of the overlay
     * is aligned with with the top "start" of the origin by default (overlapping
     * the trigger completely). If the panel cannot fit below the trigger, it
     * will fall back to a position above the trigger.
     */
    _positions = [
        {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top'
        },
        {
            originX: 'start',
            originY: 'top',
            overlayX: 'start',
            overlayY: 'bottom'
        }
    ];

    @ViewChild('trigger') trigger: ElementRef;

    @ViewChild('panel') panel: ElementRef;

    @ViewChild(CdkConnectedOverlay) overlayDir: CdkConnectedOverlay;

    @ViewChildren(McTag) tags: QueryList<McTag>;

    /** User-supplied override of the trigger element. */
    @ContentChild(McTreeSelectTrigger) customTrigger: McTreeSelectTrigger;

    /** All of the defined select options. */
    @ContentChildren(McOption, { descendants: true }) options: QueryList<McOption>;

    /** All of the defined groups of options. */
    @ContentChildren(McOptgroup) optionGroups: QueryList<McOptgroup>;

    /** Classes to be passed to the select panel. Supports the same syntax as `ngClass`. */
    @Input() panelClass: string | string[] | Set<string> | { [key: string]: any };

    /** Placeholder to be shown if no value has been selected. */
    @Input()
    get placeholder(): string {
        return this._placeholder;
    }

    set placeholder(value: string) {
        this._placeholder = value;
        this.stateChanges.next();
    }

    /** Whether the component is required. */
    @Input()
    get required(): boolean {
        return this._required;
    }

    set required(value: boolean) {
        this._required = coerceBooleanProperty(value);
        this.stateChanges.next();
    }

    /** Whether the user should be allowed to select multiple options. */
    @Input()
    get multiple(): boolean {
        return this._multiple;
    }

    set multiple(value: boolean) {
        if (this._selectionModel) {
            throw getMcSelectDynamicMultipleError();
        }

        this._multiple = coerceBooleanProperty(value);
    }

    /**
     * Function to compare the option values with the selected values. The first argument
     * is a value from an option. The second is a value from the selection. A boolean
     * should be returned.
     */
    @Input()
    get compareWith() {
        return this._compareWith;
    }

    set compareWith(fn: (o1: any, o2: any) => boolean) {
        /* tslint:disable-next-line:strict-type-predicates */
        if (typeof fn !== 'function') {
            throw getMcSelectNonFunctionValueError();
        }

        this._compareWith = fn;

        if (this._selectionModel) {
            // A different comparator means the selection could change.
            this._initializeSelection();
        }
    }

    /** Value of the select control. */
    @Input()
    get value(): any {
        return this._value;
    }

    set value(newValue: any) {
        if (newValue !== this._value) {
            this.writeValue(newValue);
            this._value = newValue;
        }
    }

    /** Object used to control when error messages are shown. */
    @Input() errorStateMatcher: ErrorStateMatcher;

    /**
     * Function used to sort the values in a select in multiple mode.
     * Follows the same logic as `Array.prototype.sort`.
     */
    @Input() sortComparator: (a: McOption, b: McOption, options: McOption[]) => number;

    @Input()
    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value || this._uid;
        this.stateChanges.next();
    }

    /** Combined stream of all of the child options' change events. */
    readonly optionSelectionChanges: Observable<McOptionSelectionChange> = defer(() => {
        if (this.options) {
            return merge(...this.options.map((option) => option.onSelectionChange));
        }

        return this._ngZone.onStable
            .asObservable()
            .pipe(take(1), switchMap(() => this.optionSelectionChanges));
    });

    /** Event emitted when the select panel has been toggled. */
    @Output() readonly openedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    /** Event emitted when the select has been opened. */
    @Output('opened') readonly _openedStream: Observable<void> =
        this.openedChange.pipe(filter((o) => o), map(() => {}));

    /** Event emitted when the select has been closed. */
    @Output('closed') readonly _closedStream: Observable<void> =
        this.openedChange.pipe(filter((o) => !o), map(() => {}));

    /** Event emitted when the selected value has been changed by the user. */
    @Output() readonly selectionChange: EventEmitter<McTreeSelectChange> = new EventEmitter<McTreeSelectChange>();

    /**
     * Event that emits whenever the raw value of the select changes. This is here primarily
     * to facilitate the two-way binding for the `value` input.
     * @docs-private
     */
    @Output() readonly valueChange: EventEmitter<any> = new EventEmitter<any>();

    /** Whether the select is focused. */
    get focused(): boolean {
        return this._focused || this._panelOpen;
    }

    /**
     * @deprecated Setter to be removed as this property is intended to be readonly.
     * @breaking-change 8.0.0
     */
    set focused(value: boolean) {
        this._focused = value;
    }

    /** Whether or not the overlay panel is open. */
    private _panelOpen = false;

    /** Whether filling out the select is required in the form. */
    private _required: boolean = false;

    /** The scroll position of the overlay panel, calculated to center the selected option. */
    private _scrollTop = 0;

    /** The placeholder displayed in the trigger of the select. */
    private _placeholder: string;

    /** Whether the component is in multiple selection mode. */
    private _multiple: boolean = false;

    /** Unique id for this input. */
    private readonly _uid = `mc-select-${nextUniqueId++}`;

    /** Emits whenever the component is destroyed. */
    private readonly _destroy = new Subject<void>();

    private _focused = false;

    private _value: any;

    private _id: string;

    constructor(
        private readonly _viewportRuler: ViewportRuler,
        private readonly _changeDetectorRef: ChangeDetectorRef,
        private readonly _ngZone: NgZone,
        private readonly _renderer: Renderer2,
        _defaultErrorStateMatcher: ErrorStateMatcher,
        elementRef: ElementRef,
        @Optional() private readonly _dir: Directionality,
        @Optional() _parentForm: NgForm,
        @Optional() _parentFormGroup: FormGroupDirective,
        @Optional() private readonly _parentFormField: McFormField,
        @Self() @Optional() public ngControl: NgControl,
        @Attribute('tabindex') tabIndex: string,
        @Inject(MC_TREE_SELECT_SCROLL_STRATEGY) private readonly _scrollStrategyFactory
    ) {
        super(elementRef, _defaultErrorStateMatcher, _parentForm, _parentFormGroup, ngControl);

        if (this.ngControl) {
            // Note: we provide the value accessor through here, instead of
            // the `providers` to avoid running into a circular import.
            this.ngControl.valueAccessor = this;
        }

        this.tabIndex = parseInt(tabIndex) || 0;

        // Force setter to be called in case id was not specified.
        this.id = this.id;
    }

    ngOnInit() {
        this._selectionModel = new SelectionModel<McOption>(this.multiple);
        this.stateChanges.next();

        // We need `distinctUntilChanged` here, because some browsers will
        // fire the animation end event twice for the same animation. See:
        // https://github.com/angular/angular/issues/24084
        this._panelDoneAnimatingStream
            .pipe(distinctUntilChanged(), takeUntil(this._destroy))
            .subscribe(() => {
                if (this.panelOpen) {
                    this._scrollTop = 0;
                    this.openedChange.emit(true);
                } else {
                    this.openedChange.emit(false);
                    this._panelDoneAnimating = false;
                    this.overlayDir.offsetX = 0;
                    this._changeDetectorRef.markForCheck();
                }
            });
    }

    ngAfterContentInit() {
        this._initKeyManager();

        this._selectionModel.onChange!
            .pipe(takeUntil(this._destroy))
            .subscribe((event) => {
                event.added.forEach((option) => option.select());
                event.removed.forEach((option) => option.deselect());
            });

        this.options.changes
            .pipe(startWith(null), takeUntil(this._destroy))
            .subscribe(() => {
                this._resetOptions();
                this._initializeSelection();
            });
    }

    ngAfterViewInit(): void {
        this.tags.changes
            .subscribe(() => {
                setTimeout(() => this._calculateHiddenItems(), 0);
            });
    }

    ngDoCheck() {
        if (this.ngControl) { this.updateErrorState(); }
    }

    ngOnChanges(changes: SimpleChanges) {
        // Updating the disabled state is handled by `mixinDisabled`, but we need to additionally let
        // the parent form field know to run change detection when the disabled state changes.
        if (changes.disabled) {
            this.stateChanges.next();
        }
    }

    ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
        this.stateChanges.complete();
    }

    /** `View -> model callback called when value changes` */
    _onChange: (value: any) => void = () => {};

    /** `View -> model callback called when select has been touched` */
    _onTouched = () => {};

    /** Toggles the overlay panel open or closed. */
    toggle(): void {
        if (this.panelOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    /** Opens the overlay panel. */
    open(): void {
        if (this.disabled || !this.options || !this.options.length || this._panelOpen) { return; }

        this._triggerRect = this.trigger.nativeElement.getBoundingClientRect();
        // Note: The computed font-size will be a string pixel value (e.g. "16px").
        // `parseInt` ignores the trailing 'px' and converts this to a number.
        this._triggerFontSize = parseInt(getComputedStyle(this.trigger.nativeElement)['font-size']);

        this._panelOpen = true;
        this._keyManager.withHorizontalOrientation(null);
        this._calculateOverlayPosition();
        this._highlightCorrectOption();
        this._changeDetectorRef.markForCheck();

        // Set the font size on the panel element once it exists.
        this._ngZone.onStable.asObservable()
            .pipe(take(1))
            .subscribe(() => {
                if (this._triggerFontSize && this.overlayDir.overlayRef &&
                    this.overlayDir.overlayRef.overlayElement) {
                    this.overlayDir.overlayRef.overlayElement.style.fontSize = `${this._triggerFontSize}px`;
                }
            });
    }

    /** Closes the overlay panel and focuses the host element. */
    close(): void {
        if (this._panelOpen) {
            this._panelOpen = false;
            this._keyManager.withHorizontalOrientation(this._isRtl() ? 'rtl' : 'ltr');
            this._changeDetectorRef.markForCheck();
            this._onTouched();
        }
    }

    /**
     * Sets the select's value. Part of the ControlValueAccessor interface
     * required to integrate with Angular's core forms API.
     *
     * @param value New value to be written to the model.
     */
    writeValue(value: any): void {
        if (this.options) {
            this._setSelectionByValue(value);
        }
    }

    /**
     * Saves a callback function to be invoked when the select's value
     * changes from user input. Part of the ControlValueAccessor interface
     * required to integrate with Angular's core forms API.
     *
     * @param fn Callback to be triggered when the value changes.
     */
    registerOnChange(fn: (value: any) => void): void {
        this._onChange = fn;
    }

    /**
     * Saves a callback function to be invoked when the select is blurred
     * by the user. Part of the ControlValueAccessor interface required
     * to integrate with Angular's core forms API.
     *
     * @param fn Callback to be triggered when the component has been touched.
     */
    registerOnTouched(fn: () => {}): void {
        this._onTouched = fn;
    }

    /**
     * Disables the select. Part of the ControlValueAccessor interface required
     * to integrate with Angular's core forms API.
     *
     * @param isDisabled Sets whether the component is disabled.
     */
    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
        this._changeDetectorRef.markForCheck();
        this.stateChanges.next();
    }

    get panelOpen(): boolean {
        return this._panelOpen;
    }

    get selected(): McOption | McOption[] {
        return this.multiple ? this._selectionModel.selected : this._selectionModel.selected[0];
    }

    get triggerValue(): string {
        if (this.empty) { return ''; }

        if (this._multiple) {
            const selectedOptions = this._selectionModel.selected.map((option) => option.viewValue);

            if (this._isRtl()) { selectedOptions.reverse(); }

            return selectedOptions.join(', ');
        }

        return this._selectionModel.selected[0].viewValue;
    }

    get triggerValues(): McOption[] {
        if (this.empty) { return []; }

        if (this._multiple) {
            const selectedOptions = this._selectionModel.selected;

            if (this._isRtl()) { selectedOptions.reverse(); }

            return selectedOptions;
        }

        return [this._selectionModel.selected[0]];
    }

    get empty(): boolean {
        return !this._selectionModel || this._selectionModel.isEmpty();
    }

    _isRtl(): boolean {
        return this._dir ? this._dir.value === 'rtl' : false;
    }

    _handleKeydown(event: KeyboardEvent): void {
        if (!this.disabled) {
            if (this.panelOpen) {
                this._handleOpenKeydown(event);
            } else {
                this._handleClosedKeydown(event);
            }
        }
    }

    /**
     * When the panel content is done fading in, the _panelDoneAnimating property is
     * set so the proper class can be added to the panel.
     */
    _onFadeInDone(): void {
        this._panelDoneAnimating = this.panelOpen;
        this._changeDetectorRef.markForCheck();
    }

    _onFocus() {
        if (!this.disabled) {
            this._focused = true;
            this.stateChanges.next();
        }
    }

    /**
     * Calls the touched callback only if the panel is closed. Otherwise, the trigger will
     * "blur" to the panel when it opens, causing a false positive.
     */
    _onBlur() {
        this._focused = false;

        if (!this.disabled && !this.panelOpen) {
            this._onTouched();
            this._changeDetectorRef.markForCheck();
            this.stateChanges.next();
        }
    }

    /**
     * Callback that is invoked when the overlay panel has been attached.
     */
    _onAttached(): void {
        this.overlayDir.positionChange
            .pipe(take(1))
            .subscribe(() => {
                this._changeDetectorRef.detectChanges();
                this._calculateOverlayOffsetX();
                this.panel.nativeElement.scrollTop = this._scrollTop;
            });
    }

    /** Returns the theme to be used on the panel. */
    _getPanelTheme(): string {
        return this._parentFormField ? `mc-${this._parentFormField.color}` : '';
    }

    /** Focuses the select element. */
    focus(): void {
        this._elementRef.nativeElement.focus();
    }

    /**
     * Calculates the scroll position of the select's overlay panel.
     *
     * Attempts to center the selected option in the panel. If the option is
     * too high or too low in the panel to be scrolled to the center, it clamps the
     * scroll position to the min or max scroll positions respectively.
     */
    _calculateOverlayScroll(selectedIndex: number, scrollBuffer: number, maxScroll: number): number {
        const itemHeight = this._getItemHeight();
        const optionOffsetFromScrollTop = itemHeight * selectedIndex;

        /* tslint:disable-next-line:no-magic-numbers */
        const halfOptionHeight = itemHeight / 2;

        // Starts at the optionOffsetFromScrollTop, which scrolls the option to the top of the
        // scroll container, then subtracts the scroll buffer to scroll the option down to
        // the center of the overlay panel. Half the option height must be re-added to the
        // scrollTop so the option is centered based on its middle, not its top edge.
        const optimalScrollPosition = optionOffsetFromScrollTop - scrollBuffer + halfOptionHeight;

        return Math.min(Math.max(0, optimalScrollPosition), maxScroll);
    }

    /**
     * Implemented as part of McFormFieldControl.
     * @docs-private
     */
    onContainerClick() {
        this.focus();
        this.open();
    }

    /** Invoked when an option is clicked. */
    onRemoveMatcherItem(option: McOption, $event): void {
        $event.stopPropagation();

        option.deselect();
    }

    /**
     * Implemented as part of McFormFieldControl.
     * @docs-private
     */
    get shouldLabelFloat(): boolean {
        return this._panelOpen || !this.empty;
    }

    _calculateHiddenItems(): void {
        if (this.empty || !this.multiple) { return; }

        let visibleItems: number = 0;
        const totalItemsWidth = this._getTotalItemsWidthInMatcher();
        let totalVisibleItemsWidth: number = 0;
        const itemMargin: number = 4;

        this.tags.forEach((tag) => {
            if (tag.nativeElement.offsetTop < tag.nativeElement.offsetHeight) {
                totalVisibleItemsWidth += tag.nativeElement.getBoundingClientRect().width + itemMargin;
                visibleItems++;
            }
        });

        this.hiddenItems = (this.selected as ArrayLike<McOption>).length - visibleItems;

        if (this.hiddenItems) {
            const itemsCounter = this.trigger.nativeElement.querySelector('.mc-select__match-hidden-text');
            const matcherList = this.trigger.nativeElement.querySelector('.mc-select__match-list');

            const itemsCounterShowed = itemsCounter.offsetTop < itemsCounter.offsetHeight;
            // const itemsCounterWidth: number = itemsCounter.getBoundingClientRect().width;
            const itemsCounterWidth: number = 86;

            const matcherListWidth: number = matcherList.getBoundingClientRect().width;
            const matcherWidth: number = matcherListWidth + itemsCounterWidth;

            if (itemsCounterShowed && (totalItemsWidth < matcherWidth)) { this.hiddenItems = 0; }

            if (
                totalVisibleItemsWidth === matcherListWidth ||
                (totalVisibleItemsWidth + itemsCounterWidth) < matcherListWidth
            ) {
                this._changeDetectorRef.markForCheck();

                return ;
            } else if (!itemsCounterShowed && (totalItemsWidth + itemsCounterWidth) > matcherWidth) {
                this.hiddenItems++;
            }
        }

        this._changeDetectorRef.markForCheck();
    }

    private _getTotalItemsWidthInMatcher(): number {
        const triggerClone = this.trigger.nativeElement.cloneNode(true);
        triggerClone.querySelector('.mc-select__match-hidden-text').remove();

        this._renderer.setStyle(triggerClone, 'position', 'absolute');
        this._renderer.setStyle(triggerClone, 'visibility', 'hidden');
        this._renderer.setStyle(triggerClone, 'top', '-100%');
        this._renderer.setStyle(triggerClone, 'left', '0');

        this._renderer.appendChild(this.trigger.nativeElement, triggerClone);

        let totalItemsWidth: number = 0;
        const itemMargin: number = 4;
        triggerClone.querySelectorAll('mc-tag').forEach((item) => {
            totalItemsWidth += item.getBoundingClientRect().width as number + itemMargin;
        });

        triggerClone.remove();

        return totalItemsWidth;
    }

    /** Handles keyboard events while the select is closed. */
    private _handleClosedKeydown(event: KeyboardEvent): void {
        /* tslint:disable-next-line */
        const keyCode = event.keyCode;
        const isArrowKey = keyCode === DOWN_ARROW || keyCode === UP_ARROW ||
            keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW;
        const isOpenKey = keyCode === ENTER || keyCode === SPACE;

        // Open the select on ALT + arrow key to match the native <select>
        if (isOpenKey || ((this.multiple || event.altKey) && isArrowKey)) {
            event.preventDefault(); // prevents the page from scrolling down when pressing space
            this.open();
        } else if (!this.multiple) {
            this._keyManager.onKeydown(event);
        }
    }

    /** Handles keyboard events when the selected is open. */
    private _handleOpenKeydown(event: KeyboardEvent): void {
        /* tslint:disable-next-line */
        const keyCode = event.keyCode;
        const isArrowKey = keyCode === DOWN_ARROW || keyCode === UP_ARROW;
        const manager = this._keyManager;

        if (keyCode === HOME || keyCode === END) {
            event.preventDefault();

            if (keyCode === HOME) {
                manager.setFirstItemActive();
            } else {
                manager.setLastItemActive();
            }

        } else if (isArrowKey && event.altKey) {
            // Close the select on ALT + arrow key to match the native <select>
            event.preventDefault();
            this.close();
        } else if ((keyCode === ENTER || keyCode === SPACE) && manager.activeItem) {
            event.preventDefault();
            manager.activeItem._selectViaInteraction();
        } else if (this._multiple && keyCode === A && event.ctrlKey) {
            event.preventDefault();
            const hasDeselectedOptions = this.options.some((option) => !option.selected);
            this.options.forEach((option) => {
                if (hasDeselectedOptions && !option.disabled) {
                    option.select();
                } else {
                    option.deselect();
                }
            });
        } else {
            const previouslyFocusedIndex = manager.activeItemIndex;

            manager.onKeydown(event);

            if (this._multiple && isArrowKey && event.shiftKey && manager.activeItem &&
                manager.activeItemIndex !== previouslyFocusedIndex) {
                manager.activeItem._selectViaInteraction();
            }
        }
    }

    private _initializeSelection(): void {
        // Defer setting the value in order to avoid the "Expression
        // has changed after it was checked" errors from Angular.
        Promise.resolve().then(() => {
            this._setSelectionByValue(this.ngControl ? this.ngControl.value : this._value);
        });
    }

    /**
     * Sets the selected option based on a value. If no option can be
     * found with the designated value, the select trigger is cleared.
     */
    private _setSelectionByValue(value: any | any[]): void {
        if (this.multiple && value) {
            if (!Array.isArray(value)) {
                throw getMcSelectNonArrayValueError();
            }

            this._selectionModel.clear();
            value.forEach((currentValue: any) => this._selectValue(currentValue));
            this._sortValues();
        } else {
            this._selectionModel.clear();
            const correspondingOption = this._selectValue(value);

            // Shift focus to the active item. Note that we shouldn't do this in multiple
            // mode, because we don't know what option the user interacted with last.
            if (correspondingOption) {
                this._keyManager.setActiveItem(correspondingOption);
            }
        }

        this._changeDetectorRef.markForCheck();
    }

    /**
     * Finds and selects and option based on its value.
     * @returns Option that has the corresponding value.
     */
    private _selectValue(value: any): McOption | undefined {
        const correspondingOption = this.options.find((option: McOption) => {
            try {
                // Treat null as a special reset value.
                return option.value != null && this._compareWith(option.value, value);
            } catch (error) {
                if (isDevMode()) {
                    // Notify developers of errors in their comparator.
                    console.warn(error);
                }

                return false;
            }
        });

        if (correspondingOption) {
            this._selectionModel.select(correspondingOption);
        }

        return correspondingOption;
    }

    /** Sets up a key manager to listen to keyboard events on the overlay panel. */
    private _initKeyManager() {
        this._keyManager = new ActiveDescendantKeyManager<McOption>(this.options)
            .withTypeAhead()
            .withVerticalOrientation()
            .withHorizontalOrientation(this._isRtl() ? 'rtl' : 'ltr');

        this._keyManager.tabOut
            .pipe(takeUntil(this._destroy))
            .subscribe(() => {
                // Restore focus to the trigger before closing. Ensures that the focus
                // position won't be lost if the user got focus into the overlay.
                this.focus();
                this.close();
            });

        this._keyManager.change
            .pipe(takeUntil(this._destroy))
            .subscribe(() => {
                if (this._panelOpen && this.panel) {
                    this._scrollActiveOptionIntoView();
                } else if (!this._panelOpen && !this.multiple && this._keyManager.activeItem) {
                    this._keyManager.activeItem._selectViaInteraction();
                }
            });
    }

    /** Drops current option subscriptions and IDs and resets from scratch. */
    private _resetOptions(): void {
        const changedOrDestroyed = merge(this.options.changes, this._destroy);

        this.optionSelectionChanges
            .pipe(takeUntil(changedOrDestroyed))
            .subscribe((event) => {
                this._onSelect(event.source, event.isUserInput);

                if (event.isUserInput && !this.multiple && this._panelOpen) {
                    this.close();
                    this.focus();
                }
            });

        // Listen to changes in the internal state of the options and react accordingly.
        // Handles cases like the labels of the selected options changing.
        merge(...this.options.map((option) => option._stateChanges))
            .pipe(takeUntil(changedOrDestroyed))
            .subscribe(() => {
                this._changeDetectorRef.markForCheck();
                this.stateChanges.next();
            });

        this._setOptionIds();
    }

    /** Invoked when an option is clicked. */
    private _onSelect(option: McOption, isUserInput: boolean): void {
        const wasSelected = this._selectionModel.isSelected(option);

        if (option.value == null && !this._multiple) {
            option.deselect();
            this._selectionModel.clear();
            this._propagateChanges(option.value);
        } else {
            if (option.selected) {
                this._selectionModel.select(option);
            } else {
                this._selectionModel.deselect(option);
            }

            if (isUserInput) {
                this._keyManager.setActiveItem(option);
            }

            if (this.multiple) {
                this._sortValues();

                if (isUserInput) {
                    // In case the user selected the option with their mouse, we
                    // want to restore focus back to the trigger, in order to
                    // prevent the select keyboard controls from clashing with
                    // the ones from `mc-option`.
                    this.focus();
                }
            }
        }

        if (wasSelected !== this._selectionModel.isSelected(option)) {
            this._propagateChanges();
        }

        this.stateChanges.next();
    }

    /** Sorts the selected values in the selected based on their order in the panel. */
    private _sortValues() {
        if (this.multiple) {
            const options = this.options.toArray();

            this._selectionModel.sort((a, b) => {
                return this.sortComparator ? this.sortComparator(a, b, options) :
                    options.indexOf(a) - options.indexOf(b);
            });
            this.stateChanges.next();
        }
    }

    /** Emits change event to set the model value. */
    private _propagateChanges(fallbackValue?: any): void {
        let valueToEmit: any = null;

        if (this.multiple) {
            valueToEmit = (this.selected as McOption[]).map((option) => option.value);
        } else {
            valueToEmit = this.selected ? (this.selected as McOption).value : fallbackValue;
        }

        this._value = valueToEmit;
        this.valueChange.emit(valueToEmit);
        this._onChange(valueToEmit);
        this.selectionChange.emit(new McTreeSelectChange(this, valueToEmit));
        this._changeDetectorRef.markForCheck();
    }

    /** Records option IDs to pass to the aria-owns property. */
    private _setOptionIds() {
        this._optionIds = this.options.map((option) => option.id).join(' ');
    }

    /**
     * Highlights the selected item. If no option is selected, it will highlight
     * the first item instead.
     */
    private _highlightCorrectOption(): void {
        if (this._keyManager) {
            if (this.empty) {
                this._keyManager.setFirstItemActive();
            } else {
                this._keyManager.setActiveItem(this._selectionModel.selected[0]);
            }
        }
    }

    /** Scrolls the active option into view. */
    private _scrollActiveOptionIntoView(): void {
        const activeOptionIndex = this._keyManager.activeItemIndex || 0;
        const labelCount = _countGroupLabelsBeforeOption(activeOptionIndex, this.options, this.optionGroups);

        this.panel.nativeElement.scrollTop = _getOptionScrollPosition(
            activeOptionIndex + labelCount,
            this._getItemHeight(),
            this.panel.nativeElement.scrollTop,
            TREE_SELECT_PANEL_MAX_HEIGHT
        );
    }

    /** Gets the index of the provided option in the option list. */
    private _getOptionIndex(option: McOption): number | undefined {
        /* tslint:disable-next-line */
        return this.options.reduce((result: number, current: McOption, index: number) => {
            /* tslint:disable-next-line:strict-type-predicates */
            return result === undefined ? (option === current ? index : undefined) : result;
        }, undefined);
    }

    /** Calculates the scroll position and x- and y-offsets of the overlay panel. */
    private _calculateOverlayPosition(): void {
        const itemHeight = this._getItemHeight();
        const items = this._getItemCount();
        const panelHeight = Math.min(items * itemHeight, TREE_SELECT_PANEL_MAX_HEIGHT);
        const scrollContainerHeight = items * itemHeight;

        // The farthest the panel can be scrolled before it hits the bottom
        const maxScroll = scrollContainerHeight - panelHeight;

        // If no value is selected we open the popup to the first item.
        let selectedOptionOffset =
            this.empty ? 0 : this._getOptionIndex(this._selectionModel.selected[0])!;

        selectedOptionOffset += _countGroupLabelsBeforeOption(selectedOptionOffset, this.options,
            this.optionGroups);

        // We must maintain a scroll buffer so the selected option will be scrolled to the
        // center of the overlay panel rather than the top.
        /* tslint:disable-next-line:no-magic-numbers */
        const scrollBuffer = panelHeight / 2;
        this._scrollTop = this._calculateOverlayScroll(selectedOptionOffset, scrollBuffer, maxScroll);
        this._offsetY = this._calculateOverlayOffsetY();

        this._checkOverlayWithinViewport(maxScroll);
    }

    /**
     * Sets the x-offset of the overlay panel in relation to the trigger's top start corner.
     * This must be adjusted to align the selected option text over the trigger text when
     * the panel opens. Will change based on LTR or RTL text direction. Note that the offset
     * can't be calculated until the panel has been attached, because we need to know the
     * content width in order to constrain the panel within the viewport.
     */
    private _calculateOverlayOffsetX(): void {
        const overlayRect = this.overlayDir.overlayRef.overlayElement.getBoundingClientRect();
        const viewportSize = this._viewportRuler.getViewportSize();
        const isRtl = this._isRtl();
        /* tslint:disable-next-line:no-magic-numbers */
        const paddingWidth = TREE_SELECT_PANEL_PADDING_X * 2;
        let offsetX: number;

        const selected = this._selectionModel.selected[0] || this.options.first;
        offsetX = selected && selected.group ? TREE_SELECT_PANEL_INDENT_PADDING_X : TREE_SELECT_PANEL_PADDING_X;

        // Invert the offset in LTR.
        if (!isRtl) { offsetX *= -1; }

        // Determine how much the select overflows on each side.
        const leftOverflow = 0 - (overlayRect.left + offsetX - (isRtl ? paddingWidth : 0));
        const rightOverflow = overlayRect.right + offsetX - viewportSize.width
            + (isRtl ? 0 : paddingWidth);

        // If the element overflows on either side, reduce the offset to allow it to fit.
        if (leftOverflow > 0) {
            offsetX += leftOverflow + TREE_SELECT_PANEL_VIEWPORT_PADDING;
        } else if (rightOverflow > 0) {
            offsetX -= rightOverflow + TREE_SELECT_PANEL_VIEWPORT_PADDING;
        }

        // Set the offset directly in order to avoid having to go through change detection and
        // potentially triggering "changed after it was checked" errors. Round the value to avoid
        // blurry content in some browsers.
        this.overlayDir.offsetX = Math.round(offsetX);
        this.overlayDir.overlayRef.updatePosition();
    }

    /**
     * Calculates the y-offset of the select's overlay panel in relation to the
     * top start corner of the trigger. It has to be adjusted in order for the
     * selected option to be aligned over the trigger when the panel opens.
     */
    private _calculateOverlayOffsetY(): number {
        // const itemHeight = this._getItemHeight();
        // const optionHeightAdjustment = (itemHeight - this._triggerRect.height) / 2;

        // todo I'm not sure that we will use it
        return 0;
        // return Math.round(-optionHeightAdjustment);
    }

    /**
     * Checks that the attempted overlay position will fit within the viewport.
     * If it will not fit, tries to adjust the scroll position and the associated
     * y-offset so the panel can open fully on-screen. If it still won't fit,
     * sets the offset back to 0 to allow the fallback position to take over.
     */
    private _checkOverlayWithinViewport(maxScroll: number): void {
        const itemHeight = this._getItemHeight();
        const viewportSize = this._viewportRuler.getViewportSize();

        const topSpaceAvailable = this._triggerRect.top - TREE_SELECT_PANEL_VIEWPORT_PADDING;
        const bottomSpaceAvailable =
            viewportSize.height - this._triggerRect.bottom - TREE_SELECT_PANEL_VIEWPORT_PADDING;

        const panelHeightTop = Math.abs(this._offsetY);
        const totalPanelHeight =
            Math.min(this._getItemCount() * itemHeight, TREE_SELECT_PANEL_MAX_HEIGHT);
        const panelHeightBottom = totalPanelHeight - panelHeightTop - this._triggerRect.height;

        if (panelHeightBottom > bottomSpaceAvailable) {
            this._adjustPanelUp(panelHeightBottom, bottomSpaceAvailable);
        } else if (panelHeightTop > topSpaceAvailable) {
            this._adjustPanelDown(panelHeightTop, topSpaceAvailable, maxScroll);
        } else {
            this._transformOrigin = this._getOriginBasedOnOption();
        }
    }

    /** Adjusts the overlay panel up to fit in the viewport. */
    private _adjustPanelUp(panelHeightBottom: number, bottomSpaceAvailable: number) {
        // Browsers ignore fractional scroll offsets, so we need to round.
        const distanceBelowViewport = Math.round(panelHeightBottom - bottomSpaceAvailable);

        // Scrolls the panel up by the distance it was extending past the boundary, then
        // adjusts the offset by that amount to move the panel up into the viewport.
        this._scrollTop -= distanceBelowViewport;
        this._offsetY -= distanceBelowViewport;
        this._transformOrigin = this._getOriginBasedOnOption();

        // If the panel is scrolled to the very top, it won't be able to fit the panel
        // by scrolling, so set the offset to 0 to allow the fallback position to take
        // effect.
        if (this._scrollTop <= 0) {
            this._scrollTop = 0;
            this._offsetY = 0;
            this._transformOrigin = `50% bottom 0px`;
        }
    }

    /** Adjusts the overlay panel down to fit in the viewport. */
    private _adjustPanelDown(panelHeightTop: number, topSpaceAvailable: number, maxScroll: number) {
        // Browsers ignore fractional scroll offsets, so we need to round.
        const distanceAboveViewport = Math.round(panelHeightTop - topSpaceAvailable);

        // Scrolls the panel down by the distance it was extending past the boundary, then
        // adjusts the offset by that amount to move the panel down into the viewport.
        this._scrollTop += distanceAboveViewport;
        this._offsetY += distanceAboveViewport;
        this._transformOrigin = this._getOriginBasedOnOption();

        // If the panel is scrolled to the very bottom, it won't be able to fit the
        // panel by scrolling, so set the offset to 0 to allow the fallback position
        // to take effect.
        if (this._scrollTop >= maxScroll) {
            this._scrollTop = maxScroll;
            this._offsetY = 0;
            this._transformOrigin = `50% top 0px`;

            return;
        }
    }

    /** Sets the transform origin point based on the selected option. */
    private _getOriginBasedOnOption(): string {
        const itemHeight = this._getItemHeight();
        /* tslint:disable-next-line:no-magic-numbers */
        const optionHeightAdjustment = (itemHeight - this._triggerRect.height) / 2;
        /* tslint:disable-next-line:no-magic-numbers */
        const originY = Math.abs(this._offsetY) - optionHeightAdjustment + itemHeight / 2;

        return `50% ${originY}px 0px`;
    }

    /** Calculates the amount of items in the select. This includes options and group labels. */
    private _getItemCount(): number {
        return this.options.length + this.optionGroups.length;
    }

    /** Calculates the height of the select's options. */
    private _getItemHeight(): number {
        /* tslint:disable-next-line:no-magic-numbers */
        return 32;
        // return this._triggerFontSize * TREE_SELECT_ITEM_HEIGHT_EM;
    }

    /** Comparison function to specify which option is displayed. Defaults to object equality. */
    private _compareWith = (o1: any, o2: any) => o1 === o2;
}
