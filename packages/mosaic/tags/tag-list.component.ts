import { Directionality } from '@angular/cdk/bidi';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { SelectionModel } from '@angular/cdk/collections';
import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    DoCheck,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Optional,
    Output,
    QueryList,
    Self,
    ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import { FocusKeyManager } from '@ptsecurity/cdk/a11y';
import { BACKSPACE, END, HOME } from '@ptsecurity/cdk/keycodes';
import {
    CanUpdateErrorState,
    CanUpdateErrorStateCtor,
    ErrorStateMatcher,
    mixinErrorState
} from '@ptsecurity/mosaic/core';
import { McFormFieldControl } from '@ptsecurity/mosaic/form-field';
import { merge, Observable, Subject, Subscription } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';

import { McTagTextControl } from './tag-text-control';
import { McTag, McTagEvent, McTagSelectionChange } from './tag.component';


export class McTagListBase {
    constructor(
        public defaultErrorStateMatcher: ErrorStateMatcher,
        public parentForm: NgForm,
        public parentFormGroup: FormGroupDirective,
        public ngControl: NgControl
    ) {
    }
}

// tslint:disable-next-line:naming-convention
export const McTagListMixinBase: CanUpdateErrorStateCtor & typeof McTagListBase = mixinErrorState(McTagListBase);


// Increasing integer for generating unique ids for tag-list components.
let nextUniqueId = 0;

/** Change event object that is emitted when the tag list value has changed. */
export class McTagListChange {
    constructor(public source: McTagList, public value: any) {}
}


