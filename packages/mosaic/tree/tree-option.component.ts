import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    Output,
    ElementRef,
    Inject,
    InjectionToken,
    ChangeDetectionStrategy,
    ViewEncapsulation,
    OnInit,
    OnDestroy,
    AfterContentInit
} from '@angular/core';
import { FocusMonitor } from '@ptsecurity/cdk/a11y';
import { CdkTreeNode } from '@ptsecurity/cdk/tree';
import { CanDisable, toBoolean } from '@ptsecurity/mosaic/core';


export enum MultipleMode {
    CHECKBOX = 'checkbox',
    KEYBOARD = 'keyboard'
}

/**
 * Injection token used to provide the parent component to options.
 */
export const MC_TREE_OPTION_PARENT_COMPONENT = new InjectionToken<any>('MC_TREE_OPTION_PARENT_COMPONENT');

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
        '[class.mc-focused]': 'hasFocus',

        '(focus)': 'handleFocus()',
        '(blur)': 'handleBlur()',
        '(click)': 'selectViaInteraction($event)'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [{ provide: CdkTreeNode, useExisting: McTreeOption }]
})
export class McTreeOption extends CdkTreeNode<McTreeOption> implements OnInit, OnDestroy, CanDisable, AfterContentInit {
    get value(): any {
        return this._value;
    }

    set value(value: any) {
        this._value = value;
    }

    private _value: any;

    @Input()
    get disabled() {
        return this._disabled || (this.tree && this.tree.disabled);
    }

    set disabled(value: any) {
        const newValue = toBoolean(value);

        if (newValue !== this._disabled) {
            this._disabled = newValue;
        }
    }

    private _disabled: boolean = false;

    get showCheckbox(): boolean {
        return this.multiple && this.tree.multipleMode === MultipleMode.CHECKBOX;
    }

    @Output() readonly onSelectionChange = new EventEmitter<McTreeOptionChange>();

    get selected(): boolean {
        return this._selected;
    }

    set selected(value: boolean) {
        const isSelected = toBoolean(value);

        if (isSelected !== this._selected) {
            this.setSelected(isSelected);
        }
    }

    private _selected: boolean = false;

    get id(): string {
        return this._id;
    }

    private _id = `mc-tree-option-${uniqueIdCounter++}`;

    get multiple(): boolean {
        return this.tree.multiple;
    }

    get viewValue(): string {
        // TODO: Add input property alternative for node envs.
        return (this.getHostElement().textContent || '').trim();
    }

    hasFocus: boolean = false;

    constructor(
        elementRef: ElementRef,
        private changeDetectorRef: ChangeDetectorRef,
        private focusMonitor: FocusMonitor,
        @Inject(MC_TREE_OPTION_PARENT_COMPONENT) public tree: any
    ) {
        super(elementRef, tree);
    }

    ngOnInit(): void {
        this.focusMonitor.monitor(this.elementRef.nativeElement, false);
    }

    ngAfterContentInit(): void {
        this.value = this.tree.treeControl.getValue(this.data);
    }

    ngOnDestroy(): void {
        this.focusMonitor.stopMonitoring(this.elementRef.nativeElement);
    }

    toggle(): void {
        this.selected = !this.selected;
    }

    setSelected(selected: boolean): void {
        if (this._selected === selected || !this.tree.selectionModel) { return; }

        this._selected = selected;

        if (selected) {
            this.tree.selectionModel.select(this.data);
        } else {
            this.tree.selectionModel.deselect(this.data);
        }

        this.changeDetectorRef.markForCheck();
    }

    handleFocus(): void {
        if (this.disabled || this.hasFocus) { return; }

        this.hasFocus = true;

        if (this.tree.setFocusedOption) {
            this.tree.setFocusedOption(this);
        }
    }

    handleBlur(): void {
        this.hasFocus = false;
    }

    focus(): void {
        this.focusMonitor.focusVia(this.getHostElement(), 'keyboard');
    }

    getHeight(): number {
        const clientRects = this.elementRef.nativeElement.getClientRects();

        if (clientRects.length) {
            return clientRects[0].height;
        }

        return 0;
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
        }
    }

    selectViaInteraction($event?: KeyboardEvent): void {
        if (!this.disabled) {
            this.changeDetectorRef.markForCheck();
            this.emitSelectionChangeEvent(true);

            if (this.tree.setSelectedOption) {
                this.tree.setSelectedOption(this, $event);
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

    markForCheck() {
        this.changeDetectorRef.markForCheck();
    }
}
