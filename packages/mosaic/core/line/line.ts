import { NgModule, Directive, ElementRef, QueryList } from '@angular/core';


/**
 * Shared directive to count lines inside a text area, such as a list item.
 * Line elements can be extracted with a @ContentChildren(McLine) query, then
 * counted by checking the query list's length.
 */
@Directive({
    selector: '[mc-line], [mcLine]',
    host: { class: 'mc-line' }
})
export class McLine {}

/**
 * Helper that takes a query list of lines and sets the correct class on the host.
 * @docs-private
 */
export class McLineSetter {
    constructor(private _lines: QueryList<McLine>, private _element: ElementRef) {
        this.setLineClass(this._lines.length);

        this._lines.changes.subscribe(() => {
            this.setLineClass(this._lines.length);
        });
    }

    private setLineClass(count: number): void {
        const minLineClassNumber = 2;
        const maxLineClassNumber = 3;
        this.resetClasses();
        if (count === minLineClassNumber || count === maxLineClassNumber) {
            this.setClass(`mc-${count}-line`, true);
        } else if (count > maxLineClassNumber) {
            this.setClass(`mc-multi-line`, true);
        }
    }

    private resetClasses(): void {
        this.setClass('mc-2-line', false);
        this.setClass('mc-3-line', false);
        this.setClass('mc-multi-line', false);
    }

    private setClass(className: string, isAdd: boolean): void {
        if (isAdd) {
            this._element.nativeElement.classList.add(className);
        } else {
            this._element.nativeElement.classList.remove(className);
        }
    }
}

@NgModule({
    imports: [],
    exports: [McLine],
    declarations: [McLine]
})
export class McLineModule {}
