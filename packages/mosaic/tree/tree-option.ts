import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    Output,
    ElementRef,
    Inject,
    Optional,
    InjectionToken, ChangeDetectionStrategy, ViewEncapsulation, OnInit
} from '@angular/core';
import { SelectionModel } from '@ptsecurity/cdk/collections';
import { CdkTreeNode } from '@ptsecurity/cdk/tree';
import { CanDisable, toBoolean } from '@ptsecurity/mosaic/core';


/* tslint:disable-next-line:naming-convention */
export interface McTreeOptionParentComponent {
    multiple: boolean;
    selectionModel: SelectionModel<any>;
    setFocusedOption: any;
}

/**
 * Injection token used to provide the parent component to options.
 */
export const MC_TREE_OPTION_PARENT_COMPONENT =
    new InjectionToken<McTreeOptionParentComponent>('MC_TREE_OPTION_PARENT_COMPONENT');

export class McTreeOptionChange {
    constructor(public source: McTreeOption, public isUserInput = false) {}
}

let uniqueIdCounter: number = 0;

@Component({
    selector: 'mc-tree-option',
    exportAs: 'mcTreeOption',
    templateUrl: './tree-option.html',
    host: {
        '[attr.id]': 'id',
        '[attr.tabindex]': 'getTabIndex()',

        '[attr.disabled]': 'disabled || null',

        class: 'mc-tree-option',
        '[class.mc-selected]': 'selected',
        '[class.mc-active]': 'active',

        '(click)': 'selectViaInteraction()'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [{ provide: CdkTreeNode, useExisting: McTreeOption }]
})
export class McTreeOption extends CdkTreeNode<McTreeOption> implements CanDisable {
    @Input()
    get value(): any {
        return this._value || this.viewValue;
    }

    set value(value: any) {
        this._value = value;
    }

    private _value: any;

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

    @Output() readonly onSelectionChange = new EventEmitter<McTreeOptionChange>();

    // @Input()
    // get selected(): boolean {
    //     return this.treeSelection.selectionModel && this.treeSelection.selectionModel.isSelected(this) || false;
    // }

    get selected(): boolean {
        return this._selected;
    }

    set selected(value: boolean) {
        const isSelected = toBoolean(value);

        if (isSelected !== this._selected) {
            this.setSelected(isSelected);
            // this.treeSelection._reportValueChange();
        }
    }

    private _selected: boolean = false;

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

    private _id = `mc-tree-option-${uniqueIdCounter++}`;

    get multiple(): boolean {
        return this.parent.multiple;
    }

    constructor(
        protected elementRef: ElementRef,
        protected changeDetectorRef: ChangeDetectorRef,
        @Optional() @Inject(MC_TREE_OPTION_PARENT_COMPONENT) private readonly parent: McTreeOptionParentComponent
    ) {
        // todo any
        super(elementRef, parent as any);
    }

    toggle(): void {
        this.selected = !this.selected;
    }

    setSelected(selected: boolean) {
        if (this._selected === selected || !this.parent.selectionModel) { return; }

        this._selected = selected;

        if (selected) {
            this.parent.selectionModel.select(this.value);
        } else {
            this.parent.selectionModel.deselect(this.value);
        }

        // this._changeDetector.markForCheck();
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

    getHeight(): number {
        const clientRects = this.elementRef.nativeElement.getClientRects();

        if (clientRects.length) {
            return clientRects[0].height;
        }

        return 0;
    }

    focus(): void {
        const element = this.getHostElement();

        if (typeof element.focus === 'function') {
            element.focus();
        }
    }

    // todo старая реализация, нужно восстановить tree-selection
    // handleClick(): void {
    //     if (this.disabled) { return; }
    //
    //     this.treeSelection.setFocusedOption(this);
    // }

    get viewValue(): string {
        // TODO: Add input property alternative for node envs.
        return (this.getHostElement().textContent || '').trim();
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
            this.changeDetectorRef.markForCheck();
            this.emitSelectionChangeEvent(true);

            if (this.parent.setFocusedOption) {
                this.parent.setFocusedOption(this);
            }
        }
    }

    emitSelectionChangeEvent(isUserInput = false): void {
        this.onSelectionChange.emit(new McTreeOptionChange(this, isUserInput));
    }

    getHostElement(): HTMLElement {
        return this.elementRef.nativeElement;
    }

    getTabIndex(): string {
        return this.disabled ? '-1' : '0';
    }
}
