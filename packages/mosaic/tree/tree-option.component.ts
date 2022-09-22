import { FocusOrigin } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    Output,
    ElementRef,
    Inject,
    InjectionToken,
    ViewEncapsulation,
    AfterContentInit,
    NgZone,
    ContentChild,
    ChangeDetectionStrategy
} from '@angular/core';
import { hasModifierKey, TAB } from '@ptsecurity/cdk/keycodes';
import {
    MC_OPTION_ACTION_PARENT,
    McOptionActionComponent,
    McPseudoCheckbox
} from '@ptsecurity/mosaic/core';
import { McDropdownTrigger } from '@ptsecurity/mosaic/dropdown';
import { McTooltipTrigger } from '@ptsecurity/mosaic/tooltip';
import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';

import { McTreeNodeToggleDirective } from './toggle';
import { McTreeNode } from './tree-base';


// tslint:disable-next-line:naming-convention
export interface McTreeOptionEvent {
    option: McTreeOption;
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
    styleUrls: ['./tree-option.scss'],
    host: {
        class: 'mc-tree-option',
        '[class.mc-selected]': 'selected',
        '[class.mc-focused]': 'hasFocus',
        '[class.mc-action-button-focused]': 'actionButton?.active',

        '[attr.id]': 'id',
        '[attr.tabindex]': '-1',
        '[attr.disabled]': 'disabled || null',

        '(focusin)': 'focus()',
        '(blur)': 'blur()',

        '(click)': 'selectViaInteraction($event)',
        '(keydown)': 'onKeydown($event)'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        { provide: McTreeNode, useExisting: McTreeOption },
        { provide: MC_OPTION_ACTION_PARENT, useExisting: McTreeOption }
    ]
})
export class McTreeOption extends McTreeNode<McTreeOption> implements AfterContentInit {
    readonly onFocus = new Subject<McTreeOptionEvent>();

    readonly onBlur = new Subject<McTreeOptionEvent>();

    @ContentChild(McTreeNodeToggleDirective) toggleElement: McTreeNodeToggleDirective<McTreeOption>;
    @ContentChild(McPseudoCheckbox) pseudoCheckbox: McPseudoCheckbox;
    @ContentChild(McOptionActionComponent) actionButton: McOptionActionComponent;
    @ContentChild(McTooltipTrigger) tooltipTrigger: McTooltipTrigger;
    @ContentChild(McDropdownTrigger) dropdownTrigger: McDropdownTrigger;

    get externalPseudoCheckbox(): boolean {
        return !!this.pseudoCheckbox;
    }

    get value(): any {
        return this._value;
    }

    set value(value: any) {
        this._value = value;
    }

    private _value: any;

    @Input()
    get disabled() {
        return this._disabled || this.tree!.disabled;
    }

    set disabled(value: any) {
        const newValue = coerceBooleanProperty(value);

        if (newValue !== this._disabled) {
            this._disabled = newValue;
        }
    }

    private _disabled: boolean = false;

    @Input()
    get showCheckbox() {
        return this._showCheckbox !== undefined ? this._showCheckbox : this.tree.showCheckbox;
    }

    set showCheckbox(value: any) {
        this._showCheckbox = coerceBooleanProperty(value);
    }

    private _showCheckbox: boolean;

    @Output() readonly onSelectionChange = new EventEmitter<McTreeOptionChange>();

    get selected(): boolean {
        return this._selected;
    }

    set selected(value: boolean) {
        const isSelected = coerceBooleanProperty(value);

        if (isSelected !== this._selected) {
            this.setSelected(isSelected);
        }
    }

    private _selected: boolean = false;

    get id(): string {
        return this._id;
    }

    private _id = `mc-tree-option-${uniqueIdCounter++}`;

    get viewValue(): string {
        // TODO: Add input property alternative for node envs.
        return (this.getHostElement().textContent || '').trim();
    }

    hasFocus: boolean = false;

    get isExpandable(): boolean {
        return !this.toggleElement?.disabled && this.tree.treeControl.isExpandable(this.data);
    }

    constructor(
        elementRef: ElementRef,
        private changeDetectorRef: ChangeDetectorRef,
        private ngZone: NgZone,
        @Inject(MC_TREE_OPTION_PARENT_COMPONENT) public tree: any
    ) {
        super(elementRef, tree);
    }

    ngAfterContentInit(): void {
        this.value = this.tree.treeControl.getValue(this.data);
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

    focus(focusOrigin?: FocusOrigin) {
        if (focusOrigin === 'program') { return; }

        if (this.disabled || this.hasFocus || this.actionButton?.hasFocus) { return; }

        this.elementRef.nativeElement.focus();

        this.onFocus.next({ option: this });

        Promise.resolve().then(() => {
            this.hasFocus = true;

            this.changeDetectorRef.markForCheck();
        });
    }

    blur(): void {
        // When animations are enabled, Angular may end up removing the option from the DOM a little
        // earlier than usual, causing it to be blurred and throwing off the logic in the tree
        // that moves focus not the next item. To work around the issue, we defer marking the option
        // as not focused until the next time the zone stabilizes.
        this.ngZone.onStable
            .asObservable()
            .pipe(take(1))
            .subscribe(() => {
                this.ngZone.run(() => {
                    if (this.actionButton?.hasFocus) { return; }

                    this.onBlur.next({ option: this });
                });
            });
    }

    getHeight(): number {
        const clientRects = this.elementRef.nativeElement.getClientRects();

        if (clientRects.length) {
            return clientRects[0].height;
        }

        return 0;
    }

    select(setFocus = true): void {
        if (this._selected) { return; }

        this._selected = true;

        if (setFocus && !this.hasFocus) {
            this.focus();
        }

        this.changeDetectorRef.markForCheck();
        this.emitSelectionChangeEvent();
    }

    deselect(): void {
        if (!this._selected) { return; }

        this._selected = false;

        this.changeDetectorRef.markForCheck();
    }

    onKeydown($event) {
        if (!this.actionButton) { return; }

        if ($event.keyCode === TAB && !$event.shiftKey && !this.actionButton.hasFocus) {
            this.actionButton.focus();

            $event.preventDefault();
        }
    }

    selectViaInteraction($event?: KeyboardEvent): void {
        if (this.disabled) { return; }

        this.changeDetectorRef.markForCheck();
        this.emitSelectionChangeEvent(true);

        const shiftKey = $event ? hasModifierKey($event, 'shiftKey') : false;
        const ctrlKey = $event ? hasModifierKey($event, 'ctrlKey') : false;

        this.tree.setSelectedOptionsByClick(this, shiftKey, ctrlKey);
    }

    emitSelectionChangeEvent(isUserInput = false): void {
        this.onSelectionChange.emit(new McTreeOptionChange(this, isUserInput));
    }

    getHostElement(): HTMLElement {
        return this.elementRef.nativeElement;
    }

    markForCheck() {
        this.changeDetectorRef.markForCheck();
    }
}
