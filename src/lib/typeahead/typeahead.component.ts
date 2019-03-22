/* tslint:disable:no-empty */

import { DOCUMENT } from '@angular/common';
import {
    AfterContentInit, AfterViewChecked, AfterViewInit,
    Attribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ContentChildren,
    Directive,
    DoCheck,
    ElementRef,
    EventEmitter, Host,
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
    UP_ARROW
} from '@ptsecurity/cdk/keycodes';
import {
    CdkConnectedOverlay,
    ViewportRuler
} from '@ptsecurity/cdk/overlay';
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

    getMcSelectNonFunctionValueError,
    getMcSelectNonArrayValueError,
    MC_SELECT_SCROLL_STRATEGY
} from '@ptsecurity/mosaic/core';
import { McFormField, McFormFieldControl } from '@ptsecurity/mosaic/form-field';
import { McTag } from '@ptsecurity/mosaic/tag';
import { defer, fromEvent, merge, Observable, Subject, of as observableOf, Subscription } from 'rxjs';
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

/** The height of the select items in `em` units. */
export const SELECT_ITEM_HEIGHT_EM = 2;

/** Change event object that is emitted when the select value has changed. */
export class McTypeaheadChange {
    constructor(public source: McTypeahead, public value: any) {}
}

export class McTypeaheadBase {
    constructor(
        public elementRef: ElementRef,
        public defaultErrorStateMatcher: ErrorStateMatcher,
        public parentForm: NgForm,
        public parentFormGroup: FormGroupDirective,
        public ngControl: NgControl
    ) {}
}

const McTypeaheadMixinBase: CanDisableCtor & HasTabIndexCtor & CanUpdateErrorStateCtor &
    typeof McTypeaheadBase = mixinTabIndex(mixinDisabled(mixinErrorState(McTypeaheadBase)));


@Directive({ selector: 'mc-typeahead-trigger' })
export class McTypeaheadTrigger {}


