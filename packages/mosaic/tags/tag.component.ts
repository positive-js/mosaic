import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ContentChildren,
    Directive,
    ElementRef,
    EventEmitter,
    forwardRef,
    Inject,
    Input,
    NgZone,
    OnDestroy,
    Output,
    QueryList,
    ViewEncapsulation
} from '@angular/core';
import { IFocusableOption } from '@ptsecurity/cdk/a11y';
import { BACKSPACE, DELETE, SPACE } from '@ptsecurity/cdk/keycodes';
import {
    CanColor,
    CanColorCtor,
    CanDisable,
    CanDisableCtor,
    mixinColor,
    mixinDisabled
} from '@ptsecurity/mosaic/core';
import { McIcon } from '@ptsecurity/mosaic/icon';
import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';


// tslint:disable-next-line:naming-convention
export interface McTagEvent {
    tag: McTag;
}

/** Event object emitted by McTag when selected or deselected. */
export class McTagSelectionChange {
    constructor(public source: McTag, public selected: boolean, public isUserInput = false) {}
}


const TAG_ATTRIBUTE_NAMES = ['mc-basic-tag'];

/**
 * Dummy directive to add CSS class to tag avatar.
 * @docs-private
 */
@Directive({
    selector: 'mc-tag-avatar, [mcTagAvatar]',
    host: { class: 'mc-tag-avatar' }
})
export class McTagAvatar {}

/**
 * Dummy directive to add CSS class to tag trailing icon.
 * @docs-private
 */
@Directive({
    selector: 'mc-tag-trailing-icon, [mcTagTrailingIcon]',
    host: { class: 'mc-tag-trailing-icon' }
})
export class McTagTrailingIcon {}

/**
 *
 * Example:
 *
 *     `<mc-tag>
 *       <mc-icon mcTagRemove>cancel</mc-icon>
 *     </mc-tag>`
 *
 * You *may* use a custom icon, but you may need to override the `mc-tag-remove` positioning
 * styles to properly center the icon within the tag.
 */
@Directive({
    selector: '[mcTagRemove]',
    host: {
        class: 'mc-tag-remove mc-tag-trailing-icon',
        '[attr.tabindex]': '-1',
        '(click)': 'handleClick($event)',
        '(focus)': 'focus($event)'
    }
})
export class McTagRemove {
    constructor(@Inject(forwardRef(() => McTag)) protected parentTag: McTag) {}

    focus($event): void {
        $event.stopPropagation();
    }

    /** Calls the parent tag's public `remove()` method if applicable. */
    handleClick(event: Event): void {
        if (this.parentTag.removable) {
            this.parentTag.hasFocus = true;

            this.parentTag.remove();
        }

        // We need to stop event propagation because otherwise the event will bubble up to the
        // form field and cause the `onContainerClick` method to be invoked. This method would then
        // reset the focused tag that has been focused after tag removal. Usually the parent
        // the parent click listener of the `McTag` would prevent propagation, but it can happen
        // that the tag is being removed before the event bubbles up.
        event.stopPropagation();
    }
}

export class McTagBase {
    // tslint:disable-next-line:naming-convention
    constructor(public _elementRef: ElementRef) {}
}

// tslint:disable-next-line:naming-convention
export const McTagMixinBase: CanColorCtor & CanDisableCtor & typeof McTagBase = mixinColor(mixinDisabled(McTagBase));


