import {
    AfterViewChecked,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Inject,
    InjectionToken,
    Input,
    OnDestroy,
    Optional,
    Output,
    QueryList,
    ViewEncapsulation
} from '@angular/core';
import { coerceBooleanProperty } from '@ptsecurity/cdk/coercion';
import { ENTER, SPACE } from '@ptsecurity/cdk/keycodes';
import { Subject } from 'rxjs';

import { McOptgroup } from './optgroup';


/**
 * Option IDs need to be unique across components, so this counter exists outside of
 * the component definition.
 */
let _uniqueIdCounter = 0;

/** Event object emitted by McOption when selected or deselected. */
export class McOptionSelectionChange {
    constructor(
        /** Reference to the option that emitted the event. */
        public source: McOption,
        /** Whether the change in the option's value was a result of a user action. */
        public isUserInput = false) {
    }
}

/**
 * Describes a parent component that manages a list of options.
 * Contains properties that the options can inherit.
 * @docs-private
 */
export interface IMcOptionParentComponent {
    disableRipple?: boolean;
    multiple?: boolean;
}

/**
 * Injection token used to provide the parent component to options.
 */
export const MC_OPTION_PARENT_COMPONENT =
    new InjectionToken<IMcOptionParentComponent>('MC_OPTION_PARENT_COMPONENT');

/**
 * Single option inside of a `<mat-select>` element.
 */
