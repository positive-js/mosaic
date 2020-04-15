// todo пока не делаем, перенесено из материала, но у нас в доках таких простых списков нет.
import {
    AfterContentInit, ChangeDetectionStrategy, Component, ContentChildren, ElementRef, QueryList,
    ViewEncapsulation
} from '@angular/core';
import { McLine, McLineSetter } from '@ptsecurity/mosaic/core';


@Component({
    selector: 'mc-list',
    host: { class: 'mc-list' },
    template: '<ng-content></ng-content>',
    styleUrls: ['./list.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class McList {}


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
export class McListItem implements AfterContentInit {
    @ContentChildren(McLine) lines: QueryList<McLine>;

    constructor(private elementRef: ElementRef) {}

    ngAfterContentInit() {
        // tslint:disable-next-line:no-unused-expression
        new McLineSetter(this.lines, this.elementRef);
    }

    handleFocus() {
        this.elementRef.nativeElement.classList.add('mc-focused');
    }

    handleBlur() {
        this.elementRef.nativeElement.classList.remove('mc-focused');
    }

    getHostElement(): HTMLElement {
        return this.elementRef.nativeElement;
    }
}
