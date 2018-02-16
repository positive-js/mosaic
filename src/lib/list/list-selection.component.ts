import {
    Attribute,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    OnDestroy,
    ViewEncapsulation
} from '@angular/core';

import { CanColor, CanDisable, mixinColor, mixinDisabled } from '../core/common-behaviors/index';
import { HasTabIndex, mixinTabIndex } from '../core/index';


export class McListSelectionBase {
    constructor(public _elementRef: ElementRef) {}
}

export const _McListSelectionMixinBase = mixinColor(mixinTabIndex(mixinDisabled(McListSelectionBase)));

@Component({
    selector: 'mc-list-selection',
    template: '<ng-content></ng-content>',
    styleUrls: ['./list.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'mc-list-selection, mc-list-selection_horizontal',
        '[tabIndex]': 'tabIndex',
        '(focus)': 'focus()',
        '(blur)': '_onTouched()',
        '(keydown)': '_keydown($event)'
    }
})
export class McListSelection extends _McListSelectionMixinBase
    implements OnDestroy, CanDisable, HasTabIndex, CanColor {

    horizontal: boolean;

    constructor(private elementRef: ElementRef, @Attribute('tabindex') tabIndex: string) {
        super(elementRef);

        this.tabIndex = parseInt(tabIndex) || 0;
    }

    ngOnDestroy() {}

    focus() {
        this._elementRef.nativeElement.focus();
    }

    _onTouched: () => void = () => {};
}
