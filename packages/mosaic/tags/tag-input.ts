import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    Directive,
    ElementRef,
    EventEmitter,
    Inject,
    Input,
    OnChanges,
    Optional,
    Output,
    Renderer2,
    Self
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { hasModifierKey, ENTER, TAB, SPACE, COMMA } from '@ptsecurity/cdk/keycodes';

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
        class: 'mc-tag-input',
        '[id]': 'id',
        '[attr.disabled]': 'disabled || null',
        '[attr.placeholder]': 'placeholder || null',
        '(keydown)': 'keydown($event)',
        '(blur)': 'blur()',
        '(focus)': 'onFocus()',
        '(input)': 'onInput()',
        '(paste)': 'onPaste($event)'
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
    separatorKeyCodes: number[] = this.defaultOptions.separatorKeyCodes;

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
        @Inject(MC_TAGS_DEFAULT_OPTIONS) private defaultOptions: McTagsDefaultOptions,
        @Optional() @Self() public ngControl: NgControl
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
        this.emitTagEnd(event);
    }

    /** Checks to see if the blur should emit the (tagEnd) event. */
    blur() {
        this.focused = false;
        // Blur the tag list if it is not focused
        if (!this._tagList.focused) {
            this.triggerValidation();

            this._tagList.blur();
        }

        // tslint:disable-next-line: no-unnecessary-type-assertion
        if (this.addOnBlur && !(this.hasControl() && this.ngControl.invalid)) {
            this.emitTagEnd();
        }

        this._tagList.stateChanges.next();
    }

    triggerValidation() {
        if (!this.hasControl()) { return; }

        (this.ngControl.statusChanges as EventEmitter<string | null>).emit(this.ngControl.status);
    }

    /** Checks to see if the (tagEnd) event needs to be emitted. */
    emitTagEnd(event?: KeyboardEvent) {
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

    onPaste($event: ClipboardEvent) {
        if (!$event.clipboardData) { return; }

        const data = $event.clipboardData.getData('text');

        if (data && data.length === 0) { return; }

        const items: string[] = [];

        for (const key of this.separatorKeyCodes) {
            const separator = this.separatorKeyToSymbol(key);

            if (data.search(separator) > -1) {
                items.push(...data.split(separator));

                break;
            }
        }

        if (items.length === 0) {
            items.push(data);
        }

        items.forEach((item) => this.tagEnd.emit({ input: this.inputElement, value: item }));

        this.updateInputWidth();

        $event.preventDefault();
        $event.stopPropagation();
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

    private separatorKeyToSymbol(k): RegExp | string {
        const sep = {
            [ENTER]: /\r?\n/,
            [TAB]: /\t/,
            [SPACE]: / /,
            [COMMA]: /,/
        }[k];

        if (sep) { return sep; }

        return k;
    }

    private hasControl(): boolean {
        return !!this.ngControl;
    }

    private setDefaultInputWidth() {
        this.renderer.setStyle(this.inputElement, 'width', '30px');
    }

    /** Checks whether a keycode is one of the configured separators. */
    private isSeparatorKey(event: KeyboardEvent) {
        if (hasModifierKey(event)) { return false; }

        // tslint:disable-next-line: deprecation
        return this.separatorKeyCodes.indexOf(event.keyCode) > -1;
    }
}