@Component({
    selector: 'mc-tag, [mc-tag], mc-basic-tag, [mc-basic-tag]',
    exportAs: 'mcTag',
    templateUrl: 'tag.partial.html',
    styleUrls: ['./tag.scss'],
    inputs: ['color'],
    host: {
        class: 'mc-tag',

        '[attr.tabindex]': 'tabindex',
        '[attr.disabled]': 'disabled || null',

        '[class.mc-selected]': 'selected',
        '[class.mc-focused]': 'hasFocus',
        '[class.mc-tag-with-avatar]': 'avatar',
        '[class.mc-tag-with-icon]': 'contentChildren',
        '[class.mc-tag-with-trailing-icon]': 'trailingIcon || removeIcon',
        '[class.mc-disabled]': 'disabled',

        '(click)': 'handleClick($event)',
        '(keydown)': 'handleKeydown($event)',
        '(focus)': 'focus()',
        '(blur)': 'blur()'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class McTag extends McTagMixinBase implements IFocusableOption, OnDestroy, CanColor, CanDisable {
    /** Emits when the tag is focused. */
    readonly onFocus = new Subject<McTagEvent>();

    /** Emits when the tag is blured. */
    readonly onBlur = new Subject<McTagEvent>();

    nativeElement: HTMLElement;

    /** Whether the tag has focus. */
    hasFocus: boolean = false;

    /** Whether the tag list is selectable */
    tagListSelectable: boolean = true;

    @ContentChildren(McIcon) contentChildren: QueryList<McIcon>;

    /** The tag avatar */
    @ContentChild(McTagAvatar, {static: false}) avatar: McTagAvatar;

    /** The tag's trailing icon. */
    @ContentChild(McTagTrailingIcon, {static: false}) trailingIcon: McTagTrailingIcon;

    /** The tag's remove toggler. */
    @ContentChild(forwardRef(() => McTagRemove), {static: false}) removeIcon: McTagRemove;

    /** Emitted when the tag is selected or deselected. */
    @Output() readonly selectionChange: EventEmitter<McTagSelectionChange> =
        new EventEmitter<McTagSelectionChange>();

    /** Emitted when the tag is destroyed. */
    @Output() readonly destroyed: EventEmitter<McTagEvent> = new EventEmitter<McTagEvent>();

    /** Emitted when a tag is to be removed. */
    @Output() readonly removed: EventEmitter<McTagEvent> = new EventEmitter<McTagEvent>();

    /** Whether the tag is selected. */
    @Input()
    get selected(): boolean {
        return this._selected;
    }

    set selected(value: boolean) {
        const coercedValue = coerceBooleanProperty(value);

        if (coercedValue !== this._selected) {
            this._selected = coercedValue;
            this.dispatchSelectionChange();
        }
    }

    private _selected: boolean = false;

    /** The value of the tag. Defaults to the content inside `<mc-tag>` tags. */
    @Input()
    get value(): any {
        return this._value !== undefined
            ? this._value
            : this.elementRef.nativeElement.textContent;
    }

    set value(value: any) {
        this._value = value;
    }

    private _value: any;

    /**
     * Whether or not the tag is selectable. When a tag is not selectable,
     * changes to its selected state are always ignored. By default a tag is
     * selectable, and it becomes non-selectable if its parent tag list is
     * not selectable.
     */
    @Input()
    get selectable(): boolean {
        return this._selectable && this.tagListSelectable;
    }

    set selectable(value: boolean) {
        this._selectable = coerceBooleanProperty(value);
    }

    private _selectable: boolean = true;

    /**
     * Determines whether or not the tag displays the remove styling and emits (removed) events.
     */
    @Input()
    get removable(): boolean {
        return this._removable;
    }

    set removable(value: boolean) {
        this._removable = coerceBooleanProperty(value);
    }

    private _removable: boolean = true;

    get tabindex(): any {
        if (!this.selectable) { return null; }

        return this.disabled ? null : -1;
    }

    @Input()
    get disabled() {
        return this._disabled;
    }

    set disabled(value: any) {
        if (value !== this.disabled) {
            this._disabled = value;
        }
    }

    private _disabled: boolean = false;

    constructor(
        public elementRef: ElementRef,
        public changeDetectorRef: ChangeDetectorRef,
        private _ngZone: NgZone
    ) {
        super(elementRef);

        this.addHostClassName();

        this.nativeElement = elementRef.nativeElement;
    }

    ngAfterContentInit() {
        this.addClassModificatorForIcons();
    }

    addClassModificatorForIcons() {
        const icons = this.contentChildren.map((item) => item._elementRef.nativeElement);

        if (icons.length === 1) {
            const iconElement = icons[0];

            if (!iconElement.previousElementSibling && !iconElement.nextElementSibling) {
                if (iconElement.nextSibling) {
                    iconElement.classList.add('mc-icon_left');
                    this.nativeElement.classList.add('mc-left-icon');
                }

                if (iconElement.previousSibling) {
                    iconElement.classList.add('mc-icon_right');
                    this.nativeElement.classList.add('mc-right-icon');
                }
            }
        } else if (icons.length > 1) {
            const firstIconElement = icons[0];
            const secondIconElement = icons[1];

            firstIconElement.classList.add('mc-icon_left');
            secondIconElement.classList.add('mc-icon_right');
        }
    }

    addHostClassName() {
        // Add class for the different tags
        for (const attr of TAG_ATTRIBUTE_NAMES) {
            if (
                this.elementRef.nativeElement.hasAttribute(attr) ||
                this.elementRef.nativeElement.tagName.toLowerCase() === attr
            ) {
                    (this.elementRef.nativeElement as HTMLElement).classList.add(attr);

                    return;
            }
        }
        (this.elementRef.nativeElement as HTMLElement).classList.add('mc-standard-tag');
    }

    ngOnDestroy() {
        this.destroyed.emit({ tag: this });
    }

    select(): void {
        if (!this._selected) {
            this._selected = true;
            this.dispatchSelectionChange();
        }
    }

    deselect(): void {
        if (this._selected) {
            this._selected = false;
            this.dispatchSelectionChange();
        }
    }

    selectViaInteraction(): void {
        if (!this._selected) {
            this._selected = true;
            this.dispatchSelectionChange(true);
        }
    }

    toggleSelected(isUserInput: boolean = false): boolean {
        this._selected = !this.selected;
        this.dispatchSelectionChange(isUserInput);

        return this.selected;
    }

    /** Allows for programmatic focusing of the tag. */
    focus(): void {
        if (!this.selectable) { return; }

        if (!this.hasFocus) {
            this.elementRef.nativeElement.focus();

            this.onFocus.next({ tag: this });

            Promise.resolve().then(() => {
                this.hasFocus = true;
                this.changeDetectorRef.markForCheck();
            });
        }
    }

    /**
     * Allows for programmatic removal of the tag. Called by the McTagList when the DELETE or
     * BACKSPACE keys are pressed.
     *
     * Informs any listeners of the removal request. Does not remove the tag from the DOM.
     */
    remove(): void {
        if (this.removable) {
            this.removed.emit({ tag: this });
        }
    }

    handleClick(event: Event) {
        if (this.disabled) {
            event.preventDefault();
        } else {
            event.stopPropagation();
        }
    }

    handleKeydown(event: KeyboardEvent): void {
        if (this.disabled) { return; }

        // tslint:disable-next-line: deprecation
        switch (event.keyCode) {
            case DELETE:
            case BACKSPACE:
                // If we are removable, remove the focused tag
                this.remove();
                // Always prevent so page navigation does not occur
                event.preventDefault();
                break;
            case SPACE:
                // If we are selectable, toggle the focused tag
                if (this.selectable) {
                    this.toggleSelected(true);
                }

                // Always prevent space from scrolling the page since the list has focus
                event.preventDefault();
                break;
            default:
        }
    }

    blur(): void {
        // When animations are enabled, Angular may end up removing the tag from the DOM a little
        // earlier than usual, causing it to be blurred and throwing off the logic in the tag list
        // that moves focus not the next item. To work around the issue, we defer marking the tag
        // as not focused until the next time the zone stabilizes.
        this._ngZone.onStable
            .asObservable()
            .pipe(take(1))
            .subscribe(() => {
                this._ngZone.run(() => {
                    this.hasFocus = false;
                    this.onBlur.next({ tag: this });
                });
            });
    }

    private dispatchSelectionChange(isUserInput = false) {
        this.selectionChange.emit({
            source: this,
            isUserInput,
            selected: this._selected
        });
    }
}
