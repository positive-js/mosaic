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
    margin = false;

    isRow = false;
    isFieldSet = false;
    hasLegend = false;
    isHorizontal = false;

    @ContentChildren(McFormElement) elements: QueryList<McFormElement>;

    constructor(private readonly element: ElementRef<HTMLElement>) {}

    ngAfterContentInit(): void {
        const classList = this.element.nativeElement.classList;

        this.isRow = classList.contains('mc-form__row');
        this.isHorizontal = classList.contains('mc-horizontal');

        this.isFieldSet = classList.contains('mc-form__fieldset');

        if (this.isFieldSet && this.element.nativeElement.firstElementChild) {
            this.hasLegend = this.element.nativeElement.firstElementChild.classList.contains('mc-form__legend');
        }
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
