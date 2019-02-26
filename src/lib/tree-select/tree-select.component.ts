/* tslint:disable:no-empty */

import {
    AfterContentInit, AfterViewInit,
    Attribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
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
    QueryList, Renderer2,
    Self,
    SimpleChanges,
    ViewChild, ViewChildren,
    ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, FormGroupDirective, NgControl, NgForm } from '@angular/forms';
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
    ViewportRuler
} from '@ptsecurity/cdk/overlay';
import { CdkTree } from '@ptsecurity/cdk/tree';
import {
    getOptionScrollPosition,
    CanDisable,
    CanUpdateErrorState,
    ErrorStateMatcher,
    HasTabIndex,
    MC_OPTION_PARENT_COMPONENT,
    CanDisableCtor,
    HasTabIndexCtor,
    CanUpdateErrorStateCtor,
    mixinTabIndex,
    mixinDisabled,
    mixinErrorState,
    mcSelectAnimations,

    SELECT_PANEL_MAX_HEIGHT,
    SELECT_PANEL_PADDING_X,
    SELECT_PANEL_VIEWPORT_PADDING,

    getMcSelectDynamicMultipleError,
    getMcSelectNonFunctionValueError,
    getMcSelectNonArrayValueError,
    MC_SELECT_SCROLL_STRATEGY
} from '@ptsecurity/mosaic/core';
import { McFormField, McFormFieldControl } from '@ptsecurity/mosaic/form-field';
import { McTag } from '@ptsecurity/mosaic/tag';
import { McTreeSelection, McTreeOption } from '@ptsecurity/mosaic/tree';
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


let nextUniqueId = 0;

/** Change event object that is emitted when the select value has changed. */
export class McTreeSelectChange {
    constructor(public source: McTreeOption, public value: any, public isUserInput = false) {}
}


@Directive({ selector: 'mc-tree-select-trigger' })
export class McTreeSelectTrigger {}


class McTreeSelectBase {
    constructor(
        public elementRef: ElementRef,
        public defaultErrorStateMatcher: ErrorStateMatcher,
        public parentForm: NgForm,
        public parentFormGroup: FormGroupDirective,
        public ngControl: NgControl
    ) {}
}

