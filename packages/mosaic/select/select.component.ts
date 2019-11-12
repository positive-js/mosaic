/* tslint:disable:no-empty */

import { Directionality } from '@angular/cdk/bidi';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { SelectionModel } from '@angular/cdk/collections';
import {
    CdkConnectedOverlay,
    ViewportRuler
} from '@angular/cdk/overlay';
import {
    AfterContentInit,
    AfterViewInit,
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
    Input,
    isDevMode,
    NgZone,
    OnChanges,
    OnDestroy,
    OnInit,
    Optional,
    Output,
    QueryList,
    Renderer2,
    Self,
    SimpleChanges,
    ViewChild,
    ViewChildren,
    ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import { ActiveDescendantKeyManager } from '@ptsecurity/cdk/a11y';
import {
    DOWN_ARROW,
    END,
    ENTER,
    HOME,
    LEFT_ARROW,
    RIGHT_ARROW,
    SPACE,
    UP_ARROW,
    A,
    ESCAPE,
    PAGE_UP,
    PAGE_DOWN
} from '@ptsecurity/cdk/keycodes';
import {
    countGroupLabelsBeforeOption,
    getOptionScrollPosition,
    CanDisable,
    CanDisableCtor,
    CanUpdateErrorState,
    CanUpdateErrorStateCtor,
    ErrorStateMatcher,
    HasTabIndex,
    HasTabIndexCtor,
    MC_OPTION_PARENT_COMPONENT,
    McOptgroup,
    McOption,
    McOptionSelectionChange,
    mixinDisabled,
    mixinErrorState,
    mixinTabIndex,
    mcSelectAnimations,

    SELECT_PANEL_INDENT_PADDING_X,
    SELECT_PANEL_MAX_HEIGHT,
    SELECT_PANEL_PADDING_X,
    SELECT_PANEL_VIEWPORT_PADDING,

    getMcSelectDynamicMultipleError,
    getMcSelectNonFunctionValueError,
    getMcSelectNonArrayValueError,
    MC_SELECT_SCROLL_STRATEGY
} from '@ptsecurity/mosaic/core';
import { McCleaner, McFormField, McFormFieldControl } from '@ptsecurity/mosaic/form-field';
import { McInput } from '@ptsecurity/mosaic/input';
import { McTag } from '@ptsecurity/mosaic/tags';
import { defer, merge, Observable, Subject, Subscription } from 'rxjs';
import {
    filter,
    map,
    startWith,
    switchMap,
    take,
    takeUntil,
    distinctUntilChanged
} from 'rxjs/operators';


let nextUniqueId = 0;

/** Change event object that is emitted when the select value has changed. */
export class McSelectChange {
    constructor(public source: McSelect, public value: any) {}
}

export class McSelectBase {
    constructor(
        public elementRef: ElementRef,
        public defaultErrorStateMatcher: ErrorStateMatcher,
        public parentForm: NgForm,
        public parentFormGroup: FormGroupDirective,
        public ngControl: NgControl
    ) {}
}

// tslint:disable-next-line:naming-convention
const McSelectMixinBase: CanDisableCtor & HasTabIndexCtor & CanUpdateErrorStateCtor &
    typeof McSelectBase = mixinTabIndex(mixinDisabled(mixinErrorState(McSelectBase)));


@Directive({
    selector: '[mcSelectSearch]',
    exportAs: 'mcSelectSearch',
    host: {
        '(keydown)': 'handleKeydown($event)'
    }
})
export class McSelectSearch implements AfterContentInit, OnDestroy {
    @ContentChild(McInput, { static: false }) input: McInput;

    searchChangesSubscription: Subscription = new Subscription();

    isSearchChanged: boolean = false;

    constructor(formField: McFormField) {
        formField.canCleanerClearByEsc = false;
    }

    focus(): void {
        this.input.focus();
    }

    reset(): void {
        this.input.ngControl.reset();
    }

    ngAfterContentInit(): void {
        if (!this.input) {
            throw Error('McSelectSearch does not work without mcInput');
        }

        if (!this.input.ngControl) {
            throw Error('McSelectSearch does not work without ngControl');
        }

        this.searchChangesSubscription = this.input.ngControl.valueChanges!.subscribe(() => {
            this.isSearchChanged = true;
        });
    }

    ngOnDestroy(): void {
        this.searchChangesSubscription.unsubscribe();
    }

    handleKeydown(event: KeyboardEvent) {
        // tslint:disable-next-line:deprecation
        if (event.keyCode === ESCAPE) {
            if (this.input.value) {
                this.reset();
                event.stopPropagation();
            }
        }
    }
}

@Directive({
    selector: '[mc-select-search-empty-result]',
    exportAs: 'mcSelectSearchEmptyResult'
})
export class McSelectSearchEmptyResult {}


@Directive({ selector: 'mc-select-trigger' })
export class McSelectTrigger {}


@Component({
    selector: 'mc-select',
    exportAs: 'mcSelect',
    templateUrl: 'select.html',
    styleUrls: ['./select.css'],
    inputs: ['disabled'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '[attr.id]': 'id',
        '[tabindex]': 'tabIndex',

        class: 'mc-select',
        '[class.mc-disabled]': 'disabled',
        '[class.mc-select-invalid]': 'errorState',
        '[class.mc-select-required]': 'required',

        '(keydown)': 'handleKeydown($event)',
        '(focus)': 'onFocus()',
        '(blur)': 'onBlur()',
        '(window:resize)': 'calculateHiddenItems()'
    },
    animations: [
        mcSelectAnimations.transformPanel,
        mcSelectAnimations.fadeInContent
    ],
    providers: [
        { provide: McFormFieldControl, useExisting: McSelect },
        { provide: MC_OPTION_PARENT_COMPONENT, useExisting: McSelect }
    ]
})
export class McSelect extends McSelectMixinBase implements
    AfterContentInit, AfterViewInit, OnChanges, OnDestroy, OnInit, DoCheck, ControlValueAccessor, CanDisable,
    HasTabIndex, McFormFieldControl<any>, CanUpdateErrorState {

    /** A name for this control that can be used by `mc-form-field`. */
    controlType = 'mc-select';

    hiddenItems: number = 0;

    /** The last measured value for the trigger's client bounding rect. */
    triggerRect: ClientRect;

    /** The cached font-size of the trigger element. */
    triggerFontSize = 0;

    /** Deals with the selection logic. */
    selectionModel: SelectionModel<McOption>;

    previousSelectionModelSelected: McOption[] = [];

    /** Manages keyboard events for options in the panel. */
    keyManager: ActiveDescendantKeyManager<McOption>;

    /** The value of the select panel's transform-origin property. */
    transformOrigin: string = 'top';

    /** Whether the panel's animation is done. */
    panelDoneAnimating: boolean = false;

    /** Emits when the panel element is finished transforming in. */
    panelDoneAnimatingStream = new Subject<string>();

    /** Strategy that will be used to handle scrolling while the select panel is open. */
    scrollStrategy = this._scrollStrategyFactory();

    /**
     * The y-offset of the overlay panel in relation to the trigger's top start corner.
     * This must be adjusted to align the selected option text over the trigger text.
     * when the panel opens. Will change based on the y-position of the selected option.
     */
    offsetY = 0;

    /**
     * This position config ensures that the top "start" corner of the overlay
     * is aligned with with the top "start" of the origin by default (overlapping
     * the trigger completely). If the panel cannot fit below the trigger, it
     * will fall back to a position above the trigger.
     */
    positions = [
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

    @ViewChild('trigger', { static: false }) trigger: ElementRef;

    @ViewChild('panel', { static: false }) panel: ElementRef;

    @ViewChild('optionsContainer', { static: false }) optionsContainer: ElementRef;

    @ViewChild(CdkConnectedOverlay, { static: false }) overlayDir: CdkConnectedOverlay;

    @ViewChildren(McTag) tags: QueryList<McTag>;

    /** User-supplied override of the trigger element. */
    @ContentChild(McSelectTrigger, { static: false }) customTrigger: McSelectTrigger;

    @ContentChild('mcSelectCleaner', { static: true }) cleaner: McCleaner;

    /** All of the defined select options. */
    @ContentChildren(McOption, { descendants: true }) options: QueryList<McOption>;

    /** All of the defined groups of options. */
    @ContentChildren(McOptgroup) optionGroups: QueryList<McOptgroup>;

    @ContentChild(McSelectSearch, { static: false }) search: McSelectSearch;

    @Input() hiddenItemsText: string = '...ещё';

    /** Classes to be passed to the select panel. Supports the same syntax as `ngClass`. */
    @Input() panelClass: string | string[] | Set<string> | { [key: string]: any };

    /** Object used to control when error messages are shown. */
    @Input() errorStateMatcher: ErrorStateMatcher;

    /**
     * Function used to sort the values in a select in multiple mode.
     * Follows the same logic as `Array.prototype.sort`.
     */
    @Input() sortComparator: (a: McOption, b: McOption, options: McOption[]) => number;

    /** Combined stream of all of the child options' change events. */
    readonly optionSelectionChanges: Observable<McOptionSelectionChange> = defer(() => {
        if (this.options) {
            return merge(
                ...this.options.map((option) => option.onSelectionChange),
                ...this.selectionModel.selected.map((option) => option.onSelectionChange)
            );
        }

        return this._ngZone.onStable
            .asObservable()
            .pipe(take(1), switchMap(() => this.optionSelectionChanges));
    }) as Observable<McOptionSelectionChange>;

    /** Event emitted when the select panel has been toggled. */
    @Output() readonly openedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    /** Event emitted when the select has been opened. */
    @Output('opened') readonly openedStream: Observable<void> =
        this.openedChange.pipe(filter((o) => o), map(() => {}));

    /** Event emitted when the select has been closed. */
    @Output('closed') readonly closedStream: Observable<void> =
        this.openedChange.pipe(filter((o) => !o), map(() => {}));

    /** Event emitted when the selected value has been changed by the user. */
    @Output() readonly selectionChange: EventEmitter<McSelectChange> = new EventEmitter<McSelectChange>();

    /**
     * Event that emits whenever the raw value of the select changes. This is here primarily
     * to facilitate the two-way binding for the `value` input.
     * @docs-private
     */
    @Output() readonly valueChange: EventEmitter<any> = new EventEmitter<any>();

    @Input()
    get placeholder(): string {
        return this._placeholder;
    }

    set placeholder(value: string) {
        this._placeholder = value;

        this.stateChanges.next();
    }

    private _placeholder: string;

    @Input()
    get required(): boolean {
        return this._required;
    }

    set required(value: boolean) {
        this._required = coerceBooleanProperty(value);

        this.stateChanges.next();
    }

    private _required: boolean = false;

    @Input()
    get multiple(): boolean {
        return this._multiple;
    }

    set multiple(value: boolean) {
        if (this.selectionModel) {
            throw getMcSelectDynamicMultipleError();
        }

        this._multiple = coerceBooleanProperty(value);
    }

    private _multiple: boolean = false;

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

        if (this.selectionModel) {
            // A different comparator means the selection could change.
            this.initializeSelection();
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

    private _value: any;

    @Input()
    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value || this.uid;
        this.stateChanges.next();
    }

    private _id: string;

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

    private _focused = false;

    get panelOpen(): boolean {
        return this._panelOpen;
    }

    private _panelOpen = false;

    get isEmptySearchResult(): boolean {
        return this.search && this.options.length === 0 && !!this.search.input.value;
    }

    get canShowCleaner(): boolean {
        return this.cleaner && this.selectionModel.hasValue();
    }

    /** The scroll position of the overlay panel, calculated to center the selected option. */
    private scrollTop = 0;

    /** Unique id for this input. */
    private readonly uid = `mc-select-${nextUniqueId++}`;

    /** Emits whenever the component is destroyed. */
    private readonly destroy = new Subject<void>();

    constructor(
        private readonly _viewportRuler: ViewportRuler,
        private readonly _changeDetectorRef: ChangeDetectorRef,
        private readonly _ngZone: NgZone,
        private readonly _renderer: Renderer2,
        defaultErrorStateMatcher: ErrorStateMatcher,
        elementRef: ElementRef,
        @Optional() private readonly _dir: Directionality,
        @Optional() parentForm: NgForm,
        @Optional() parentFormGroup: FormGroupDirective,
        @Optional() private readonly _parentFormField: McFormField,
        @Self() @Optional() public ngControl: NgControl,
        @Attribute('tabindex') tabIndex: string,
        @Inject(MC_SELECT_SCROLL_STRATEGY) private readonly _scrollStrategyFactory
    ) {
        super(elementRef, defaultErrorStateMatcher, parentForm, parentFormGroup, ngControl);

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
        this.selectionModel = new SelectionModel<McOption>(this.multiple);
        this.stateChanges.next();

        // We need `distinctUntilChanged` here, because some browsers will
        // fire the animation end event twice for the same animation. See:
        // https://github.com/angular/angular/issues/24084
        this.panelDoneAnimatingStream
            .pipe(distinctUntilChanged(), takeUntil(this.destroy))
            .subscribe(() => {
                if (this.panelOpen) {
                    this.scrollTop = 0;
                    this.openedChange.emit(true);
                } else {
                    this.openedChange.emit(false);
                    this.panelDoneAnimating = false;
                    this.overlayDir.offsetX = 0;
                    this._changeDetectorRef.markForCheck();
                }
            });
    }

    ngAfterContentInit() {
        this.initKeyManager();

        this.selectionModel.changed
            .pipe(takeUntil(this.destroy))
            .subscribe((event) => {
                event.added.forEach((option) => option.select());
                event.removed.forEach((option) => option.deselect());
            });

        this.options.changes
            .pipe(startWith(null), takeUntil(this.destroy))
            .subscribe(() => {
                this.resetOptions();
                this.initializeSelection();
            });
    }

    ngAfterViewInit(): void {
        this.tags.changes
            .subscribe(() => {
                setTimeout(() => this.calculateHiddenItems(), 0);
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
        this.destroy.next();
        this.destroy.complete();
        this.stateChanges.complete();
    }

    clearValue($event): void {
        $event.stopPropagation();

        this.selectionModel.clear();

        this.propagateChanges();
    }

    /** `View -> model callback called when value changes` */
    onChange: (value: any) => void = () => {};

    /** `View -> model callback called when select has been touched` */
    onTouched = () => {};

    resetSearch(): void {
        if (this.search) {
            this.search.reset();
            /*
            todo the incorrect behaviour of keyManager is possible here
            to avoid first item selection (to provide correct options flipping on closed select)
            we should process options update like it is the first options appearance
             */
            this.search.isSearchChanged = false;
        }
    }

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

        this.triggerRect = this.trigger.nativeElement.getBoundingClientRect();
        // Note: The computed font-size will be a string pixel value (e.g. "16px").
        // `parseInt` ignores the trailing 'px' and converts this to a number.
        this.triggerFontSize = parseInt(getComputedStyle(this.trigger.nativeElement)['font-size']);

        this._panelOpen = true;
        this.keyManager.withHorizontalOrientation(null);
        this.highlightCorrectOption();
        this._changeDetectorRef.markForCheck();

        // Set the font size on the panel element once it exists.
        this._ngZone.onStable.asObservable()
            .pipe(take(1))
            .subscribe(() => {
                if (this.triggerFontSize && this.overlayDir.overlayRef && this.overlayDir.overlayRef.overlayElement) {
                    this.overlayDir.overlayRef.overlayElement.style.fontSize = `${this.triggerFontSize}px`;
                }
            });
    }

    /** Closes the overlay panel and focuses the host element. */
    close(): void {
        if (!this._panelOpen) { return; }

        // the order of calls is important
        this.resetSearch();
        this._panelOpen = false;
        this.keyManager.withHorizontalOrientation(this.isRtl() ? 'rtl' : 'ltr');

        this._changeDetectorRef.markForCheck();
        this.onTouched();
    }

    /**
     * Sets the select's value. Part of the ControlValueAccessor interface
     * required to integrate with Angular's core forms API.
     *
     * @param value New value to be written to the model.
     */
    writeValue(value: any): void {
        if (this.options) {
            this.setSelectionByValue(value);
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
        this.onChange = fn;
    }

    /**
     * Saves a callback function to be invoked when the select is blurred
     * by the user. Part of the ControlValueAccessor interface required
     * to integrate with Angular's core forms API.
     *
     * @param fn Callback to be triggered when the component has been touched.
     */
    registerOnTouched(fn: () => {}): void {
        this.onTouched = fn;
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

    get selected(): McOption | McOption[] {
        return this.multiple ? this.selectionModel.selected : this.selectionModel.selected[0];
    }

    get triggerValue(): string {
        if (this.empty) { return ''; }

        return this.selectionModel.selected[0].viewValue;
    }

    get triggerValues(): McOption[] {
        if (this.empty) { return []; }

        const selectedOptions = this.selectionModel.selected;

        if (this.isRtl()) { selectedOptions.reverse(); }

        return selectedOptions;
    }

    get empty(): boolean {
        return !this.selectionModel || this.selectionModel.isEmpty();
    }

    isRtl(): boolean {
        return this._dir ? this._dir.value === 'rtl' : false;
    }

    handleKeydown(event: KeyboardEvent): void {
        if (!this.disabled) {
            if (this.panelOpen) {
                this.handleOpenKeydown(event);
            } else {
                this.handleClosedKeydown(event);
            }
        }
    }

    /**
     * When the panel content is done fading in, the panelDoneAnimating property is
     * set so the proper class can be added to the panel.
     */
    onFadeInDone(): void {
        this.panelDoneAnimating = this.panelOpen;
        this._changeDetectorRef.markForCheck();

        if (this.search && this._panelOpen) {
            this.search.focus();
        }
    }

    onFocus() {
        if (!this.disabled) {
            this._focused = true;

            this.stateChanges.next();
        }
    }

    /**
     * Calls the touched callback only if the panel is closed. Otherwise, the trigger will
     * "blur" to the panel when it opens, causing a false positive.
     */
    onBlur() {
        this._focused = false;

        if (!this.disabled && !this.panelOpen) {
            this.onTouched();
            this._changeDetectorRef.markForCheck();
            this.stateChanges.next();
        }
    }

    /**
     * Callback that is invoked when the overlay panel has been attached.
     */
    onAttached(): void {
        this.overlayDir.positionChange
            .pipe(take(1))
            .subscribe(() => {
                this._changeDetectorRef.detectChanges();
                this.calculateOverlayOffsetX();
                this.optionsContainer.nativeElement.scrollTop = this.scrollTop;

                this.updateScrollSize();
            });
    }

    /** Returns the theme to be used on the panel. */
    getPanelTheme(): string {
        return this._parentFormField ? `mc-${this._parentFormField.color}` : '';
    }

    /** Focuses the select element. */
    focus(): void {
        this.elementRef.nativeElement.focus();
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

    calculateHiddenItems(): void {
        if (this.empty || !this.multiple) { return; }

        let visibleItems: number = 0;
        const totalItemsWidth = this.getTotalItemsWidthInMatcher();
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

    getItemHeight(): number {
        return this.options.first ? this.options.first.getHeight() : 0;
    }

    private getHeightOfOptionsContainer(): number {
        return this.optionsContainer.nativeElement.getClientRects()[0].height;
    }

    private updateScrollSize(): void {
        if (!this.options.first) { return; }

        this.keyManager.withScrollSize(
            Math.floor(this.getHeightOfOptionsContainer() / this.options.first.getHeight())
        );
    }

    private getTotalItemsWidthInMatcher(): number {
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
    private handleClosedKeydown(event: KeyboardEvent): void {
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
            this.keyManager.onKeydown(event);
        }
    }

    /** Handles keyboard events when the selected is open. */
    private handleOpenKeydown(event: KeyboardEvent): void {
        /* tslint:disable-next-line */
        const keyCode = event.keyCode;
        const isArrowKey = keyCode === DOWN_ARROW || keyCode === UP_ARROW;
        const manager = this.keyManager;

        if (isArrowKey && event.altKey) {
            // Close the select on ALT + arrow key to match the native <select>
            event.preventDefault();
            this.close();
        } else if (keyCode === HOME) {
            event.preventDefault();

            manager.setFirstItemActive();
        } else if (keyCode === END) {
            event.preventDefault();

            manager.setLastItemActive();
        } else if (keyCode === PAGE_UP) {
            event.preventDefault();

            manager.setPreviousPageItemActive();
        } else if (keyCode === PAGE_DOWN) {
            event.preventDefault();

            manager.setNextPageItemActive();
        } else if ((keyCode === ENTER || keyCode === SPACE) && manager.activeItem) {
            event.preventDefault();
            manager.activeItem.selectViaInteraction();
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
                manager.activeItem.selectViaInteraction();
            }
        }
    }

    private initializeSelection(): void {
        // Defer setting the value in order to avoid the "Expression
        // has changed after it was checked" errors from Angular.
        Promise.resolve().then(() => {
            this.setSelectionByValue(this.ngControl ? this.ngControl.value : this._value);
        });
    }

    /**
     * Sets the selected option based on a value. If no option can be
     * found with the designated value, the select trigger is cleared.
     */
    private setSelectionByValue(value: any | any[]): void {
        this.previousSelectionModelSelected = this.selectionModel.selected;

        if (this.multiple && value) {
            if (!Array.isArray(value)) {
                throw getMcSelectNonArrayValueError();
            }

            this.selectionModel.clear();
            value.forEach((currentValue: any) => this.selectValue(currentValue));
            this.sortValues();
        } else {
            this.selectionModel.clear();
            const correspondingOption = this.selectValue(value);

            // Shift focus to the active item. Note that we shouldn't do this in multiple
            // mode, because we don't know what option the user interacted with last.
            if (correspondingOption) {
                this.keyManager.setActiveItem(correspondingOption);
            }
        }

        this._changeDetectorRef.markForCheck();
    }

    private getCorrespondOption(value: any): McOption | undefined {
        return [
            ...this.options.toArray(),
            ...this.previousSelectionModelSelected
        ].find((option: McOption) => {
            try {
                // Treat null as a special reset value.
                return option.value != null && this.compareWith(option.value, value);
            } catch (error) {
                if (isDevMode()) {
                    // Notify developers of errors in their comparator.
                    console.warn(error);
                }

                return false;
            }
        });
    }

    /**
     * Finds and selects and option based on its value.
     * @returns Option that has the corresponding value.
     */
    private selectValue(value: any): McOption | undefined {
        const correspondingOption = this.getCorrespondOption(value);

        if (correspondingOption) {
            this.selectionModel.select(correspondingOption);
        }

        return correspondingOption;
    }

    /** Sets up a key manager to listen to keyboard events on the overlay panel. */
    private initKeyManager() {
        const typeAheadDebounce = 200;

        this.keyManager = new ActiveDescendantKeyManager<McOption>(this.options)
            .withTypeAhead(typeAheadDebounce, this.search ? -1 : 0)
            .withVerticalOrientation()
            .withHorizontalOrientation(this.isRtl() ? 'rtl' : 'ltr');

        this.keyManager.tabOut
            .pipe(takeUntil(this.destroy))
            .subscribe(() => {
                // Restore focus to the trigger before closing. Ensures that the focus
                // position won't be lost if the user got focus into the overlay.
                this.focus();
                this.close();
            });

        this.keyManager.change
            .pipe(takeUntil(this.destroy))
            .subscribe(() => {
                if (this._panelOpen && this.panel) {
                    this.scrollActiveOptionIntoView();
                } else if (!this._panelOpen && !this.multiple && this.keyManager.activeItem) {
                    this.keyManager.activeItem.selectViaInteraction();
                }
            });
    }

    /** Drops current option subscriptions and IDs and resets from scratch. */
    private resetOptions(): void {
        const changedOrDestroyed = merge(this.options.changes, this.destroy);

        this.optionSelectionChanges
            .pipe(takeUntil(changedOrDestroyed))
            .subscribe((event) => {
                this.onSelect(event.source, event.isUserInput);

                if (this.search && this.search.isSearchChanged) {
                    Promise.resolve().then(() => this.keyManager.setFirstItemActive());

                    this.search.isSearchChanged = false;
                }

                if (event.isUserInput && !this.multiple && this._panelOpen) {
                    this.close();
                    this.focus();
                }
            });

        // Listen to changes in the internal state of the options and react accordingly.
        // Handles cases like the labels of the selected options changing.
        merge(...this.options.map((option) => option.stateChanges))
            .pipe(takeUntil(changedOrDestroyed))
            .subscribe(() => {
                this._changeDetectorRef.markForCheck();
                this.stateChanges.next();
            });
    }

    /** Invoked when an option is clicked. */
    private onSelect(option: McOption, isUserInput: boolean): void {
        const wasSelected = this.selectionModel.isSelected(option);

        if (option.value == null && !this._multiple) {
            option.deselect();
            this.selectionModel.clear();
            this.propagateChanges(option.value);
        } else {
            if (option.selected) {
                this.selectionModel.select(option);
            } else {
                this.selectionModel.deselect(option);
            }

            if (isUserInput) {
                this.keyManager.setActiveItem(option);
            }

            if (this.multiple) {
                this.sortValues();

                if (isUserInput) {
                    // In case the user selected the option with their mouse, we
                    // want to restore focus back to the trigger, in order to
                    // prevent the select keyboard controls from clashing with
                    // the ones from `mc-option`.
                    // If search is avaliable then we focus search again.
                    if (this.search) {
                        this.search.focus();
                    } else {
                        this.focus();
                    }
                }
            }
        }

        if (wasSelected !== this.selectionModel.isSelected(option)) {
            this.propagateChanges();
        }

        this.stateChanges.next();
    }

    /** Sorts the selected values in the selected based on their order in the panel. */
    private sortValues() {
        if (this.multiple) {
            const options = this.options.toArray();

            this.selectionModel.sort((a, b) => {
                return this.sortComparator ? this.sortComparator(a, b, options) :
                    options.indexOf(a) - options.indexOf(b);
            });
            this.stateChanges.next();
        }
    }

    /** Emits change event to set the model value. */
    private propagateChanges(fallbackValue?: any): void {
        let valueToEmit: any = null;

        if (this.multiple) {
            valueToEmit = (this.selected as McOption[]).map((option) => option.value);
        } else {
            valueToEmit = this.selected ? (this.selected as McOption).value : fallbackValue;
        }

        this._value = valueToEmit;
        this.valueChange.emit(valueToEmit);
        this.onChange(valueToEmit);
        this.selectionChange.emit(new McSelectChange(this, valueToEmit));
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Highlights the selected item. If no option is selected, it will highlight
     * the first item instead.
     */
    private highlightCorrectOption(): void {
        if (this.keyManager) {
            if (this.empty) {
                this.keyManager.setFirstItemActive();
            } else {
                this.keyManager.setActiveItem(this.selectionModel.selected[0]);
            }
        }
    }

    /** Scrolls the active option into view. */
    private scrollActiveOptionIntoView(): void {
        const activeOptionIndex = this.keyManager.activeItemIndex || 0;
        const labelCount = countGroupLabelsBeforeOption(activeOptionIndex, this.options, this.optionGroups);

        this.optionsContainer.nativeElement.scrollTop = getOptionScrollPosition(
            activeOptionIndex + labelCount,
            this.getItemHeight(),
            this.optionsContainer.nativeElement.scrollTop,
            SELECT_PANEL_MAX_HEIGHT
        );
    }

    /**
     * Sets the x-offset of the overlay panel in relation to the trigger's top start corner.
     * This must be adjusted to align the selected option text over the trigger text when
     * the panel opens. Will change based on LTR or RTL text direction. Note that the offset
     * can't be calculated until the panel has been attached, because we need to know the
     * content width in order to constrain the panel within the viewport.
     */
    private calculateOverlayOffsetX(): void {
        const overlayRect = this.overlayDir.overlayRef.overlayElement.getBoundingClientRect();
        const viewportSize = this._viewportRuler.getViewportSize();
        const isRtl = this.isRtl();
        /* tslint:disable-next-line:no-magic-numbers */
        const paddingWidth = SELECT_PANEL_PADDING_X * 2;
        let offsetX: number;

        const selected = this.selectionModel.selected[0] || this.options.first;
        offsetX = selected && selected.group ? SELECT_PANEL_INDENT_PADDING_X : SELECT_PANEL_PADDING_X;

        // Invert the offset in LTR.
        if (!isRtl) { offsetX *= -1; }

        // Determine how much the select overflows on each side.
        const leftOverflow = 0 - (overlayRect.left + offsetX - (isRtl ? paddingWidth : 0));
        const rightOverflow = overlayRect.right + offsetX - viewportSize.width
            + (isRtl ? 0 : paddingWidth);

        // If the element overflows on either side, reduce the offset to allow it to fit.
        if (leftOverflow > 0) {
            offsetX += leftOverflow + SELECT_PANEL_VIEWPORT_PADDING;
        } else if (rightOverflow > 0) {
            offsetX -= rightOverflow + SELECT_PANEL_VIEWPORT_PADDING;
        }

        // Set the offset directly in order to avoid having to go through change detection and
        // potentially triggering "changed after it was checked" errors. Round the value to avoid
        // blurry content in some browsers.
        this.overlayDir.offsetX = Math.round(offsetX);
        this.overlayDir.overlayRef.updatePosition();
    }

    /** Comparison function to specify which option is displayed. Defaults to object equality. */
    private _compareWith = (o1: any, o2: any) => o1 === o2;
}
