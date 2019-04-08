import {
    ChangeDetectionStrategy,
    Component,
    Directive,
    ElementRef,
    OnDestroy,
    ViewEncapsulation
} from '@angular/core';
import { FocusMonitor } from '@ptsecurity/cdk/a11y';
import { mixinColor, mixinDisabled, CanColor, CanDisable, CanDisableCtor, CanColorCtor } from '@ptsecurity/mosaic/core';


@Directive({
    selector: 'button[mc-button], a[mc-button]',
    host: {
        '[class.mc-button]': '!isIconButton',
        '[class.mc-icon-button]': 'isIconButton'
    }
})
export class McButtonCssStyler {
    nativeElement: Element;

    get isIconButton(): boolean {
        return this.icons.length > 0;
    }

    private icons: HTMLElement[] = [];

    constructor(elementRef: ElementRef) {
        this.nativeElement = elementRef.nativeElement;
    }

    ngAfterContentInit() {
        /**
         * Here we had to use native selectors due to number of angular issues about ContentChildren limitations
         * https://github.com/angular/angular/issues/16299
         * https://github.com/angular/angular/issues/8563
         * https://github.com/angular/angular/issues/14769
         */
        this.icons = Array.from(this.nativeElement.querySelectorAll('.mc-icon'));
        this.addClassModificatorForIcons();
    }

    private addClassModificatorForIcons() {
        const twoIcons = 2;

        if (this.icons.length === 1) {
            const iconElement = this.icons[0];
            const COMMENT_NODE = 8;

            if (!iconElement.previousElementSibling && !iconElement.nextElementSibling) {
                if (iconElement.nextSibling && iconElement.nextSibling.nodeType !== COMMENT_NODE) {
                    iconElement.classList.add('mc-icon_left');
                    this.nativeElement.classList.add('mc-icon-button_left');
                }

                if (iconElement.previousSibling && iconElement.previousSibling.nodeType !== COMMENT_NODE) {
                    iconElement.classList.add('mc-icon_right');
                    this.nativeElement.classList.add('mc-icon-button_right');
                }
            }
        } else if (this.icons.length === twoIcons) {
            const firstIconElement = this.icons[0];
            const secondIconElement = this.icons[1];

            firstIconElement.classList.add('mc-icon_left');
            secondIconElement.classList.add('mc-icon_right');
        }
    }
}

export class McButtonBase {
    // tslint:disable-next-line:naming-convention
    constructor(public _elementRef: ElementRef) {}
}

// tslint:disable-next-line:naming-convention
export const McButtonMixinBase:
    CanDisableCtor &
    CanColorCtor &
    typeof McButtonBase =
        mixinColor(mixinDisabled(McButtonBase));


@Component({
    selector: 'button[mc-button]',
    templateUrl: './button.component.html',
    styleUrls: ['./button.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    inputs: ['disabled', 'color'],
    host: {
        '[disabled]': 'disabled || null'
    }
})
export class McButton extends McButtonMixinBase implements OnDestroy, CanDisable, CanColor {
    constructor(elementRef: ElementRef, private _focusMonitor: FocusMonitor) {
        super(elementRef);

        this._focusMonitor.monitor(this._elementRef.nativeElement, true);
    }

    ngOnDestroy() {
        this._focusMonitor.stopMonitoring(this._elementRef.nativeElement);
    }

    focus(): void {
        this.getHostElement().focus();
    }

    getHostElement() {
        return this._elementRef.nativeElement;
    }
}


@Component({
    selector: 'a[mc-button]',
    templateUrl: './button.component.html',
    styleUrls: ['./button.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    inputs: ['disabled', 'color'],
    host: {
        '[attr.tabindex]': 'disabled ? -1 : 0',
        '[attr.disabled]': 'disabled || null',
        '(click)': 'haltDisabledEvents($event)'
    }
})
export class McAnchor extends McButton {
    constructor(focusMonitor: FocusMonitor, elementRef: ElementRef) {
        super(elementRef, focusMonitor);
    }

    haltDisabledEvents(event: Event) {
        if (this.disabled) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    }
}
