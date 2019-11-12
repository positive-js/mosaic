import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Directive, ElementRef, EventEmitter, Inject, Input, OnChanges, Output, Renderer2 } from '@angular/core';
import { hasModifierKey } from '@ptsecurity/cdk/keycodes';

import { MC_TAGS_DEFAULT_OPTIONS, McTagsDefaultOptions } from './tag-default-options';
import { McTagList } from './tag-list.component';
import { McTagTextControl } from './tag-text-control';


/** Represents an input event on a `mcTagInput`. */
// tslint:disable-next-line: naming-convention
export interface McTagInputEvent {
    /** The native `<input>` element that the event is being fired for. */
    input: HTMLInputElement;

    /** The value of the input. */
    value: string;
}

// Increasing integer for generating unique ids.
let nextUniqueId = 0;

/**
 * Directive that adds tag-specific behaviors to an input element inside `<mc-form-field>`.
 * May be placed inside or outside of an `<mc-tag-list>`.
 */
@Directive({
    selector: 'input[mcTagInputFor]',
    exportAs: 'mcTagInput, mcTagInputFor',
    host: {
        class: 'mc-tag-input mc-input-element',
        '[id]': 'id',
        '[attr.disabled]': 'disabled || null',
        '[attr.placeholder]': 'placeholder || null',
        '[attr.aria-invalid]': '_tagList && _tagList.ngControl ? _tagList.ngControl.invalid : null',
        '(keydown)': 'keydown($event)',
        '(blur)': 'blur()',
        '(focus)': 'onFocus()',
        '(input)': 'onInput()'
    }
})
export class McTagInput implements McTagTextControl, OnChanges {
    /** Whether the control is focused. */
    focused: boolean = false;

    /**
     * The list of key codes that will trigger a tagEnd event.
     *
     * Defaults to `[ENTER]`.
     */
    @Input('mcTagInputSeparatorKeyCodes')
    separatorKeyCodes: number[] | Set<number> = this.defaultOptions.separatorKeyCodes;

    /** Emitted when a tag is to be added. */
    @Output('mcTagInputTokenEnd')
    tagEnd: EventEmitter<McTagInputEvent> = new EventEmitter<McTagInputEvent>();

    /** The input's placeholder text. */
    @Input() placeholder: string = '';

    /** Unique id for the input. */
    @Input() id: string = `mc-tag-list-input-${nextUniqueId++}`;

    /** Register input for tag list */
    @Input('mcTagInputFor')
    set tagList(value: McTagList) {
        if (value) {
            this._tagList = value;
            this._tagList.registerInput(this);
        }
    }

    // tslint:disable-next-line: naming-convention
    private _tagList: McTagList;

    /**
     * Whether or not the tagEnd event will be emitted when the input is blurred.
     */
    @Input('mcTagInputAddOnBlur')
    get addOnBlur(): boolean {
        return this._addOnBlur;
    }

    set addOnBlur(value: boolean) {
        this._addOnBlur = coerceBooleanProperty(value);
    }

    private _addOnBlur: boolean = true;

    /** Whether the input is disabled. */
    @Input()
    get disabled(): boolean {
        return this._disabled || (this._tagList && this._tagList.disabled);
    }

    set disabled(value: boolean) {
        this._disabled = coerceBooleanProperty(value);
    }

    private _disabled: boolean = false;

    /** Whether the input is empty. */
    get empty(): boolean {
        return !this.inputElement.value;
    }

    countOfSymbolsForUpdateWidth: number = 3;

    private oneSymbolWidth: number;

    /** The native input element to which this directive is attached. */
    private inputElement: HTMLInputElement;

    constructor(
        private elementRef: ElementRef<HTMLInputElement>,
        private renderer: Renderer2,
        @Inject(MC_TAGS_DEFAULT_OPTIONS) private defaultOptions: McTagsDefaultOptions
    ) {
        // tslint:disable-next-line: no-unnecessary-type-assertion
        this.inputElement = this.elementRef.nativeElement as HTMLInputElement;

        this.setDefaultInputWidth();
    }

    ngOnChanges() {
        this._tagList.stateChanges.next();
    }

    /** Utility method to make host definition/tests more clear. */
    keydown(event?: KeyboardEvent) {
        this.emittagEnd(event);
    }

    /** Checks to see if the blur should emit the (tagEnd) event. */
    blur() {
        if (this.addOnBlur) {
            this.emittagEnd();
        }

        this.focused = false;
        // Blur the tag list if it is not focused
        if (!this._tagList.focused) {
            this._tagList.blur();
        }

        this._tagList.stateChanges.next();
    }

    /** Checks to see if the (tagEnd) event needs to be emitted. */
    emittagEnd(event?: KeyboardEvent) {
        if (!this.inputElement.value && !!event) {
            this._tagList.keydown(event);
        }

        if (!event || this.isSeparatorKey(event)) {
            this.tagEnd.emit({ input: this.inputElement, value: this.inputElement.value });
            this.updateInputWidth();

            if (event) {
                event.preventDefault();
            }
        }
    }

    onInput() {
        this.updateInputWidth();
        // Let tag list know whenever the value changes.
        this._tagList.stateChanges.next();
    }

    updateInputWidth(): void {
        const length = this.inputElement.value.length;

        this.renderer.setStyle(this.inputElement, 'max-width', 0);
        this.oneSymbolWidth = this.inputElement.scrollWidth / length;
        this.renderer.setStyle(this.inputElement, 'max-width', '');

        if (length > this.countOfSymbolsForUpdateWidth) {
            this.renderer.setStyle(this.inputElement, 'width', `${length * this.oneSymbolWidth}px`);
        } else {
            this.setDefaultInputWidth();
        }
    }

    onFocus() {
        this.focused = true;
        this._tagList.stateChanges.next();
    }

    /** Focuses the input. */
    focus(): void {
        this.inputElement.focus();
    }

    private setDefaultInputWidth() {
        this.renderer.setStyle(this.inputElement, 'width', '30px');
    }

    /** Checks whether a keycode is one of the configured separators. */
    private isSeparatorKey(event: KeyboardEvent) {
        if (hasModifierKey(event)) { return false; }

        const separators = this.separatorKeyCodes;
        // tslint:disable-next-line: deprecation
        const keyCode = event.keyCode;

        return Array.isArray(separators) ? separators.indexOf(keyCode) > -1 : separators.has(keyCode);
    }
}
