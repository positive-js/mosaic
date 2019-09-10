import { SelectionModel } from '@angular/cdk/collections';
import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    Output,
    ElementRef,
    Inject,
    Optional,
    InjectionToken, ChangeDetectionStrategy, ViewEncapsulation, OnInit, OnDestroy
} from '@angular/core';
import { FocusMonitor } from '@ptsecurity/cdk/a11y';
import { CdkTreeNode } from '@ptsecurity/cdk/tree';
import { CanDisable, toBoolean } from '@ptsecurity/mosaic/core';


/* tslint:disable-next-line:naming-convention */
export interface McTreeOptionParentComponent {
    multiple: boolean;
    selectionModel: SelectionModel<any>;
    setSelectedOption: any;
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
        '[class.mc-focused]': 'hasFocus',

        '(focus)': 'handleFocus()',
        '(blur)': 'handleBlur()',
        '(click)': 'selectViaInteraction($event)'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [{ provide: CdkTreeNode, useExisting: McTreeOption }]
})
export class McTreeOption extends CdkTreeNode<McTreeOption> implements OnInit, OnDestroy, CanDisable {
    @Input()
    get value(): any {
        return this._value;
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

    get id(): string {
        return this._id;
    }

    private _id = `mc-tree-option-${uniqueIdCounter++}`;

    get multiple(): boolean {
        return this.parent.multiple;
    }

    hasFocus: boolean = false;

    constructor(
        protected elementRef: ElementRef,
        protected changeDetectorRef: ChangeDetectorRef,
        private focusMonitor: FocusMonitor,
        @Optional() @Inject(MC_TREE_OPTION_PARENT_COMPONENT) private readonly parent: McTreeOptionParentComponent
    ) {
        // todo any
        super(elementRef, parent as any);
    }

    ngOnInit() {
        this.focusMonitor.monitor(this.elementRef.nativeElement, false);
    }

    ngOnDestroy(): void {
        this.focusMonitor.stopMonitoring(this.elementRef.nativeElement);
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

        this.changeDetectorRef.markForCheck();
    }

    handleFocus() {
        if (this.disabled || this.hasFocus) { return; }

        this.hasFocus = true;

        if (this.parent.setFocusedOption) {
            this.parent.setFocusedOption(this);
        }
    }

    handleBlur() {
        this.hasFocus = false;
    }

    focus(): void {
        const element = this.getHostElement();

        if (typeof element.focus === 'function') {
            element.focus();
        }
    }

    getHeight(): number {
        const clientRects = this.elementRef.nativeElement.getClientRects();

        if (clientRects.length) {
            return clientRects[0].height;
        }

        return 0;
    }

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

    selectViaInteraction($event?: KeyboardEvent): void {
        if (!this.disabled) {
            this.changeDetectorRef.markForCheck();
            this.emitSelectionChangeEvent(true);

            if (this.parent.setSelectedOption) {
                this.parent.setSelectedOption(this, $event);
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
