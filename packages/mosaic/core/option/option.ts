import { coerceBooleanProperty } from '@angular/cdk/coercion';
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
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { ENTER, SPACE } from '@ptsecurity/cdk/keycodes';
import { Subject } from 'rxjs';

import { McOptgroup } from './optgroup';


/**
 * Option IDs need to be unique across components, so this counter exists outside of
 * the component definition.
 */
let uniqueIdCounter = 0;

/** Event object emitted by McOption when selected or deselected. */
export class McOptionSelectionChange {
    constructor(public source: McOption, public isUserInput = false) {}
}

/**
 * Describes a parent component that manages a list of options.
 * Contains properties that the options can inherit.
 * @docs-private
 */
// tslint:disable-next-line: naming-convention
export interface McOptionParentComponent {
    multiple?: boolean;
}

/**
 * Injection token used to provide the parent component to options.
 */
export const MC_OPTION_PARENT_COMPONENT =
    new InjectionToken<McOptionParentComponent>('MC_OPTION_PARENT_COMPONENT');

/**
 * Single option inside of a `<mc-select>` element.
 */
@Component({
    selector: 'mc-option',
    exportAs: 'mcOption',
    host: {
        '[attr.tabindex]': 'getTabIndex()',
        class: 'mc-option',
        '[class.mc-selected]': 'selected',
        '[class.mc-option-multiple]': 'multiple',
        '[class.mc-active]': 'active',
        '[class.mc-disabled]': 'disabled',
        '[id]': 'id',

        '(click)': 'selectViaInteraction()',
        '(keydown)': 'handleKeydown($event)'
    },
    styleUrls: ['option.scss'],
    templateUrl: 'option.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class McOption implements AfterViewChecked, OnDestroy {
    @ViewChild('mcTextElement', { static: false }) textElement: ElementRef;

    /** The form value of the option. */
    @Input() value: any;

    @Input()
    get showCheckbox() {
        return this._showCheckbox === undefined ? this.multiple : this._showCheckbox;
    }

    set showCheckbox(value) {
        this._showCheckbox = coerceBooleanProperty(value);
    }

    private _showCheckbox: boolean;

    /** Event emitted when the option is selected or deselected. */
    // tslint:disable-next-line:no-output-on-prefix
    @Output() readonly onSelectionChange = new EventEmitter<McOptionSelectionChange>();

    /** Emits when the state of the option changes and any parents have to be notified. */
    readonly stateChanges = new Subject<void>();

    /**
     * The displayed value of the option. It is necessary to show the selected option in the
     * select's trigger.
     */
    get viewValue(): string {
        // TODO: Add input property alternative for node envs.
        return (this.getHostElement().textContent || '').trim();
    }

    /** Whether the wrapping component is in multiple selection mode. */
    get multiple() {
        return this.parent && this.parent.multiple;
    }

    get id(): string {
        return this._id;
    }

    private _id = `mc-option-${uniqueIdCounter++}`;

    get selected(): boolean {
        return this._selected;
    }

    private _selected = false;

    @Input()
    get disabled() {
        return (this.group && this.group.disabled) || this._disabled;
    }

    set disabled(value: any) {
        this._disabled = coerceBooleanProperty(value);
    }

    private _disabled = false;

    /**
     * Whether or not the option is currently active and ready to be selected.
     * An active option displays styles as if it is focused, but the
     * focus is actually retained somewhere else. This comes in handy
     * for components like autocomplete where focus must remain on the input.
     */
    get active(): boolean {
        return this._active;
    }

    private _active = false;

    private mostRecentViewValue = '';

    constructor(
        private readonly element: ElementRef,
        private readonly changeDetectorRef: ChangeDetectorRef,
        @Optional() @Inject(MC_OPTION_PARENT_COMPONENT) private readonly parent: McOptionParentComponent,
        @Optional() readonly group: McOptgroup
    ) {}

    ngAfterViewChecked() {
        // Since parent components could be using the option's label to display the selected values
        // (e.g. `mc-select`) and they don't have a way of knowing if the option's label has changed
        // we have to check for changes in the DOM ourselves and dispatch an event. These checks are
        // relatively cheap, however we still limit them only to selected options in order to avoid
        // hitting the DOM too often.
        if (this._selected) {
            const viewValue = this.viewValue;

            if (viewValue !== this.mostRecentViewValue) {
                this.mostRecentViewValue = viewValue;
                this.stateChanges.next();
            }
        }
    }

    ngOnDestroy() {
        this.stateChanges.complete();
    }

    getHeight(): number {
        // tslint:disable-next-line:naming-convention
        const DOMRect: DOMRect = this.element.nativeElement.getClientRects()[0];

        return DOMRect ? DOMRect.height : 0;
    }

    select(): void {
        if (!this._selected) {
            this._selected = true;

            this.changeDetectorRef.markForCheck();
            this.emitSelectionChangeEvent();
        }
    }

    deselect(): void {
        if (this._selected) {
            this._selected = false;

            this.changeDetectorRef.markForCheck();
            this.emitSelectionChangeEvent();
        }
    }

    focus(): void {
        const element = this.getHostElement();

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
            this.changeDetectorRef.markForCheck();
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
            this.changeDetectorRef.markForCheck();
        }
    }

    /** Gets the label to be used when determining whether the option should be focused. */
    getLabel(): string {
        return this.viewValue;
    }

    /** Ensures the option is selected when activated from the keyboard. */
    handleKeydown(event: KeyboardEvent): void {
        // tslint:disable-next-line
        if (event.keyCode === ENTER || event.keyCode === SPACE) {
            this.selectViaInteraction();

            // Prevent the page from scrolling down and form submits.
            event.preventDefault();
        }
    }

    /**
     * `Selects the option while indicating the selection came from the user. Used to
     * determine if the select's view -> model callback should be invoked.`
     */
    selectViaInteraction(): void {
        if (!this.disabled) {
            this._selected = this.multiple ? !this._selected : true;

            this.changeDetectorRef.markForCheck();
            this.emitSelectionChangeEvent(true);
        }
    }

    getTabIndex(): string {
        return this.disabled ? '-1' : '0';
    }

    getHostElement(): HTMLElement {
        return this.element.nativeElement;
    }

    /** Emits the selection change event. */
    private emitSelectionChangeEvent(isUserInput = false): void {
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
export function countGroupLabelsBeforeOption(
    optionIndex: number,
    options: QueryList<McOption>,
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
export function getOptionScrollPosition(
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