@Component({
    selector: 'mc-option',
    exportAs: 'mcOption',
    host: {
        '[attr.tabindex]': '_getTabIndex()',
        '[class.mc-selected]': 'selected',
        '[class.mc-option-multiple]': 'multiple',
        '[class.mc-active]': 'active',
        '[id]': 'id',
        '[class.mc-disabled]': 'disabled',
        '(click)': '_selectViaInteraction()',
        '(keydown)': '_handleKeydown($event)',
        class: 'mc-option'
    },
    styleUrls: ['option.css'],
    templateUrl: 'option.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class McOption implements AfterViewChecked, OnDestroy {
    /** Whether the wrapping component is in multiple selection mode. */
    get multiple() {
        return this._parent && this._parent.multiple;
    }

    /** The unique ID of the option. */
    get id(): string {
        return this._id;
    }

    /** Whether or not the option is currently selected. */
    get selected(): boolean {
        return this._selected;
    }

    /** The form value of the option. */
    @Input() value: any;

    /** Whether the option is disabled. */
    @Input()
    get disabled() {
        return (this.group && this.group.disabled) || this._disabled;
    }

    set disabled(value: any) {
        this._disabled = coerceBooleanProperty(value);
    }

    /** Whether ripples for the option are disabled. */
    get disableRipple() {
        return this._parent && this._parent.disableRipple;
    }

    /** Event emitted when the option is selected or deselected. */
        // tslint:disable-next-line:no-output-on-prefix
    @Output() readonly onSelectionChange = new EventEmitter<McOptionSelectionChange>();

    /** Emits when the state of the option changes and any parents have to be notified. */
    readonly _stateChanges = new Subject<void>();

    private _selected = false;
    private _active = false;
    private _disabled = false;
    private readonly _id = `mc-option-${_uniqueIdCounter++}`;
    private _mostRecentViewValue = '';

    constructor(
        private readonly _element: ElementRef,
        private readonly _changeDetectorRef: ChangeDetectorRef,
        @Optional() @Inject(MC_OPTION_PARENT_COMPONENT) private readonly _parent: IMcOptionParentComponent,
        @Optional() readonly group: McOptgroup) {
    }

    /**
     * Whether or not the option is currently active and ready to be selected.
     * An active option displays styles as if it is focused, but the
     * focus is actually retained somewhere else. This comes in handy
     * for components like autocomplete where focus must remain on the input.
     */
    get active(): boolean {
        return this._active;
    }

    /**
     * The displayed value of the option. It is necessary to show the selected option in the
     * select's trigger.
     */
    get viewValue(): string {
        // TODO(kara): Add input property alternative for node envs.
        return (this._getHostElement().textContent || '').trim();
    }

    /** Selects the option. */
    select(): void {
        if (!this._selected) {
            this._selected = true;
            this._changeDetectorRef.markForCheck();
            this._emitSelectionChangeEvent();
        }
    }

    /** Deselects the option. */
    deselect(): void {
        if (this._selected) {
            this._selected = false;
            this._changeDetectorRef.markForCheck();
            this._emitSelectionChangeEvent();
        }
    }

    /** Sets focus onto this option. */
    focus(): void {
        const element = this._getHostElement();

        if (typeof element.focus === 'function') {
            element.focus();
        }
    }

    /**
     * This method sets display styles on the option to make it appear
     * active. This is used by the ActiveDescendantKeyManager so key
     * events will display the proper options as active on arrow key events.
     */
    setActiveStyles(): void {
        if (!this._active) {
            this._active = true;
            this._changeDetectorRef.markForCheck();
        }
    }

    /**
     * This method removes display styles on the option that made it appear
     * active. This is used by the ActiveDescendantKeyManager so key
     * events will display the proper options as active on arrow key events.
     */
    setInactiveStyles(): void {
        if (this._active) {
            this._active = false;
            this._changeDetectorRef.markForCheck();
        }
    }

    /** Gets the label to be used when determining whether the option should be focused. */
    getLabel(): string {
        return this.viewValue;
    }

    /** Ensures the option is selected when activated from the keyboard. */
    _handleKeydown(event: KeyboardEvent): void {
        // tslint:disable-next-line
        if (event.keyCode === ENTER || event.keyCode === SPACE) {
            this._selectViaInteraction();

            // Prevent the page from scrolling down and form submits.
            event.preventDefault();
        }
    }

    /**
     * `Selects the option while indicating the selection came from the user. Used to
     * determine if the select's view -> model callback should be invoked.`
     */
    _selectViaInteraction(): void {
        if (!this.disabled) {
            this._selected = this.multiple ? !this._selected : true;
            this._changeDetectorRef.markForCheck();
            this._emitSelectionChangeEvent(true);
        }
    }

    /** Returns the correct tabindex for the option depending on disabled state. */
    _getTabIndex(): string {
        return this.disabled ? '-1' : '0';
    }

    /** Gets the host DOM element. */
    _getHostElement(): HTMLElement {
        return this._element.nativeElement;
    }

    ngAfterViewChecked() {
        // Since parent components could be using the option's label to display the selected values
        // (e.g. `mat-select`) and they don't have a way of knowing if the option's label has changed
        // we have to check for changes in the DOM ourselves and dispatch an event. These checks are
        // relatively cheap, however we still limit them only to selected options in order to avoid
        // hitting the DOM too often.
        if (this._selected) {
            const viewValue = this.viewValue;

            if (viewValue !== this._mostRecentViewValue) {
                this._mostRecentViewValue = viewValue;
                this._stateChanges.next();
            }
        }
    }

    ngOnDestroy() {
        this._stateChanges.complete();
    }

    /** Emits the selection change event. */
    private _emitSelectionChangeEvent(isUserInput = false): void {
        this.onSelectionChange.emit(new McOptionSelectionChange(this, isUserInput));
    }
}

/**
 * Counts the amount of option group labels that precede the specified option.
 * @param optionIndex Index of the option at which to start counting.
 * @param options Flat list of all of the options.
 * @param optionGroups Flat list of all of the option groups.
 * @docs-private
 */
export function _countGroupLabelsBeforeOption(
    optionIndex: number, options: QueryList<McOption>,
    optionGroups: QueryList<McOptgroup>
): number {

    if (optionGroups.length) {
        const optionsArray = options.toArray();
        const groups = optionGroups.toArray();

        let groupCounter = 0;

        for (let i = 0; i < optionIndex + 1; i++) {
            if (optionsArray[i].group && optionsArray[i].group === groups[groupCounter]) {
                groupCounter++;
            }
        }

        return groupCounter;
    }

    return 0;
}

/**
 * Determines the position to which to scroll a panel in order for an option to be into view.
 * @param optionIndex Index of the option to be scrolled into the view.
 * @param optionHeight Height of the options.
 * @param currentScrollPosition Current scroll position of the panel.
 * @param panelHeight Height of the panel.
 * @docs-private
 */
export function _getOptionScrollPosition(
    optionIndex: number,
    optionHeight: number,
    currentScrollPosition: number,
    panelHeight: number
): number {
    const optionOffset = optionIndex * optionHeight;

    if (optionOffset < currentScrollPosition) { return optionOffset; }

    if (optionOffset + optionHeight > currentScrollPosition + panelHeight) {
        return Math.max(0, optionOffset - panelHeight + optionHeight);
    }

    return currentScrollPosition;
}

