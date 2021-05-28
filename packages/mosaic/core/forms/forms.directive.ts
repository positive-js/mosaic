import {
    AfterContentInit,
    ContentChildren,
    Directive,
    ElementRef,
    QueryList
} from '@angular/core';


@Directive({
    selector: '.mc-form__row, .mc-form__fieldset, .mc-form__legend',
    exportAs: 'mcForms',
    host: {
        class: 'mc',
        '[class.mc-form-row_margin]': 'margin'
    }
})
export class McFormElement {
    margin: boolean = false;
    @ContentChildren(McFormElement) elements: QueryList<McFormElement>;

    get isRow(): boolean {
        return this.element.nativeElement.classList.contains('mc-form__row');
    }

    get isFieldSet(): boolean {
        return this.element.nativeElement.classList.contains('mc-form__fieldset');
    }

    get hasLegend(): boolean {
        return this.element.nativeElement.firstElementChild!.classList.contains('mc-form__legend');
    }

    constructor(private readonly element: ElementRef<HTMLElement>) {
        console.log('McFormRow: '); // tslint:disable-line:no-console
    }
}

@Directive({
    selector: '.mc-form__row',
    exportAs: 'mcForms',
    host: {
        class: 'mc'
    }
})
export class McFormRow {
    // @ts-ignore
    constructor(private readonly element: ElementRef<HTMLElement>) {
        console.log('McFormRow: '); // tslint:disable-line:no-console
    }
}

@Directive({
    selector: '.mc-form-horizontal',
    exportAs: 'mcForms',
    host: {
        class: 'mc-form'
    }
})
export class McFormHorizontal implements AfterContentInit {
    @ContentChildren(McFormElement) elements: QueryList<McFormElement>;

    // @ts-ignore
    constructor(private readonly element: ElementRef) {
        console.log('McFormHorizontal: '); // tslint:disable-line:no-console
    }

    ngAfterContentInit(): void {
        this.handleElements(this.elements);
    }

    handleElements(elements: QueryList<McFormElement>, nextParent?: McFormElement): void {
        elements.forEach((element, index) => {
            const nextElement: McFormElement | undefined = element.elements.get(index + 1);

            if (element.isFieldSet) {
                this.handleElements(element.elements, nextElement);
            }

            element.margin = !(nextElement || nextParent)?.hasLegend;
        });
    }
}

@Directive({
    selector: '.mc-form-vertical',
    exportAs: 'mcForms',
    host: {
        class: 'mc-form'
    }
})
export class McFormVertical implements AfterContentInit {
    @ContentChildren(McFormElement) elements: QueryList<McFormElement>;

    // @ts-ignore
    constructor(private readonly element: ElementRef) {
        console.log('McFormHorizontal: '); // tslint:disable-line:no-console
    }

    ngAfterContentInit(): void {
        this.elements.forEach((element, index) => {
            this.handleElement(element.elements, this.elements.get(index + 1));
        });
    }

    handleElement(elements: QueryList<McFormElement>, nextParent: McFormElement | undefined): void {
        elements.forEach((element, index) => {
            const nextElement: McFormElement | undefined = element.elements.get(index + 1);

            if (element.isFieldSet) {
                this.handleElement(element.elements, nextElement);
            }

            element.margin = !(nextElement || nextParent)?.hasLegend;
        });
    }
}


@Directive({
    selector: '.mc-form__fieldset',
    exportAs: 'mcForms',
    host: {
        class: ''
    }
})
export class McFormFieldSet {
    // @ts-ignore
    constructor(private readonly element: ElementRef) {
        console.log('McFormHorizontal: '); // tslint:disable-line:no-console
    }
}
