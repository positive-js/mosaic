import {
    ChangeDetectionStrategy,
    Component,
    Directive,
    ElementRef,
    OnDestroy,
    QueryList,
    ViewEncapsulation,
    ContentChildren
} from '@angular/core';

import { FocusMonitor } from '@ptsecurity/cdk/a11y';
import { Platform } from '@ptsecurity/cdk/platform';

import { mixinColor, mixinDisabled, CanColor, CanDisable } from '@ptsecurity/mosaic/core';
import { McIcon } from '@ptsecurity/mosaic/icon';


@Directive({
    selector: 'button, a[mc-button]',
    host: { class: 'mc-button mc-olololo' }
})
export class McButtonCSSStyler {}


@Directive({
    selector: 'button[mc-xs-button], a[mc-xs-button]',
    host: { class: 'mc-button mc-button_xs' }
})
export class McXSButtonCSSStyler {}


@Directive({
    selector: 'button[mc-sm-button], a[mc-sm-button]',
    host: { class: 'mc-button mc-button_sm' }
})
export class McSMButtonCSSStyler {}


@Directive({
    selector: 'button[mc-lg-button], a[mc-lg-button]',
    host: { class: 'mc-button mc-button_lg' }
})
export class McLGButtonCSSStyler {}


@Directive({
    selector: 'button[mc-xl-button], a[mc-xl-button]',
    host: { class: 'mc-button mc-button_xl' }
})
export class McXLButtonCSSStyler {}


@Directive({
    selector: 'button[mc-icon-button], a[mc-icon-button]',
    queries: {
        contentChildren: new ContentChildren(McIcon)
    },
    host: { class: 'mc-icon-button' }
})
export class McIconButtonCSSStyler {
    nativeElement: Element;

    contentChildren: QueryList<McIcon>;

    constructor(elementRef: ElementRef) {
        this.nativeElement = elementRef.nativeElement;
    }

    ngAfterContentInit() {
        this._addClassModificatorForIcons();
    }

    _addClassModificatorForIcons() {
        const twoIcons = 2;
        const icons = this.contentChildren.map((item) => item._elementRef.nativeElement);

        if (icons.length === 1) {
            const iconElement = icons[0];

            if (!iconElement.previousElementSibling && !iconElement.nextElementSibling) {
                if (iconElement.nextSibling) {
                    iconElement.classList.add('mc-icon_left');
                    this.nativeElement.classList.add('mc-icon-button_left');
                }

                if (iconElement.previousSibling) {
                    iconElement.classList.add('mc-icon_right');
                    this.nativeElement.classList.add('mc-icon-button_right');
                }
            }
        } else if (icons.length === twoIcons) {
            const firstIconElement = icons[0];
            const secondIconElement = icons[1];

            firstIconElement.classList.add('mc-icon_left');
            secondIconElement.classList.add('mc-icon_right');
        }
    }
}


export class McButtonBase {
    constructor(public _elementRef: ElementRef) {}
}

export const _McButtonMixinBase = mixinColor(mixinDisabled(McButtonBase));


@Component({
    selector: `
        button[mc-button],
        button[mc-xs-button],
        button[mc-sm-button],
        button[mc-lg-button],
        button[mc-xl-button]
    `,
    templateUrl: './button.component.html',
    styleUrls: ['./button.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    inputs: ['disabled', 'color'],
    host: {
        '[disabled]': 'disabled || null'
    }
})
export class McButton extends _McButtonMixinBase implements OnDestroy, CanDisable, CanColor {
    constructor(elementRef: ElementRef, private _platform: Platform, private _focusMonitor: FocusMonitor) {
        super(elementRef);

        this._focusMonitor.monitor(this._elementRef.nativeElement, true);
    }

    ngOnDestroy() {
        this._focusMonitor.stopMonitoring(this._elementRef.nativeElement);
    }

    focus(): void {
        this._getHostElement().focus();
    }

    _getHostElement() {
        return this._elementRef.nativeElement;
    }
}


@Component({
    selector: 'a[mc-button], a[mc-xs-button], a[mc-sm-button], a[mc-lg-button], a[mc-xl-button]',
    templateUrl: './button.component.html',
    styleUrls: ['./button.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    inputs: ['disabled', 'color'],
    host: {
        '[attr.tabindex]': 'disabled ? -1 : 0',
        '[attr.disabled]': 'disabled || null',
        '(click)': '_haltDisabledEvents($event)'
    }
})
export class McAnchor extends McButton {
    constructor(platform: Platform, focusMonitor: FocusMonitor, elementRef: ElementRef) {
        super(elementRef, platform, focusMonitor);
    }

    _haltDisabledEvents(event: Event) {
        if (this.disabled) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    }
}


@Component({
    selector: 'button[mc-icon-button]',
    templateUrl: './button.component.html',
    styleUrls: ['./button.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    inputs: ['disabled', 'color'],
    host: {
        '[attr.tabindex]': 'disabled ? -1 : 0',
        '[attr.disabled]': 'disabled || null'
    }
})
export class McIconButton extends McButton {
    constructor(platform: Platform, focusMonitor: FocusMonitor, elementRef: ElementRef) {
        super(elementRef, platform, focusMonitor);
    }

    _haltDisabledEvents(event: Event) {
        if (this.disabled) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    }
}
