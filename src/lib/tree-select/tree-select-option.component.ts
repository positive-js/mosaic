import { ChangeDetectorRef, forwardRef, Input, Directive, ElementRef, Inject } from '@angular/core';

import { CdkTreeNode } from '@ptsecurity/cdk/tree';

import { CanDisable, McOptionSelectionChange, toBoolean } from '@ptsecurity/mosaic/core';

import { McTreeSelect } from './tree-select.component';


@Directive({
    selector: 'mc-tree-select-option',
    exportAs: 'mcTreeSelectOption',
    host: {
        tabindex: '-1',
        class: 'mc-tree-option',
        '[class.mc-selected]': 'selected',
        // todo унифицировать!
        '[class.mc-active]': 'active',

        '(click)': 'handleClick()'
    },
    providers: [
        { provide: CdkTreeNode, useExisting: McTreeSelectOption }
    ]
})
export class McTreeSelectOption<T> extends CdkTreeNode<T> implements CanDisable {
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

    constructor(
        protected elementRef: ElementRef,
        protected changeDetectorRef: ChangeDetectorRef,
        @Inject(forwardRef(() => McTreeSelect)) protected treeSelection: McTreeSelect<T>
    ) {
        super(elementRef, treeSelection);
    }

    focus(): void {
        this.elementRef.nativeElement.focus();

        this.treeSelection.setFocusedOption(this);
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

    // todo будет удалено
    // setSelected(selected: boolean) {
    //     if (this._selected === selected || !this.treeSelection.selectedOptions) { return; }
    //
    //     this._selected = selected;
    //
    //     if (selected) {
    //         this.treeSelection.selectedOptions.select(this);
    //     } else {
    //         this.treeSelection.selectedOptions.deselect(this);
    //     }
    //
    //     // this._changeDetector.markForCheck();
    // }

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
        return this.elementRef.nativeElement.getClientRects()[0].height;
    }

    handleClick(): void {
        if (this.disabled) { return; }

        this.treeSelection.setFocusedOption(this);
    }
}
