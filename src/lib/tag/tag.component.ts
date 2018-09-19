import {
    ElementRef,
    QueryList,
    ContentChildren,
    Component,
    ChangeDetectionStrategy,
    ViewEncapsulation
} from '@angular/core';

import { mixinColor, CanColor } from '@ptsecurity/mosaic/core';
import { McIcon } from '@ptsecurity/mosaic/icon';


export class McTagBase {
    constructor(public _elementRef: ElementRef) {}
}

export const _McTagMixinBase = mixinColor(McTagBase);


@Component({
    selector: 'mc-tag',
    templateUrl: 'tag.partial.html',
    styleUrls: ['./tag.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { class: 'mc-tag' },
    inputs: ['color']
})
export class McTag extends _McTagMixinBase implements CanColor {
    @ContentChildren(McIcon) contentChildren: QueryList<McIcon>;

    nativeElement: HTMLElement;

    constructor(elementRef: ElementRef) {
        super(elementRef);

        this.nativeElement = elementRef.nativeElement;
    }

    ngAfterContentInit() {
        this._addClassModificatorForIcons();
    }

    _addClassModificatorForIcons() {
        const icons = this.contentChildren.map((item) => item._elementRef.nativeElement);

        if (icons.length === 1) {
            const iconElement = icons[0];

            if (!iconElement.previousElementSibling && !iconElement.nextElementSibling) {
                if (iconElement.nextSibling) {
                    iconElement.classList.add('mc-icon_left');
                    this.nativeElement.classList.add('mc-left-icon');
                }

                if (iconElement.previousSibling) {
                    iconElement.classList.add('mc-icon_right');
                    this.nativeElement.classList.add('mc-right-icon');
                }
            }
        } else if (icons.length > 1) {
            const firstIconElement = icons[0];
            const secondIconElement = icons[1];

            firstIconElement.classList.add('mc-icon_left');
            secondIconElement.classList.add('mc-icon_right');
        }
    }
}
