// todo пока не делаем, перенесено из материала, но у нас в доках таких простых списков нет.
import {
    AfterContentInit, ChangeDetectionStrategy, Component, ContentChildren, Directive, ElementRef, QueryList,
    ViewEncapsulation
} from '@angular/core';
import { McLine, McLineSetter } from '@ptsecurity/mosaic/core';


export class McListBase {}

@Component({
    selector: 'mc-list',
    host: { class: 'mc-list' },
    template: '<ng-content></ng-content>',
    styleUrls: ['./list.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class McList extends McListBase {}


// Boilerplate for applying mixins to McListItem.
export class McListItemBase {}

@Component({
    selector: 'mc-list-item, a[mc-list-item]',
    host: {
        class: 'mc-list-item',
        '(focus)': 'handleFocus()',
        '(blur)': 'handleBlur()'
    },
    templateUrl: './list-item.html',
    encapsulation: ViewEncapsulation.None,
    preserveWhitespaces: false,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class McListItem extends McListItemBase implements AfterContentInit {
    @ContentChildren(McLine) lines: QueryList<McLine>;

    private lineSetter: McLineSetter;

    constructor(private _element: ElementRef) {
        super();
    }

    ngAfterContentInit() {
        this.lineSetter = new McLineSetter(this.lines, this._element);
    }

    handleFocus() {
        this._element.nativeElement.classList.add('mc-focused');
    }

    handleBlur() {
        this._element.nativeElement.classList.remove('mc-focused');
    }

    getHostElement(): HTMLElement {
        return this._element.nativeElement;
    }
}
