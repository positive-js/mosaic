import {
    AfterContentInit,
    ContentChildren,
    Directive,
    ElementRef,
    QueryList
} from '@angular/core';


@Directive({
    selector: '.mc-form__row, .mc-form__fieldset, .mc-form__legend',
    exportAs: 'mcFormElement',
    host: {
        '[class.mc-form-row_margin]': 'margin'
    }
})
export class McFormElement implements AfterContentInit {
    margin: boolean = false;

    isRow: boolean = false;
    isFieldSet: boolean = false;
    hasLegend: boolean = false;
    isHorizontal: boolean = false;

    @ContentChildren(McFormElement) elements: QueryList<McFormElement>;

    constructor(private readonly element: ElementRef<HTMLElement>) {}

    ngAfterContentInit(): void {
        const classList = this.element.nativeElement.classList;

        this.isRow = classList.contains('mc-form__row');
        this.isFieldSet = classList.contains('mc-form__fieldset');
        this.hasLegend = this.isFieldSet && this.element.nativeElement.firstElementChild!.classList.contains('mc-form__legend');
        this.isHorizontal = classList.contains('mc-horizontal');
    }
}


@Directive({
    selector: '.mc-form-vertical, .mc-form-horizontal',
    exportAs: 'mcForm',
    host: {
        class: 'mc-form'
    }
})
export class McForm implements AfterContentInit {
    @ContentChildren(McFormElement) elements: QueryList<McFormElement>;

    ngAfterContentInit(): void {
        this.handleElements(this.elements);
    }

    handleElements(elements: QueryList<McFormElement>): void {
        elements.forEach((element, index) => {
            const nextElement: McFormElement | undefined = elements.get(index + 1);

            if (element.isFieldSet && !element.isHorizontal) {
                this.handleElements(element.elements);
            }

            element.margin = !!(nextElement && !nextElement.hasLegend);
        });
    }
}