@Component({
    selector: 'mc-tag-list',
    exportAs: 'mcTagList',
    template: '<ng-content></ng-content>',
    host: {
        class: 'mc-tag-list',
        '[attr.tabindex]': 'disabled ? null : _tabIndex',
        '[class.mc-disabled]': 'disabled',
        '[class.mc-invalid]': 'errorState',
        '[class.mc-required]': 'required',
        '(focus)': 'focus()',
        '(blur)': 'blur()',
        '(keydown)': 'keydown($event)',
        '[id]': 'uid'
    },
    providers: [{ provide: McFormFieldControl, useExisting: McTagList }],
    styleUrls: ['tag-list.css'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class McTagList extends McTagListMixinBase implements McFormFieldControl<any>,
    ControlValueAccessor, AfterContentInit, DoCheck, OnInit, OnDestroy, CanUpdateErrorState {

    readonly controlType: string = 'mc-tag-list';

    /** Combined stream of all of the child tags' selection change events. */
    get tagSelectionChanges(): Observable<McTagSelectionChange> {
        return merge(...this.tags.map((tag) => tag.selectionChange));
    }

    /** Combined stream of all of the child tags' focus change events. */
    get tagFocusChanges(): Observable<McTagEvent> {
        return merge(...this.tags.map((tag) => tag.onFocus));
    }

    /** Combined stream of all of the child tags' blur change events. */
    get tagBlurChanges(): Observable<McTagEvent> {
        return merge(...this.tags.map((tag) => tag.onBlur));
    }

    /** Combined stream of all of the child tags' remove change events. */
    get tagRemoveChanges(): Observable<McTagEvent> {
        return merge(...this.tags.map((tag) => tag.destroyed));
    }

    /** The array of selected tags inside tag list. */
    get selected(): McTag[] | McTag {
        return this.multiple ? this.selectionModel.selected : this.selectionModel.selected[0];
    }

    /** Whether the user should be allowed to select multiple tags. */
    @Input()
    get multiple(): boolean {
        return this._multiple;
    }

    set multiple(value: boolean) {
        this._multiple = coerceBooleanProperty(value);
    }

    /**
     * A function to compare the option values with the selected values. The first argument
     * is a value from an option. The second is a value from the selection. A boolean
     * should be returned.
     */
    @Input()
    get compareWith(): (o1: any, o2: any) => boolean {
        return this._compareWith;
    }

    set compareWith(fn: (o1: any, o2: any) => boolean) {
        this._compareWith = fn;

        if (this.selectionModel) {
            // A different comparator means the selection could change.
            this.initializeSelection();
        }
    }

    /**
     * Implemented as part of McFormFieldControl.
     * @docs-private
     */
    @Input()
    get value(): any {
        return this._value;
    }

    set value(value: any) {
        this.writeValue(value);
        this._value = value;
    }

    /**
     * Implemented as part of McFormFieldControl.
     * @docs-private
     */
    get id(): string {
        return this.tagInput ? this.tagInput.id : this.uid;
    }

    /**
     * Implemented as part of McFormFieldControl.
     * @docs-private
     */
    @Input()
    get required(): boolean {
        return this._required;
    }

    set required(value: boolean) {
        this._required = coerceBooleanProperty(value);
        this.stateChanges.next();
    }

    /**
     * Implemented as part of McFormFieldControl.
     * @docs-private
     */
    @Input()
    get placeholder(): string {
        return this.tagInput ? this.tagInput.placeholder : this._placeholder;
    }

    set placeholder(value: string) {
        this._placeholder = value;
        this.stateChanges.next();
    }

    /** Whether any tags or the mcTagInput inside of this tag-list has focus. */
    get focused(): boolean {
        return (this.tagInput && this.tagInput.focused) || this.hasFocusedTag();
    }

    /**
     * Implemented as part of McFormFieldControl.
     * @docs-private
     */
    get empty(): boolean {
        return (!this.tagInput || this.tagInput.empty) && this.tags.length === 0;
    }

    /**
     * Implemented as part of McFormFieldControl.
     * @docs-private
     */
    get shouldLabelFloat(): boolean {
        return !this.empty || this.focused;
    }

    /**
     * Implemented as part of McFormFieldControl.
     * @docs-private
     */
    @Input()
    get disabled(): boolean {
        return this.ngControl ? !!this.ngControl.disabled : this._disabled;
    }

    set disabled(value: boolean) {
        this._disabled = coerceBooleanProperty(value);
        this.syncTagsDisabledState();
    }

    /**
     * Whether or not this tag list is selectable. When a tag list is not selectable,
     * the selected states for all the tags inside the tag list are always ignored.
     */
    @Input()
    get selectable(): boolean {
        return this._selectable;
    }

    set selectable(value: boolean) {
        this._selectable = coerceBooleanProperty(value);

        if (this.tags) {
            this.tags.forEach((tag) => tag.tagListSelectable = this._selectable);
        }
    }

    @Input()
    set tabIndex(value: number) {
        this.userTabIndex = value;
        this._tabIndex = value;
    }

    /**
     * Event that emits whenever the raw value of the tag-list changes. This is here primarily
     * to facilitate the two-way binding for the `value` input.
     * @docs-private
     */
    @Output() readonly valueChange: EventEmitter<any> = new EventEmitter<any>();

    uid: string = `mc-tag-list-${nextUniqueId++}`;

    /**
     * User defined tab index.
     * When it is not null, use user defined tab index. Otherwise use tabIndex
     */
    userTabIndex: number | null = null;

    keyManager: FocusKeyManager<McTag>;

    selectionModel: SelectionModel<McTag>;

    tagChanges = new EventEmitter<any>();

    /** An object used to control when error messages are shown. */
    @Input() errorStateMatcher: ErrorStateMatcher;

    /** Orientation of the tag list. */
    @Input('orientation') orientation: 'horizontal' | 'vertical' = 'horizontal';

    /** Event emitted when the selected tag list value has been changed by the user. */
    @Output() readonly change: EventEmitter<McTagListChange> = new EventEmitter<McTagListChange>();

    /** The tag components contained within this tag list. */
    @ContentChildren(McTag, {
        // Need to use `descendants: true`,
        // Ivy will no longer match indirect descendants if it's left as false.
        descendants: true
    }) tags: QueryList<McTag>;

    // tslint:disable-next-line: naming-convention orthodox-getter-and-setter
    _tabIndex = 0;

    private _value: any;

    private _required: boolean = false;

    private _placeholder: string;

    private _disabled: boolean = false;

    private _selectable: boolean = true;

    /** The tag input to add more tags */
    private tagInput: McTagTextControl;

    private _multiple: boolean = false;

    /**
     * When a tag is destroyed, we store the index of the destroyed tag until the tags
     * query list notifies about the update. This is necessary because we cannot determine an
     * appropriate tag that should receive focus until the array of tags updated completely.
     */
    private lastDestroyedTagIndex: number | null = null;

    /** Subject that emits when the component has been destroyed. */
    private destroyed = new Subject<void>();

    /** Subscription to focus changes in the tags. */
    private tagFocusSubscription: Subscription | null;

    /** Subscription to blur changes in the tags. */
    private tagBlurSubscription: Subscription | null;

    /** Subscription to selection changes in tags. */
    private tagSelectionSubscription: Subscription | null;

    /** Subscription to remove changes in tags. */
    private tagRemoveSubscription: Subscription | null;

    constructor(
        protected elementRef: ElementRef<HTMLElement>,
        private changeDetectorRef: ChangeDetectorRef,
        defaultErrorStateMatcher: ErrorStateMatcher,
        @Optional() private dir: Directionality,
        @Optional() parentForm: NgForm,
        @Optional() parentFormGroup: FormGroupDirective,
        @Optional() @Self() public ngControl: NgControl
    ) {
        super(defaultErrorStateMatcher, parentForm, parentFormGroup, ngControl);

        if (this.ngControl) {
            this.ngControl.valueAccessor = this;
        }
    }

    ngAfterContentInit() {
        this.keyManager = new FocusKeyManager<McTag>(this.tags)
            .withVerticalOrientation()
            .withHorizontalOrientation(this.dir ? this.dir.value : 'ltr');

        if (this.dir) {
            this.dir.change
                .pipe(takeUntil(this.destroyed))
                .subscribe((dir) => this.keyManager.withHorizontalOrientation(dir));
        }

        // Prevents the tag list from capturing focus and redirecting
        // it back to the first tag when the user tabs out.
        this.keyManager.tabOut
            .pipe(takeUntil(this.destroyed))
            .subscribe(() => {
                this._tabIndex = -1;

                setTimeout(() => {
                    this._tabIndex = this.userTabIndex || 0;
                    this.changeDetectorRef.markForCheck();
                });
            });

        // When the list changes, re-subscribe
        this.tags.changes
            .pipe(startWith(null), takeUntil(this.destroyed))
            .subscribe(() => {
                if (this.disabled) {
                    // Since this happens after the content has been
                    // checked, we need to defer it to the next tick.
                    Promise.resolve().then(() => { this.syncTagsDisabledState(); });
                }

                this.resetTags();

                // Reset tags selected/deselected status
                this.initializeSelection();

                // Check to see if we need to update our tab index
                this.updateTabIndex();

                // Check to see if we have a destroyed tag and need to refocus
                this.updateFocusForDestroyedTags();

                // Defer setting the value in order to avoid the "Expression
                // has changed after it was checked" errors from Angular.
                Promise.resolve().then(() => { this.tagChanges.emit(this.tags.toArray()); });

                this.stateChanges.next();
            });
    }

    ngOnInit() {
        this.selectionModel = new SelectionModel<McTag>(this.multiple, undefined, false);
        this.stateChanges.next();
    }

    ngDoCheck() {
        if (this.ngControl) {
            // We need to re-evaluate this on every change detection cycle, because there are some
            // error triggers that we can't subscribe to (e.g. parent form submissions). This means
            // that whatever logic is in here has to be super lean or we risk destroying the performance.
            this.updateErrorState();
        }
    }

    ngOnDestroy() {
        this.destroyed.next();
        this.destroyed.complete();
        this.stateChanges.complete();

        this.dropSubscriptions();
    }

    // tslint:disable-next-line:no-empty
    onTouched = () => {};

    // tslint:disable-next-line:no-empty
    onChange: (value: any) => void = () => {};

    /** Associates an HTML input element with this tag list. */
    registerInput(inputElement: McTagTextControl): void {
        this.tagInput = inputElement;
    }

    // Implemented as part of ControlValueAccessor.
    writeValue(value: any): void {
        if (this.tags) {
            this.setSelectionByValue(value, false);
        }
    }

    // Implemented as part of ControlValueAccessor.
    registerOnChange(fn: (value: any) => void): void {
        this.onChange = fn;
    }

    // Implemented as part of ControlValueAccessor.
    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    // Implemented as part of ControlValueAccessor.
    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
        this.stateChanges.next();
    }

    /**
     * Implemented as part of McFormFieldControl.
     * @docs-private
     */
    onContainerClick(event: MouseEvent) {
        if (!this.originatesFromTag(event)) {
            this.focus();
        }
    }

    /**
     * Focuses the first non-disabled tag in this tag list, or the associated input when there
     * are no eligible tags.
     */
    focus(): void {
        if (this.disabled) { return; }

        // TODO: ARIA says this should focus the first `selected` tag if any are selected.
        // Focus on first element if there's no tagInput inside tag-list
        if (this.tagInput && this.tagInput.focused) {
            // do nothing
        } else if (this.tags.length > 0) {
            this.keyManager.setFirstItemActive();
            this.stateChanges.next();
        } else {
            this.focusInput();
            this.stateChanges.next();
        }
    }

    /** Attempt to focus an input if we have one. */
    focusInput() {
        if (this.tagInput) {
            this.tagInput.focus();
        }
    }

    /**
     * Pass events to the keyboard manager. Available here for tests.
     */
    keydown(event: KeyboardEvent) {
        const target = event.target as HTMLElement;

        // If they are on an empty input and hit backspace, focus the last tag
        // tslint:disable-next-line: deprecation
        if (event.keyCode === BACKSPACE && this.isInputEmpty(target)) {
            this.keyManager.setLastItemActive();
            event.preventDefault();
        } else if (target && target.classList.contains('mc-tag')) {
            // tslint:disable-next-line: deprecation
            if (event.keyCode === HOME) {
                this.keyManager.setFirstItemActive();
                event.preventDefault();
            // tslint:disable-next-line: deprecation
            } else if (event.keyCode === END) {
                this.keyManager.setLastItemActive();
                event.preventDefault();
            } else {
                this.keyManager.onKeydown(event);
            }

            this.stateChanges.next();
        }
    }

    setSelectionByValue(value: any, isUserInput: boolean = true) {
        this.clearSelection();
        this.tags.forEach((tag) => tag.deselect());

        if (Array.isArray(value)) {
            value.forEach((currentValue) => this.selectValue(currentValue, isUserInput));
            this.sortValues();
        } else {
            const correspondingTag = this.selectValue(value, isUserInput);

            // Shift focus to the active item. Note that we shouldn't do this in multiple
            // mode, because we don't know what tag the user interacted with last.
            if (correspondingTag && isUserInput) {
                this.keyManager.setActiveItem(correspondingTag);
            }
        }
    }

    /** When blurred, mark the field as touched when focus moved outside the tag list. */
    blur() {
        if (!this.hasFocusedTag()) {
            this.keyManager.setActiveItem(-1);
        }

        if (!this.disabled) {
            if (this.tagInput) {
                // If there's a tag input, we should check whether the focus moved to tag input.
                // If the focus is not moved to tag input, mark the field as touched. If the focus moved
                // to tag input, do nothing.
                // Timeout is needed to wait for the focus() event trigger on tag input.
                setTimeout(() => {
                    if (!this.focused) {
                        this.markAsTouched();
                    }
                });
            } else {
                // If there's no tag input, then mark the field as touched.
                this.markAsTouched();
            }
        }
    }

    /** Mark the field as touched */
    markAsTouched() {
        this.onTouched();
        this.changeDetectorRef.markForCheck();
        this.stateChanges.next();
    }

    /**
     * Check the tab index as you should not be allowed to focus an empty list.
     */
    protected updateTabIndex(): void {
        // If we have 0 tags, we should not allow keyboard focus
        this._tabIndex = this.userTabIndex || (this.tags.length === 0 ? -1 : 0);
    }

    /**
     * If the amount of tags changed, we need to update the
     * key manager state and focus the next closest tag.
     */
    protected updateFocusForDestroyedTags() {
        if (this.lastDestroyedTagIndex != null) {
            if (this.tags.length) {
                const newTagIndex = Math.min(this.lastDestroyedTagIndex, this.tags.length - 1);
                this.keyManager.setActiveItem(newTagIndex);
            } else {
                this.focusInput();
            }
        }

        this.lastDestroyedTagIndex = null;
    }

    private _compareWith = (o1: any, o2: any) => o1 === o2;

    /**
     * Utility to ensure all indexes are valid.
     *
     * @param index The index to be checked.
     * @returns True if the index is valid for our list of tags.
     */
    private isValidIndex(index: number): boolean {
        return index >= 0 && index < this.tags.length;
    }

    private isInputEmpty(element: HTMLElement): boolean {
        if (element && element.nodeName.toLowerCase() === 'input') {
            const input = element as HTMLInputElement;

            return !input.value;
        }

        return false;
    }

    /**
     * Finds and selects the tag based on its value.
     * @returns Tag that has the corresponding value.
     */
    private selectValue(value: any, isUserInput: boolean = true): McTag | undefined {

        const correspondingTag = this.tags.find((tag) => {
            return tag.value != null && this._compareWith(tag.value, value);
        });

        if (correspondingTag) {
            if (isUserInput) {
                correspondingTag.selectViaInteraction();
            } else {
                correspondingTag.select();
            }

            this.selectionModel.select(correspondingTag);
        }

        return correspondingTag;
    }

    private initializeSelection(): void {
        // Defer setting the value in order to avoid the "Expression
        // has changed after it was checked" errors from Angular.
        Promise.resolve().then(() => {
            if (this.ngControl || this._value) {
                this.setSelectionByValue(this.ngControl ? this.ngControl.value : this._value, false);
                this.stateChanges.next();
            }
        });
    }

    /**
     * Deselects every tag in the list.
     * @param skip Tag that should not be deselected.
     */
    private clearSelection(skip?: McTag): void {
        this.selectionModel.clear();
        this.tags.forEach((tag) => {
            if (tag !== skip) {
                tag.deselect();
            }
        });
        this.stateChanges.next();
    }

    /**
     * Sorts the model values, ensuring that they keep the same
     * order that they have in the panel.
     */
    private sortValues(): void {
        if (this._multiple) {
            this.selectionModel.clear();

            this.tags.forEach((tag) => {
                if (tag.selected) {
                    this.selectionModel.select(tag);
                }
            });
            this.stateChanges.next();
        }
    }

    /** Emits change event to set the model value. */
    private propagateChanges(fallbackValue?: any): void {
        let valueToEmit: any = null;

        if (Array.isArray(this.selected)) {
            valueToEmit = this.selected.map((tag) => tag.value);
        } else {
            valueToEmit = this.selected ? this.selected.value : fallbackValue;
        }
        this._value = valueToEmit;
        this.change.emit(new McTagListChange(this, valueToEmit));
        this.valueChange.emit(valueToEmit);
        this.onChange(valueToEmit);
        this.changeDetectorRef.markForCheck();
    }

    private resetTags() {
        this.dropSubscriptions();
        this.listenToTagsFocus();
        this.listenToTagsSelection();
        this.listenToTagsRemoved();
    }

    private dropSubscriptions() {
        if (this.tagFocusSubscription) {
            this.tagFocusSubscription.unsubscribe();
            this.tagFocusSubscription = null;
        }

        if (this.tagBlurSubscription) {
            this.tagBlurSubscription.unsubscribe();
            this.tagBlurSubscription = null;
        }

        if (this.tagSelectionSubscription) {
            this.tagSelectionSubscription.unsubscribe();
            this.tagSelectionSubscription = null;
        }

        if (this.tagRemoveSubscription) {
            this.tagRemoveSubscription.unsubscribe();
            this.tagRemoveSubscription = null;
        }
    }

    /** Listens to user-generated selection events on each tag. */
    private listenToTagsSelection(): void {
        this.tagSelectionSubscription = this.tagSelectionChanges.subscribe((event) => {
            if (event.source.selected) {
                this.selectionModel.select(event.source);
            } else {
                this.selectionModel.deselect(event.source);
            }

            // For single selection tag list, make sure the deselected value is unselected.
            if (!this.multiple) {
                this.tags.forEach((tag) => {
                    if (!this.selectionModel.isSelected(tag) && tag.selected) {
                        tag.deselect();
                    }
                });
            }

            if (event.isUserInput) {
                this.propagateChanges();
            }
        });
    }

    /** Listens to user-generated selection events on each tag. */
    private listenToTagsFocus(): void {
        this.tagFocusSubscription = this.tagFocusChanges.subscribe((event) => {
            const tagIndex: number = this.tags.toArray().indexOf(event.tag);

            if (this.isValidIndex(tagIndex)) {
                this.keyManager.updateActiveItem(tagIndex);
            }
            this.stateChanges.next();
        });

        this.tagBlurSubscription = this.tagBlurChanges.subscribe(() => {
            this.blur();
            this.stateChanges.next();
        });
    }

    private listenToTagsRemoved(): void {
        this.tagRemoveSubscription = this.tagRemoveChanges.subscribe((event) => {
            const tag = event.tag;
            const tagIndex = this.tags.toArray().indexOf(event.tag);

            // In case the tag that will be removed is currently focused, we temporarily store
            // the index in order to be able to determine an appropriate sibling tag that will
            // receive focus.
            if (this.isValidIndex(tagIndex) && tag.hasFocus) {
                this.lastDestroyedTagIndex = tagIndex;
            }
        });
    }

    /** Checks whether an event comes from inside a tag element. */
    private originatesFromTag(event: Event): boolean {
        let currentElement = event.target as HTMLElement | null;

        while (currentElement && currentElement !== this.elementRef.nativeElement) {
            if (currentElement.classList.contains('mc-tag')) {
                return true;
            }

            currentElement = currentElement.parentElement;
        }

        return false;
    }

    /** Checks whether any of the tags is focused. */
    private hasFocusedTag() {
        return this.tags.some((tag) => tag.hasFocus);
    }

    /** Syncs the list's disabled state with the individual tags. */
    private syncTagsDisabledState() {
        if (this.tags) {
            this.tags.forEach((tag) => {
                tag.disabled = this._disabled;
            });
        }
    }
}