// tslint:disable-next-line:naming-convention
const McTreeSelectMixinBase: CanDisableCtor & HasTabIndexCtor & CanUpdateErrorStateCtor &
    typeof McTreeSelectBase = mixinTabIndex(mixinDisabled(mixinErrorState(McTreeSelectBase)));


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

        class: 'mc-tree-select',
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
        { provide: McFormFieldControl, useExisting: McTreeSelect },
        { provide: MC_OPTION_PARENT_COMPONENT, useExisting: McTreeSelect },
        { provide: CdkTree, useExisting: McTreeSelect }
    ]
})
export class McTreeSelect extends McTreeSelectMixinBase implements
    AfterContentInit, AfterViewInit, OnChanges, OnDestroy, OnInit, DoCheck, ControlValueAccessor,
    CanDisable, HasTabIndex, McFormFieldControl<any>, CanUpdateErrorState {

    /** A name for this control that can be used by `mc-form-field`. */
    controlType = 'mc-select';

    hiddenItems: number = 0;
    oneMoreText: string = '...ещё';

    /** The last measured value for the trigger's client bounding rect. */
    triggerRect: ClientRect;

    /** The cached font-size of the trigger element. */
    triggerFontSize = 0;

    /** Deals with the selection logic. */
    selectionModel: SelectionModel<McTreeOption>;

    /** Manages keyboard events for options in the panel. */
    keyManager: ActiveDescendantKeyManager<McTreeOption>;

    /** The IDs of child options to be passed to the aria-owns attribute. */
    optionIds: string = '';

    /** The value of the select panel's transform-origin property. */
    transformOrigin: string = 'top';

    /** Whether the panel's animation is done. */
    panelDoneAnimating: boolean = false;

    /** Emits when the panel element is finished transforming in. */
    panelDoneAnimatingStream = new Subject<string>();

    /** Strategy that will be used to handle scrolling while the select panel is open. */
    scrollStrategy = this.scrollStrategyFactory();

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

    @ViewChild('trigger') trigger: ElementRef;

    @ViewChild('panel') panel: ElementRef;

    @ViewChild(CdkConnectedOverlay) overlayDir: CdkConnectedOverlay;

    @ViewChildren(McTag) tags: QueryList<McTag>;

    /** User-supplied override of the trigger element. */
    @ContentChild(McTreeSelectTrigger) customTrigger: McTreeSelectTrigger;

    @ContentChild(McTreeSelection) tree: McTreeSelection;

    /** Event emitted when the select panel has been toggled. */
    @Output() readonly openedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    /** Event emitted when the select has been opened. */
    @Output('opened') readonly openedStream: Observable<void> =
        this.openedChange.pipe(filter((o) => o), map(() => {}));

    /** Event emitted when the select has been closed. */
    @Output('closed') readonly closedStream: Observable<void> =
        this.openedChange.pipe(filter((o) => !o), map(() => {}));

    /** Event emitted when the selected value has been changed by the user. */
    @Output() readonly selectionChange = new EventEmitter<McTreeSelectChange>();

    /**
     * Event that emits whenever the raw value of the select changes. This is here primarily
     * to facilitate the two-way binding for the `value` input.
     * @docs-private
     */
    @Output() readonly valueChange: EventEmitter<any> = new EventEmitter<any>();

    /** Classes to be passed to the select panel. Supports the same syntax as `ngClass`. */
    @Input() panelClass: string | string[] | Set<string> | { [key: string]: any };

    /** Object used to control when error messages are shown. */
    @Input() errorStateMatcher: ErrorStateMatcher;

    /**
     * Function used to sort the values in a select in multiple mode.
     * Follows the same logic as `Array.prototype.sort`.
     */
    @Input() sortComparator: (
        a: McTreeOption, b: McTreeOption, options: McTreeOption[]
    ) => number;

    /** Combined stream of all of the child options' change events. */
    readonly optionSelectionChanges: Observable<McTreeSelectChange> = defer(() => {
        if (this.options) {
            return merge(...this.options.map((option) => option.onSelectionChange));
        }

        return this.ngZone.onStable
            .asObservable()
            .pipe(take(1), switchMap(() => this.optionSelectionChanges));
    });

    private originalOnKeyDown: (event: KeyboardEvent) => void;

    private options: QueryList<McTreeOption>;

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

    @Input()
    get autoSelect(): boolean {
        if (this.multiple) { return false; }

        return this._autoSelect;
    }

    set autoSelect(value: boolean) {
        this._autoSelect = coerceBooleanProperty(value);
    }

    private _autoSelect: boolean = true;

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

    /** The scroll position of the overlay panel, calculated to center the selected option. */
    private scrollTop = 0;

    /** Unique id for this input. */
    private readonly uid = `mc-select-${nextUniqueId++}`;

    /** Emits whenever the component is destroyed. */
    private readonly destroy = new Subject<void>();

    constructor(
        private readonly viewportRuler: ViewportRuler,
        readonly changeDetectorRef: ChangeDetectorRef,
        private readonly ngZone: NgZone,
        private readonly renderer: Renderer2,
        defaultErrorStateMatcher: ErrorStateMatcher,
        public elementRef: ElementRef,
        @Optional() private readonly dir: Directionality,
        @Optional() parentForm: NgForm,
        @Optional() parentFormGroup: FormGroupDirective,
        @Optional() private readonly parentFormField: McFormField,
        @Self() @Optional() public ngControl: NgControl,
        @Attribute('tabindex') tabIndex: string,
        @Inject(MC_SELECT_SCROLL_STRATEGY) private readonly scrollStrategyFactory
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
        this.tree.multiple = this.multiple;

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
                    this.changeDetectorRef.markForCheck();
                }
            });
    }

    ngAfterContentInit() {
        this.initKeyManager();

        this.selectionModel = this.tree.selectionModel = new SelectionModel<McTreeOption>(this.multiple);
        this.options = this.tree.options;
        this.tree.autoSelect = this.autoSelect;

        this.selectionModel.changed
            .pipe(takeUntil(this.destroy))
            .subscribe((event) => {
                event.added.forEach((option) => option.select());
                event.removed.forEach((option) => option.deselect());
            });
    }

    ngAfterViewInit() {
        this.tags.changes
            .subscribe(() => {
                setTimeout(() => this.calculateHiddenItems(), 0);
            });

        this.options.changes
            .pipe(startWith(null), takeUntil(this.destroy))
            .subscribe(() => {
                this.updateSelectedOptions();

                this.resetOptions();
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

    /** `View -> model callback called when value changes` */
    _onChange: (value: any) => void = () => {};

    /** `View -> model callback called when select has been touched` */
    _onTouched = () => {};

    toggle() {
        if (this.panelOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        if (this.disabled || !this.options || !this.options.length || this._panelOpen) { return; }

        this.triggerRect = this.trigger.nativeElement.getBoundingClientRect();
        // Note: The computed font-size will be a string pixel value (e.g. "16px").
        // `parseInt` ignores the trailing 'px' and converts this to a number.
        this.triggerFontSize = parseInt(getComputedStyle(this.trigger.nativeElement)['font-size']);

        this._panelOpen = true;
        // this.tree.keyManager.withHorizontalOrientation(null);
        this.calculateOverlayPosition();
        this.highlightCorrectOption();
        this.changeDetectorRef.markForCheck();

        // Set the font size on the panel element once it exists.
        this.ngZone.onStable.asObservable()
            .pipe(take(1))
            .subscribe(() => {
                if (this.triggerFontSize && this.overlayDir.overlayRef &&
                    this.overlayDir.overlayRef.overlayElement) {
                    this.overlayDir.overlayRef.overlayElement.style.fontSize = `${this.triggerFontSize}px`;
                }
            });
    }

    /** Closes the overlay panel and focuses the host element. */
    close() {
        if (this._panelOpen) {
            this._panelOpen = false;

            // this.tree.keyManager.setActiveItem(-1);

            // this.tree.keyManager.withHorizontalOrientation(this.isRtl() ? 'rtl' : 'ltr');
            this.changeDetectorRef.markForCheck();
            this._onTouched();
        }
    }

    /**
     * Sets the select's value. Part of the ControlValueAccessor interface
     * required to integrate with Angular's core forms API.
     *
     * @param value New value to be written to the model.
     */
    // todo нужно доделать!
    writeValue(value: any) {
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
    registerOnChange(fn: (value: any) => void) {
        this._onChange = fn;
    }

    /**
     * Saves a callback function to be invoked when the select is blurred
     * by the user. Part of the ControlValueAccessor interface required
     * to integrate with Angular's core forms API.
     *
     * @param fn Callback to be triggered when the component has been touched.
     */
    registerOnTouched(fn: () => {}) {
        this._onTouched = fn;
    }

    /**
     * Disables the select. Part of the ControlValueAccessor interface required
     * to integrate with Angular's core forms API.
     *
     * @param isDisabled Sets whether the component is disabled.
     */
    setDisabledState(isDisabled: boolean) {
        this.disabled = isDisabled;
        this.changeDetectorRef.markForCheck();
        this.stateChanges.next();
    }

    get selected(): McTreeOption | McTreeOption[] {
        return this.multiple ? this.selectionModel.selected : this.selectionModel.selected[0];
    }

    get triggerValue(): string {
        if (this.empty) { return ''; }

        return (this.selected as McTreeOption).viewValue;
    }

    get triggerValues(): McTreeOption[] {
        if (this.empty) { return []; }

        const selectedOptions = this.selectionModel.selected;

        if (this.isRtl()) { selectedOptions.reverse(); }

        return selectedOptions;
    }

    get empty(): boolean {
        return !this.selectionModel || this.selectionModel.isEmpty();
    }

    isRtl(): boolean {
        return this.dir ? this.dir.value === 'rtl' : false;
    }

    handleKeydown(event: KeyboardEvent) {
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
    onFadeInDone() {
        this.panelDoneAnimating = this.panelOpen;
        this.changeDetectorRef.markForCheck();
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
            this._onTouched();
            this.changeDetectorRef.markForCheck();
            this.stateChanges.next();
        }
    }

    /** Callback that is invoked when the overlay panel has been attached. */
    onAttached() {
        this.overlayDir.positionChange
            .pipe(take(1))
            .subscribe(() => {
                this.changeDetectorRef.detectChanges();
                this.calculateOverlayOffsetX();
                this.panel.nativeElement.scrollTop = this.scrollTop;
            });
    }

    /** Returns the theme to be used on the panel. */
    getPanelTheme(): string {
        return this.parentFormField ? `mc-${this.parentFormField.color}` : '';
    }

    /** Focuses the select element. */
    focus() {
        this.elementRef.nativeElement.focus();
    }

    /**
     * Calculates the scroll position of the select's overlay panel.
     *
     * Attempts to center the selected option in the panel. If the option is
     * too high or too low in the panel to be scrolled to the center, it clamps the
     * scroll position to the min or max scroll positions respectively.
     */
    calculateOverlayScroll(selectedIndex: number, scrollBuffer: number, maxScroll: number): number {
        const itemHeight = this.getItemHeight();
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
    onRemoveSelectedOption(selectedOption: McTreeOption, $event) {
        $event.stopPropagation();

        this.options.forEach((option) => {
            if (option.data === selectedOption.data) { option.deselect(); }
        });

        this.selectionModel.deselect(selectedOption);
    }

    calculateHiddenItems() {
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

        this.hiddenItems = this.selectionModel.selected.length - visibleItems;

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
                this.changeDetectorRef.markForCheck();

                return ;
            } else if (!itemsCounterShowed && (totalItemsWidth + itemsCounterWidth) > matcherWidth) {
                this.hiddenItems++;
            }
        }

        this.changeDetectorRef.markForCheck();
    }

    private updateSelectedOptions(): void {
        this.selectionModel.selected.forEach((selectedOption) => {
            this.options.forEach((option) => {
                if (option.data === selectedOption.data) {
                    this.selectionModel.deselect(selectedOption);
                    this.selectionModel.select(option);

                    option.select();
                }
            });
        });
    }

    private getTotalItemsWidthInMatcher(): number {
        const triggerClone = this.trigger.nativeElement.cloneNode(true);
        triggerClone.querySelector('.mc-select__match-hidden-text').remove();

        this.renderer.setStyle(triggerClone, 'position', 'absolute');
        this.renderer.setStyle(triggerClone, 'visibility', 'hidden');
        this.renderer.setStyle(triggerClone, 'top', '-100%');
        this.renderer.setStyle(triggerClone, 'left', '0');

        this.renderer.appendChild(this.trigger.nativeElement, triggerClone);

        let totalItemsWidth: number = 0;
        const itemMargin: number = 4;
        triggerClone.querySelectorAll('mc-tag').forEach((item) => {
            totalItemsWidth += item.getBoundingClientRect().width as number + itemMargin;
        });

        triggerClone.remove();

        return totalItemsWidth;
    }

    private handleClosedKeydown(event: KeyboardEvent) {
        /* tslint:disable-next-line */
        const keyCode = event.keyCode;
        const isArrowKey = keyCode === DOWN_ARROW || keyCode === UP_ARROW ||
            keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW;
        const isOpenKey = keyCode === ENTER || keyCode === SPACE;

        // Open the select on ALT + arrow key to match the native <select>
        if (isOpenKey || ((this.multiple || event.altKey) && isArrowKey)) {
            // prevents the page from scrolling down when pressing space
            event.preventDefault();

            this.open();
        } else if (!this.multiple) {
            this.tree.keyManager.onKeydown(event);
        }
    }

    private handleOpenKeydown(event: KeyboardEvent) {
        /* tslint:disable-next-line */
        const keyCode = event.keyCode;
        const isArrowKey = keyCode === DOWN_ARROW || keyCode === UP_ARROW;

        if (isArrowKey && event.altKey) {
            // Close the select on ALT + arrow key to match the native <select>
            event.preventDefault();

            this.close();
        } else if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
            return this.originalOnKeyDown.call(this.tree, event);
        } else if (keyCode === HOME || keyCode === END) {
            event.preventDefault();

            if (keyCode === HOME) {
                this.tree.keyManager.setFirstItemActive();
            } else {
                this.tree.keyManager.setLastItemActive();
            }
        } else if ((keyCode === ENTER || keyCode === SPACE) && this.tree.keyManager.activeItem) {
            event.preventDefault();

            this.tree.keyManager.activeItem.selectViaInteraction();
        } else if (this.multiple && keyCode === A && event.ctrlKey) {
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
            const previouslyFocusedIndex = this.tree.keyManager.activeItemIndex;

            this.tree.keyManager.onKeydown(event);

            if (this.multiple && isArrowKey && event.shiftKey && this.tree.keyManager.activeItem &&
                this.tree.keyManager.activeItemIndex !== previouslyFocusedIndex) {
                this.tree.keyManager.activeItem.selectViaInteraction();
            }
        }
    }

    private initializeSelection() {
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
    private setSelectionByValue(value: any | any[]) {
        if (this.multiple && value) {
            if (!Array.isArray(value)) { throw getMcSelectNonArrayValueError(); }

            this.selectionModel.clear();
            value.forEach((currentValue: any) => this.selectValue(currentValue));
            this.sortValues();
        } else {
            this.selectionModel.clear();
            const correspondingOption = this.selectValue(value);

            // Shift focus to the active item. Note that we shouldn't do this in multiple
            // mode, because we don't know what option the user interacted with last.
            if (correspondingOption) {
                this.tree.keyManager.setActiveItem(correspondingOption);
            }
        }

        this.changeDetectorRef.markForCheck();
    }

    /**
     * Finds and selects and option based on its value.
     * @returns Option that has the corresponding value.
     */
    private selectValue(value: any): McTreeOption | undefined {
        const correspondingOption = this.options.find((option: McTreeOption) => {
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
            this.selectionModel.select(correspondingOption);
        }

        return correspondingOption;
    }

    private initKeyManager() {
        // this.tree.keyManager = new ActiveDescendantKeyManager<McTreeOption>(this.options)
        //     .withVerticalOrientation();

        this.originalOnKeyDown = this.tree.onKeyDown;

        this.tree.onKeyDown = () => {};

        this.tree.keyManager.tabOut
            .pipe(takeUntil(this.destroy))
            .subscribe(() => {
                // Restore focus to the trigger before closing. Ensures that the focus
                // position won't be lost if the user got focus into the overlay.
                this.focus();
                this.close();
            });

        this.tree.keyManager.change
            .pipe(takeUntil(this.destroy))
            .subscribe(() => {
                if (this._panelOpen && this.panel) {
                    this.scrollActiveOptionIntoView();
                } else if (!this._panelOpen && !this.multiple && this.tree.keyManager.activeItem) {
                    this.tree.keyManager.activeItem.selectViaInteraction();
                }
            });
    }

    /** Drops current option subscriptions and IDs and resets from scratch. */
    private resetOptions() {
        const changedOrDestroyed = merge(this.options.changes, this.destroy);

        this.optionSelectionChanges
            .pipe(takeUntil(changedOrDestroyed))
            .subscribe((event) => {
                this.onSelect(event.source, event.isUserInput);

                if (event.isUserInput && !this.multiple && this._panelOpen) {
                    this.close();
                    this.focus();
                }
            });

        // Listen to changes in the internal state of the options and react accordingly.
        // Handles cases like the labels of the selected options changing.
        // merge(...this.options.map((option) => option.stateChanges))
        //     .pipe(takeUntil(changedOrDestroyed))
        //     .subscribe(() => {
        //         this.changeDetectorRef.markForCheck();
        //         this.stateChanges.next();
        //     });

        this.setOptionIds();
    }

    /** Invoked when an option is clicked. */
    private onSelect(option: McTreeOption, isUserInput: boolean) {
        const wasSelected = this.selectionModel.isSelected(option);

        if (option.value == null && !this.multiple) {
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
                this.tree.keyManager.setActiveItem(option);
            }

            if (this.multiple) {
                this.sortValues();

                if (isUserInput) {
                    // In case the user selected the option with their mouse, we
                    // want to restore focus back to the trigger, in order to
                    // prevent the select keyboard controls from clashing with
                    // the ones from `mc-option`.
                    this.focus();
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
    private propagateChanges(fallbackValue?: any) {
        let valueToEmit: any = null;

        if (this.multiple) {
            valueToEmit = (this.selected as any).map((option) => option.value);
        } else {
            valueToEmit = this.selected ? (this.selected as any).value : fallbackValue;
        }

        this._value = valueToEmit;
        this.valueChange.emit(valueToEmit);
        this._onChange(valueToEmit);
        this.selectionChange.emit(new McTreeSelectChange(this as any, valueToEmit));
        this.changeDetectorRef.markForCheck();
    }

    /** Records option IDs to pass to the aria-owns property. */
    private setOptionIds() {
        this.optionIds = this.options.map((option) => option.id).join(' ');
    }

    /**
     * Highlights the selected item. If no option is selected, it will highlight
     * the first item instead.
     */
    private highlightCorrectOption() {
        if (this.tree.keyManager) {
            if (this.empty) {
                this.tree.keyManager.setFirstItemActive();
            } else {
                this.tree.keyManager.setActiveItem(this.selectionModel.selected[0]);
            }
        }
    }

    /** Scrolls the active option into view. */
    private scrollActiveOptionIntoView() {
        const activeOptionIndex = this.tree.keyManager.activeItemIndex || 0;

        this.panel.nativeElement.scrollTop = getOptionScrollPosition(
            activeOptionIndex,
            this.getItemHeight(),
            this.panel.nativeElement.scrollTop,
            SELECT_PANEL_MAX_HEIGHT
        );
    }

    /** Gets the index of the provided option in the option list. */
    private getOptionIndex(option: McTreeOption): number | undefined {
        // todo разобраться с этим срачем!
        return this.options.reduce((result: number, current: McTreeOption, index: number) => {
            /* tslint:disable-next-line:strict-type-predicates */
            return result === undefined ? (option === current ? index : undefined) : result;
        }, undefined);
    }

    /** Calculates the scroll position and x- and y-offsets of the overlay panel. */
    private calculateOverlayPosition() {
        const itemHeight = this.getItemHeight();
        const items = this.getItemCount();
        const panelHeight = Math.min(items * itemHeight, SELECT_PANEL_MAX_HEIGHT);
        const scrollContainerHeight = items * itemHeight;

        // The farthest the panel can be scrolled before it hits the bottom
        const maxScroll = scrollContainerHeight - panelHeight;

        // If no value is selected we open the popup to the first item.
        const selectedOptionOffset =
            this.empty ? 0 : this.getOptionIndex(this.selectionModel.selected[0])!;

        // We must maintain a scroll buffer so the selected option will be scrolled to the
        // center of the overlay panel rather than the top.
        /* tslint:disable-next-line:no-magic-numbers */
        const scrollBuffer = panelHeight / 2;
        this.scrollTop = this.calculateOverlayScroll(selectedOptionOffset, scrollBuffer, maxScroll);
        this.offsetY = this.calculateOverlayOffsetY();

        this.checkOverlayWithinViewport(maxScroll);
    }

    /**
     * Sets the x-offset of the overlay panel in relation to the trigger's top start corner.
     * This must be adjusted to align the selected option text over the trigger text when
     * the panel opens. Will change based on LTR or RTL text direction. Note that the offset
     * can't be calculated until the panel has been attached, because we need to know the
     * content width in order to constrain the panel within the viewport.
     */
    private calculateOverlayOffsetX() {
        const overlayRect = this.overlayDir.overlayRef.overlayElement.getBoundingClientRect();
        const viewportSize = this.viewportRuler.getViewportSize();
        const isRtl = this.isRtl();
        /* tslint:disable-next-line:no-magic-numbers */
        const paddingWidth = SELECT_PANEL_PADDING_X * 2;
        let offsetX: number = SELECT_PANEL_PADDING_X;

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

    /**
     * Calculates the y-offset of the select's overlay panel in relation to the
     * top start corner of the trigger. It has to be adjusted in order for the
     * selected option to be aligned over the trigger when the panel opens.
     */
    private calculateOverlayOffsetY(): number {
        // const itemHeight = this.getItemHeight();
        // const optionHeightAdjustment = (itemHeight - this.triggerRect.height) / 2;

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
    private checkOverlayWithinViewport(maxScroll: number) {
        const itemHeight = this.getItemHeight();
        const viewportSize = this.viewportRuler.getViewportSize();

        const topSpaceAvailable = this.triggerRect.top - SELECT_PANEL_VIEWPORT_PADDING;
        const bottomSpaceAvailable =
            viewportSize.height - this.triggerRect.bottom - SELECT_PANEL_VIEWPORT_PADDING;

        const panelHeightTop = Math.abs(this.offsetY);
        const totalPanelHeight =
            Math.min(this.getItemCount() * itemHeight, SELECT_PANEL_MAX_HEIGHT);
        const panelHeightBottom = totalPanelHeight - panelHeightTop - this.triggerRect.height;

        if (panelHeightBottom > bottomSpaceAvailable) {
            this.adjustPanelUp(panelHeightBottom, bottomSpaceAvailable);
        } else if (panelHeightTop > topSpaceAvailable) {
            this.adjustPanelDown(panelHeightTop, topSpaceAvailable, maxScroll);
        } else {
            this.transformOrigin = this.getOriginBasedOnOption();
        }
    }

    /** Adjusts the overlay panel up to fit in the viewport. */
    private adjustPanelUp(panelHeightBottom: number, bottomSpaceAvailable: number) {
        // Browsers ignore fractional scroll offsets, so we need to round.
        const distanceBelowViewport = Math.round(panelHeightBottom - bottomSpaceAvailable);

        // Scrolls the panel up by the distance it was extending past the boundary, then
        // adjusts the offset by that amount to move the panel up into the viewport.
        this.scrollTop -= distanceBelowViewport;
        this.offsetY -= distanceBelowViewport;
        this.transformOrigin = this.getOriginBasedOnOption();

        // If the panel is scrolled to the very top, it won't be able to fit the panel
        // by scrolling, so set the offset to 0 to allow the fallback position to take
        // effect.
        if (this.scrollTop <= 0) {
            this.scrollTop = 0;
            this.offsetY = 0;
            this.transformOrigin = `50% bottom 0px`;
        }
    }

    /** Adjusts the overlay panel down to fit in the viewport. */
    private adjustPanelDown(panelHeightTop: number, topSpaceAvailable: number, maxScroll: number) {
        // Browsers ignore fractional scroll offsets, so we need to round.
        const distanceAboveViewport = Math.round(panelHeightTop - topSpaceAvailable);

        // Scrolls the panel down by the distance it was extending past the boundary, then
        // adjusts the offset by that amount to move the panel down into the viewport.
        this.scrollTop += distanceAboveViewport;
        this.offsetY += distanceAboveViewport;
        this.transformOrigin = this.getOriginBasedOnOption();

        // If the panel is scrolled to the very bottom, it won't be able to fit the
        // panel by scrolling, so set the offset to 0 to allow the fallback position
        // to take effect.
        if (this.scrollTop >= maxScroll) {
            this.scrollTop = maxScroll;
            this.offsetY = 0;
            this.transformOrigin = `50% top 0px`;

            return;
        }
    }

    /** Sets the transform origin point based on the selected option. */
    private getOriginBasedOnOption(): string {
        const itemHeight = this.getItemHeight();
        /* tslint:disable-next-line:no-magic-numbers */
        const optionHeightAdjustment = (itemHeight - this.triggerRect.height) / 2;
        /* tslint:disable-next-line:no-magic-numbers */
        const originY = Math.abs(this.offsetY) - optionHeightAdjustment + itemHeight / 2;

        return `50% ${originY}px 0px`;
    }

    /** Calculates the amount of items in the select. This includes options and group labels. */
    private getItemCount(): number {
        return this.options.length;
    }

    /** Calculates the height of the select's options. */
    private getItemHeight(): number {
        // todo доделать
        /* tslint:disable-next-line:no-magic-numbers */
        return 32;
        // return this.triggerFontSize * SELECT_ITEM_HEIGHT_EM;
    }

    /** Comparison function to specify which option is displayed. Defaults to object equality. */
    private _compareWith = (o1: any, o2: any) => o1 === o2;
}
