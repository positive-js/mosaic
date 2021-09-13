import {
    Attribute,
    ChangeDetectionStrategy,
    Component,
    Directive,
    ElementRef,
    ViewEncapsulation
} from '@angular/core';
import { mixinColor, CanColor, ThemePalette } from '@ptsecurity/mosaic/core';


@Directive({
    selector: '[mc-icon]',
    host: { class: 'mc mc-icon' }
})
// tslint:disable-next-line:naming-convention
export class McIconCSSStyler {}


export class McIconBase {
    // tslint:disable-next-line:naming-convention
    constructor(public _elementRef: ElementRef) {}
}

// tslint:disable-next-line: naming-convention
export const McIconMixinBase = mixinColor(McIconBase, ThemePalette.Empty);


@Component({
    selector: `[mc-icon]`,
    template: '<ng-content></ng-content>',
    styleUrls: ['icon.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    inputs: ['color']
})
export class McIcon extends McIconMixinBase implements CanColor {
    constructor(elementRef: ElementRef, @Attribute('mc-icon') iconName: string) {
        super(elementRef);

        if (iconName) {
            elementRef.nativeElement.classList.add(iconName);
        }
    }

    getHostElement() {
        return this._elementRef.nativeElement;
    }
}
