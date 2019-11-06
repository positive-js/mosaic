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
    AfterContentInit, NgZone
} from '@angular/core';
import { CdkTreeNode } from '@ptsecurity/cdk/tree';
import { CanDisable, toBoolean } from '@ptsecurity/mosaic/core';
import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';


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
    host: {
        '[attr.id]': 'id',
        '[attr.tabindex]': 'tabIndex',

        '[attr.disabled]': 'disabled || null',

        class: 'mc-tree-option',
        '[class.mc-selected]': 'selected',
        '[class.mc-focused]': 'hasFocus',

        '(focus)': 'focus()',
        '(blur)': 'blur()',

        '(click)': 'selectViaInteraction($event)'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [{ provide: CdkTreeNode, useExisting: McTreeOption }]
})
export class McTreeOption extends CdkTreeNode<McTreeOption> implements CanDisable, AfterContentInit {

    readonly onFocus = new Subject<McTreeOptionEvent>();

    readonly onBlur = new Subject<McTreeOptionEvent>();

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
        return this.tree.showCheckbox;
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

    get tabIndex(): any {
        return this.disabled ? null : -1;
    }

    hasFocus: boolean = false;

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

    focus() {
        if (this.disabled || this.hasFocus) { return; }

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
                    this.hasFocus = false;

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

    markForCheck() {
        this.changeDetectorRef.markForCheck();
    }
}
