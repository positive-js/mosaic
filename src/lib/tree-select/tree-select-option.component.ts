import {
    ChangeDetectorRef,
    forwardRef,
    Input,
    ElementRef,
    Inject,
    Output,
    EventEmitter, Component, ViewEncapsulation, ChangeDetectionStrategy
} from '@angular/core';

import { CdkTreeNode } from '@ptsecurity/cdk/tree';

import { CanDisable, toBoolean } from '@ptsecurity/mosaic/core';

import { McTreeSelect } from './tree-select.component';


let uniqueIdCounter: number = 0;

export class McTreeSelectOptionChange {
    constructor(public source: McTreeSelectOption, public isUserInput = false) {}
}


@Component({
    selector: 'mc-tree-select-option',
    exportAs: 'mcTreeSelectOption',
    host: {
        tabindex: '-1',
        class: 'mc-tree-option',
        '[class.mc-selected]': 'selected',
        // todo унифицировать!
        '[class.mc-active]': 'active',

        '(click)': 'selectViaInteraction()'
    },
    templateUrl: './tree-select-option.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: CdkTreeNode, useExisting: McTreeSelectOption }
    ]
})
export class McTreeSelectOption extends CdkTreeNode<McTreeSelectOption> implements CanDisable {
    /** Event emitted when the option is selected or deselected. */
    // tslint:disable-next-line:no-output-on-prefix
    @Output() readonly onSelectionChange = new EventEmitter<McTreeSelectOptionChange>();

    /** The form value of the option. */
    @Input() value: any;

    @Input()
    get disabled() {
        return this._disabled;
    }

    set disabled(value: any) {
        const newValue = toBoolean(value);

        if (newValue !== this._disabled) {
            this._disabled = newValue;
        }
    }

    private _disabled: boolean = false;

    @Input()
    get selected(): boolean {
        return this._selected;
    }

    private _selected = false;

    get multiple(): boolean {
        return this.treeSelection.multiple;
    }

    /**
     * The displayed value of the option. It is necessary to show the selected option in the
     * select's trigger.
     */
    get viewValue(): string {
        // TODO(kara): Add input property alternative for node envs.
        return (this.getHostElement().textContent || '').trim();
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

    private _active = false;

    get id(): string {
        return this._id;
    }

    private _id = `mc-option-${uniqueIdCounter++}`;

    constructor(
        protected elementRef: ElementRef,
        protected changeDetectorRef: ChangeDetectorRef,
        @Inject(forwardRef(() => McTreeSelect)) protected treeSelection: McTreeSelect
    ) {
        super(elementRef, treeSelection);
    }

    select(): void {
        if (!this._selected) {
            this._selected = true;

            this.changeDetectorRef.markForCheck();
        }
    }

    deselect(): void {
        if (this._selected) {
            this._selected = false;

            this.changeDetectorRef.markForCheck();
        }
    }

    selectViaInteraction(): void {
        if (!this.disabled) {
            this._selected = this.multiple ? !this._selected : true;

            this.changeDetectorRef.markForCheck();
            this.emitSelectionChangeEvent(true);
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

            if (this.treeSelection.autoSelect) { this.select(); }

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

            if (this.treeSelection.autoSelect) { this.deselect(); }

            this.changeDetectorRef.markForCheck();
        }
    }

    getHeight(): number {
        return this.elementRef.nativeElement.getClientRects()[0].height;
    }

    /** Emits the selection change event. */
    emitSelectionChangeEvent(isUserInput = false): void {
        this.onSelectionChange.emit(new McTreeSelectOptionChange(this, isUserInput));
    }

    getHostElement(): HTMLElement {
        return this.elementRef.nativeElement;
    }
}
