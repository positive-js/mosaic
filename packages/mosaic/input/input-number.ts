import { Platform } from '@angular/cdk/platform';
import {
    Attribute,
    Directive,
    ElementRef,
    Input,
    Optional,
    Self
} from '@angular/core';
import { NgControl } from '@angular/forms';
import {
    END, C, V, X, A, Z, DELETE, BACKSPACE, TAB, ENTER,
    ESCAPE, ZERO, NINE, NUMPAD_ZERO, NUMPAD_NINE, NUMPAD_MINUS, DASH,
    FF_MINUS, LEFT_ARROW, RIGHT_ARROW, HOME, UP_ARROW, DOWN_ARROW, F1, F12
} from '@ptsecurity/cdk/keycodes';
import { Subject } from 'rxjs';


export const BIG_STEP = 10;
export const SMALL_STEP = 1;

export function normalizeSplitter(value: string): string {
    return value ? value.replace(/,/g, '.') : value;
}

export function isFloat(value: string): boolean {
    return /^-?\d+\.\d+$/.test(value);
}

export function isInt(value: string): boolean {
    return /^-?\d+$/.test(value);
}

export function isDigit(value: string): boolean {
    return isFloat(value) || isInt(value);
}

export function getPrecision(value: number): number {
    const arr = value.toString().split('.');

    return arr.length === 1
        ? 1
        // tslint:disable-next-line:no-magic-numbers
        :  Math.pow(10, arr[1].length);
}

export function add(value1: number, value2: number): number {
    const precision = Math.max(getPrecision(value1), getPrecision(value2));

    return (value1 * precision + value2 * precision) / precision;
}


@Directive({
    selector: `input[mcInput][type="number"]`,
    exportAs: 'mcNumericalInput',
    host: {
        '(blur)': 'focusChanged(false)',
        '(focus)': 'focusChanged(true)',
        '(paste)': 'onPaste($event)',
        '(keydown)': 'onKeyDown($event)'
    }
})
export class McNumberInput {
    @Input()
    bigStep: number;

    @Input()
    step: number;

    @Input()
    min: number;

    @Input()
    max: number;

    value: any;

    focused: boolean = false;

    readonly stateChanges: Subject<void> = new Subject<void>();

    get nativeElement(): HTMLInputElement {
        return this.elementRef.nativeElement;
    }

    constructor(
        private platform: Platform ,
        private elementRef: ElementRef,
        @Optional() @Self() private ngControl: NgControl,
        @Attribute('step') step: string,
        @Attribute('big-step') bigStep: string,
        @Attribute('min') min: string,
        @Attribute('max') max: string
    ) {
        this.step = isDigit(step) ? parseFloat(step) : SMALL_STEP;
        this.bigStep = isDigit(bigStep) ? parseFloat(bigStep) : BIG_STEP;
        this.min = isDigit(min) ? parseFloat(min) : -Infinity;
        this.max = isDigit(max) ? parseFloat(max) : Infinity;

        if ('valueAsNumber' in this.nativeElement) {
            Object.defineProperty(Object.getPrototypeOf(this.nativeElement), 'valueAsNumber', {
                // tslint:disable-next-line:no-reserved-keywords
                get() {
                    const res = parseFloat(normalizeSplitter(this.value));

                    return isNaN(res) ? null : res;
                }
            });
        }
    }

    focusChanged(isFocused: boolean) {
        if (isFocused !== this.focused) {
            this.focused = isFocused;
            this.stateChanges.next();
        }
    }

    onKeyDown(event: KeyboardEvent) {
        // tslint:disable-next-line:deprecation
        const keyCode = event.keyCode;

        const isCtrlA = (e) => e.keyCode === A && (e.ctrlKey || e.metaKey);
        const isCtrlC = (e) => e.keyCode === C && (e.ctrlKey || e.metaKey);
        const isCtrlV = (e) => e.keyCode === V && (e.ctrlKey || e.metaKey);
        const isCtrlX = (e) => e.keyCode === X && (e.ctrlKey || e.metaKey);
        const isCtrlZ = (e) => e.keyCode === Z && (e.ctrlKey || e.metaKey);

        const isFKey = (e) => e.keyCode >= F1 && e.keyCode <= F12;

        const isNumber = (e) => (e.keyCode >= ZERO && e.keyCode <= NINE) ||
            (e.keyCode >= NUMPAD_ZERO && e.keyCode <= NUMPAD_NINE);

        const isIEPeriod = (e) => e.key === '.' || e.key === 'Decimal';
        const isNotIEPeriod = (e) => e.key === '.' || e.key === ',';

        const minuses = [NUMPAD_MINUS, DASH, FF_MINUS];
        const serviceKeys = [DELETE, BACKSPACE, TAB, ESCAPE, ENTER];
        const arrows = [LEFT_ARROW, RIGHT_ARROW];
        const allowedKeys =  [HOME, END].concat(arrows).concat(serviceKeys).concat(minuses);

        // Decimal is for IE
        const isPeriod = (e) => this.platform.EDGE || this.platform.TRIDENT
            ? isIEPeriod(e)
            : isNotIEPeriod(e);

        if (allowedKeys.indexOf(keyCode) !== -1 ||
            isCtrlA(event) ||
            isCtrlC(event) ||
            isCtrlV(event) ||
            isCtrlX(event) ||
            isCtrlZ(event) ||
            isFKey(event) ||
            isPeriod(event)
        ) {
            // let it happen, don't do anything
            return;
        }
        // Ensure that it is not a number and stop the keypress
        if (event.shiftKey || !isNumber(event)) {
            event.preventDefault();

            // process steps
            const step = event.shiftKey ? this.bigStep : this.step;

            if (keyCode === UP_ARROW) {
                this.stepUp(step);
            }

            if (keyCode === DOWN_ARROW) {
                this.stepDown(step);
            }
        }
    }

    onPaste(event) {
        if (!isDigit(normalizeSplitter(event.clipboardData.getData('text')))) {
            event.preventDefault();
        }
    }

    stepUp(step: number) {
        this.elementRef.nativeElement.focus();

        const res = Math.max(Math.min(add(this.nativeElement.valueAsNumber || 0, step), this.max), this.min);

        this.nativeElement.value = res.toString();

        this.viewToModelUpdate(this.nativeElement.valueAsNumber);
    }

    stepDown(step: number) {
        this.elementRef.nativeElement.focus();

        const res = Math.min(Math.max(add(this.nativeElement.valueAsNumber || 0, -step), this.min), this.max);

        this.nativeElement.value = res.toString();

        this.viewToModelUpdate(this.nativeElement.valueAsNumber);
    }

    private viewToModelUpdate(value: number) {
        if (this.ngControl) {
            this.ngControl.control!.setValue(value);
        }
    }
}