@Component({
    selector: 'mc-typeahead',
    exportAs: 'mcTypeahead',
    templateUrl: 'typeahead.component.html',
    styleUrls: ['./typeahead.css'],
    inputs: ['disabled', 'tabIndex'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '[attr.id]': 'id',
        '[attr.tabindex]': 'tabIndex',
        class: 'mc-typeahead',
        '[class.mc-disabled]': 'disabled',
        '[class.mc-typeahead-invalid]': 'errorState',
        '[class.mc-typeahead-required]': 'required',
        '(keydown)': 'handleKeydown($event)',
        '(focusin)': 'onFocus()'
    },
    animations: [
        mcSelectAnimations.transformPanel,
        mcSelectAnimations.fadeInContent
    ],
    providers: [
        { provide: McFormFieldControl, useExisting: McTypeahead },
        { provide: MC_OPTION_PARENT_COMPONENT, useExisting: McTypeahead }
    ]
})
export class McTypeahead extends McTypeaheadMixinBase implements
    AfterContentInit, AfterViewInit, AfterViewChecked, OnChanges, OnDestroy, OnInit, DoCheck, ControlValueAccessor,
    CanDisable, HasTabIndex, McFormFieldControl<any>, CanUpdateErrorState {

    /** A name for this control that can be used by `mc-form-field`. */
    controlType = 'mc-typeahead';

    /** The last measured value for the trigger's client bounding rect. */
    triggerRect: ClientRect;

    /** The cached font-size of the trigger element. */
    triggerFontSize = 0;

    /** Deals with the selection logic. */
    selectionModel: SelectionModel<McOption>;

    /** Manages keyboard events for options in the panel. */
    keyManager: ActiveDescendantKeyManager<McOption>;

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

    @ViewChild('input') input: ElementRef;

    @ViewChild('panel') panel: ElementRef;

    @ViewChild(CdkConnectedOverlay) overlayDir: CdkConnectedOverlay;

    @ViewChildren(McTag) tags: QueryList<McTag>;

    /** User-supplied override of the trigger element. */
    @ContentChild(McTypeaheadTrigger) customTrigger: McTypeaheadTrigger;

    /** All of the defined select options. */
    @ContentChildren(McOption, { descendants: true }) options: QueryList<McOption>;

    /** All of the defined groups of options. */
    @ContentChildren(McOptgroup) optionGroups: QueryList<McOptgroup>;

    /** Classes to be passed to the select panel. Supports the same syntax as `ngClass`. */
    @Input() panelClass: string | string[] | Set<string> | { [key: string]: any };

    /** Object used to control when error messages are shown. */
    @Input() errorStateMatcher: ErrorStateMatcher;

    @Input() sortComparator: (a: McOption, b: McOption, options: McOption[]) => number;

    /** Combined stream of all of the child options' change events. */
    readonly optionSelectionChanges: Observable<McOptionSelectionChange> = defer(() => {
        if (this.options) {
            return merge(...this.options.map((option) => option.onSelectionChange));
        }

        return this.ngZone.onStable
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
    @Output() readonly selectionChange: EventEmitter<McTypeaheadChange> = new EventEmitter<McTypeaheadChange>();

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
    private readonly uid = `mc-typeahead-${nextUniqueId++}`;

    /** Emits whenever the component is destroyed. */
    private readonly destroy = new Subject<void>();

    private outsideClickStream: Subscription;

    private overlayAttached: boolean = false;

    constructor(
        private readonly viewportRuler: ViewportRuler,
        private readonly changeDetectorRef: ChangeDetectorRef,
        private readonly ngZone: NgZone,
        defaultErrorStateMatcher: ErrorStateMatcher,
        elementRef: ElementRef,
        @Optional() private readonly dir: Directionality,
        @Optional() parentForm: NgForm,
        @Optional() parentFormGroup: FormGroupDirective,
        @Optional() private readonly parentFormField: McFormField,
        @Self() @Optional() public ngControl: NgControl,
        @Attribute('tabindex') tabIndex: string,
        @Inject(MC_SELECT_SCROLL_STRATEGY) private readonly scrollStrategyFactory,
        @Optional() @Inject(DOCUMENT) private document: any,
        @Optional() @Host() private formField: McFormField
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

        this.outsideClickStream = this.getOutsideClickStream()
            .subscribe(() => this.close());
    }

    ngOnInit() {
        this.selectionModel = new SelectionModel<McOption>(true);
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
        console.log(this.input);

    }

    ngAfterViewChecked(): void {
        if (this.panelOpen) { this.overlayDir.overlayRef.updatePosition(); }
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

    getOutsideClickStream(): Observable<any> {
        if (!this.document) {
            return observableOf(null);
        }

        return fromEvent<MouseEvent>(this.document, 'click')
            .pipe(filter((event) => {
                const clickTarget = event.target as HTMLElement;
                const formField = this.formField ? this.formField._elementRef.nativeElement : null;

                return this.overlayAttached &&
                    clickTarget !== this.elementRef.nativeElement &&
                    (!formField || !formField.contains(clickTarget)) &&
                    (!!this.overlayDir.overlayRef && !this.overlayDir.overlayRef.overlayElement.contains(clickTarget));
            }));
    }

    /** Opens the overlay panel. */
    open(): void {
        console.log('open');
        if (this.disabled || this._panelOpen || !this.options.length) { return; }

        this.triggerRect = this.trigger.nativeElement.getBoundingClientRect();
        // Note: The computed font-size will be a string pixel value (e.g. "16px").
        // `parseInt` ignores the trailing 'px' and converts this to a number.
        this.triggerFontSize = parseInt(getComputedStyle(this.trigger.nativeElement)['font-size']);

        this._panelOpen = true;
        this.keyManager.withHorizontalOrientation(null);
        this.calculateOverlayPosition();
        this.highlightCorrectOption();
        this.changeDetectorRef.markForCheck();

        // Set the font size on the panel element once it exists.
        this.ngZone.onStable.asObservable()
            .pipe(take(1))
            .subscribe(() => {
                if (this.triggerFontSize && this.overlayDir.overlayRef && this.overlayDir.overlayRef.overlayElement) {
                    this.overlayDir.overlayRef.overlayElement.style.fontSize = `${this.triggerFontSize}px`;
                }
            });
    }

    /** Closes the overlay panel and focuses the host element. */
    close(): void {
        if (this._panelOpen) {
            this._panelOpen = false;
            this.overlayAttached = false;
            this.keyManager.withHorizontalOrientation(this.isRtl() ? 'rtl' : 'ltr');
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
        this.changeDetectorRef.markForCheck();
        this.stateChanges.next();
    }

    get selected(): McOption[] {
        return this.selectionModel.selected;
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
        return this.dir ? this.dir.value === 'rtl' : false;
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

        this.changeDetectorRef.markForCheck();
    }

    /** Focuses the select element. */
    focus(): void {
        this.input.nativeElement.focus();
    }

    onFocus() {
        console.log('onFocus');
        if (!this.disabled) {
            this._focused = true;

            this.focus();

            this.open();

            this.stateChanges.next();
        }
    }

    /**
     * Calls the touched callback only if the panel is closed. Otherwise, the trigger will
     * "blur" to the panel when it opens, causing a false positive.
     */
    onBlur() {
        console.log('onBlur');
        this._focused = false;

        if (!this.disabled && !this.panelOpen) {
            this._onTouched();
            this.changeDetectorRef.markForCheck();
            this.stateChanges.next();
        }
    }

    /**
     * Callback that is invoked when the overlay panel has been attached.
     */
    onAttached(): void {
        this.overlayAttached = true;

        this.overlayDir.positionChange
            .pipe(take(1))
            .subscribe(() => {
                console.log('onAttached');
                this.changeDetectorRef.detectChanges();
                this.calculateOverlayOffsetX();
                this.panel.nativeElement.scrollTop = this.scrollTop;
            });
    }

    /** Returns the theme to be used on the panel. */
    getPanelTheme(): string {
        return this.parentFormField ? `mc-${this.parentFormField.color}` : '';
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
        console.log('onContainerClick');
        this.focus();
        // this.open();
    }

    /** Invoked when an option is clicked. */
    onRemoveMatcherItem(option: McOption, $event): void {
        $event.stopPropagation();

        option.deselect();
    }

    /** Handles keyboard events while the select is closed. */
    private handleClosedKeydown(event: KeyboardEvent): void {
        /* tslint:disable-next-line */
        const keyCode = event.keyCode;
        const isArrowKey = keyCode === DOWN_ARROW || keyCode === UP_ARROW ||
            keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW;
        const isOpenKey = keyCode === ENTER || keyCode === SPACE;

        // Open the select on ALT + arrow key to match the native <select>
        if (isOpenKey || (event.altKey && isArrowKey)) {
            event.preventDefault();

            this.open();
        }
    }

    /** Handles keyboard events when the selected is open. */
    private handleOpenKeydown(event: KeyboardEvent): void {
        /* tslint:disable-next-line */
        const keyCode = event.keyCode;
        const isArrowKey = keyCode === DOWN_ARROW || keyCode === UP_ARROW;
        const manager = this.keyManager;

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

            manager.activeItem.selectViaInteraction();
        } else {
            const previouslyFocusedIndex = manager.activeItemIndex;

            manager.onKeydown(event);

            if (isArrowKey && event.shiftKey && manager.activeItem &&
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
        if (value) {
            if (!Array.isArray(value)) {
                throw getMcSelectNonArrayValueError();
            }

            this.selectionModel.clear();
            value.forEach((currentValue: any) => this.selectValue(currentValue));
            this.sortValues();
        }

        this.changeDetectorRef.markForCheck();
    }

    /**
     * Finds and selects and option based on its value.
     * @returns Option that has the corresponding value.
     */
    private selectValue(value: any): McOption | undefined {
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
            this.selectionModel.select(correspondingOption);
        }

        return correspondingOption;
    }

    /** Sets up a key manager to listen to keyboard events on the overlay panel. */
    private initKeyManager() {
        this.keyManager = new ActiveDescendantKeyManager<McOption>(this.options)
            .withTypeAhead()
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
                } else if (!this._panelOpen && this.keyManager.activeItem) {
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
                console.log('optionSelectionChanges');
                this.onSelect(event.source, event.isUserInput);

                if (event.isUserInput && this.panelOpen) {
                    // this.focus();
                }
            });

        // Listen to changes in the internal state of the options and react accordingly.
        // Handles cases like the labels of the selected options changing.
        merge(...this.options.map((option) => option.stateChanges))
            .pipe(takeUntil(changedOrDestroyed))
            .subscribe(() => {
                this.changeDetectorRef.markForCheck();
                this.stateChanges.next();
            });

        this.setOptionIds();
    }

    /** Invoked when an option is clicked. */
    private onSelect(option: McOption, isUserInput: boolean): void {
        const wasSelected = this.selectionModel.isSelected(option);

        if (option.value == null) {
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

            this.sortValues();

            if (isUserInput) {
                // In case the user selected the option with their mouse, we
                // want to restore focus back to the trigger, in order to
                // prevent the select keyboard controls from clashing with
                // the ones from `mc-option`.
                this.focus();
            }
        }

        if (wasSelected !== this.selectionModel.isSelected(option)) {
            this.propagateChanges();
        }

        this.stateChanges.next();
    }

    private sortValues() {
        const options = this.options.toArray();

        this.selectionModel.sort((a, b) => {
            return this.sortComparator ? this.sortComparator(a, b, options) :
                options.indexOf(a) - options.indexOf(b);
        });
        this.stateChanges.next();
    }

    private propagateChanges(fallbackValue?: any): void {
        let valueToEmit: any = null;

        valueToEmit = (this.selected as McOption[]).map((option) => option.value);

        this._value = valueToEmit;
        this.valueChange.emit(valueToEmit);
        this._onChange(valueToEmit);
        this.selectionChange.emit(new McTypeaheadChange(this, valueToEmit));
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
    private highlightCorrectOption(): void {
        if (this.keyManager) {
            this.keyManager.setFirstItemActive();
        }
    }

    /** Scrolls the active option into view. */
    private scrollActiveOptionIntoView(): void {
        const activeOptionIndex = this.keyManager.activeItemIndex || 0;
        const labelCount = countGroupLabelsBeforeOption(activeOptionIndex, this.options, this.optionGroups);

        this.panel.nativeElement.scrollTop = getOptionScrollPosition(
            activeOptionIndex + labelCount,
            this.getItemHeight(),
            this.panel.nativeElement.scrollTop,
            SELECT_PANEL_MAX_HEIGHT
        );
    }

    /** Gets the index of the provided option in the option list. */
    private getOptionIndex(option: McOption): number | undefined {
        /* tslint:disable-next-line */
        return this.options.reduce((result: number, current: McOption, index: number) => {
            /* tslint:disable-next-line:strict-type-predicates */
            return result === undefined ? (option === current ? index : undefined) : result;
        }, undefined);
    }

    /** Calculates the scroll position and x- and y-offsets of the overlay panel. */
    private calculateOverlayPosition(): void {
        const itemHeight = this.getItemHeight();
        const items = this.getItemCount();
        const panelHeight = Math.min(items * itemHeight, SELECT_PANEL_MAX_HEIGHT);
        const scrollContainerHeight = items * itemHeight;

        // The farthest the panel can be scrolled before it hits the bottom
        const maxScroll = scrollContainerHeight - panelHeight;

        // If no value is selected we open the popup to the first item.
        let selectedOptionOffset =
            this.empty ? 0 : this.getOptionIndex(this.selectionModel.selected[0])!;

        selectedOptionOffset += countGroupLabelsBeforeOption(selectedOptionOffset, this.options, this.optionGroups);

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
    private calculateOverlayOffsetX(): void {
        const overlayRect = this.overlayDir.overlayRef.overlayElement.getBoundingClientRect();
        const viewportSize = this.viewportRuler.getViewportSize();
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
    private checkOverlayWithinViewport(maxScroll: number): void {
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
        return this.options.length + this.optionGroups.length;
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
