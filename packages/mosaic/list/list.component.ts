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


/**
 * Directive whose purpose is to add the mc- CSS styling to this selector.
 * @docs-private
 */
@Directive({
    selector: '[mc-subheader], [mcSubheader]',
    host: { class: 'mc-subheader' }
})
export class McListSubheaderCssStyler {}


// Boilerplate for applying mixins to McListItem.
export class McListItemBase {}

@Component({
    selector: 'mc-list-item, a[mc-list-item]',
    host: {
        class: 'mc-list-item',
        '(focus)': '_handleFocus()',
        '(blur)': '_handleBlur()'
    },
    templateUrl: './list-item.html',
    encapsulation: ViewEncapsulation.None,
    preserveWhitespaces: false,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class McListItem extends McListItemBase implements AfterContentInit {
    @ContentChildren(McLine) _lines: QueryList<McLine>;

    private _lineSetter: McLineSetter;

    constructor(private _element: ElementRef) {
        super();
    }

    ngAfterContentInit() {
        this._lineSetter = new McLineSetter(this._lines, this._element);
    }

    _handleFocus() {
        this._element.nativeElement.classList.add('mc-focused');
    }

    _handleBlur() {
        this._element.nativeElement.classList.remove('mc-focused');
    }

    _getHostElement(): HTMLElement {
        return this._element.nativeElement;
    }
}
