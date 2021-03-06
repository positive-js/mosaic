import { FocusMonitor } from '@angular/cdk/a11y';
import {
    ChangeDetectionStrategy,
    Component,
    Directive,
    ElementRef,
    OnDestroy,
    ViewEncapsulation,
    Renderer2
} from '@angular/core';
import {
    mixinColor,
    mixinDisabled,
    mixinTabIndex,
    CanColor,
    CanDisable,
    CanDisableCtor,
    CanColorCtor,
    HasTabIndexCtor
} from '@ptsecurity/mosaic/core';


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

    constructor(elementRef: ElementRef, private renderer: Renderer2) {
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
        const [firstIconElement, secondIconElement] = this.icons;

        if (this.icons.length === 1) {
            const COMMENT_NODE = 8;

            if (firstIconElement.nextSibling && firstIconElement.nextSibling.nodeType !== COMMENT_NODE) {
                this.renderer.addClass(firstIconElement, 'mc-icon_left');
                this.renderer.addClass(this.nativeElement, 'mc-icon-button_left');
            }

            if (firstIconElement.previousSibling && firstIconElement.previousSibling.nodeType !== COMMENT_NODE) {
                this.renderer.addClass(firstIconElement, 'mc-icon_right');
                this.renderer.addClass(this.nativeElement, 'mc-icon-button_right');
            }
        } else if (this.icons.length === twoIcons) {
            this.renderer.addClass(firstIconElement, 'mc-icon_left');
            this.renderer.addClass(secondIconElement, 'mc-icon_right');
        }
    }
}

export class McButtonBase {
    // tslint:disable-next-line:naming-convention
    constructor(public _elementRef: ElementRef) {}
}

// tslint:disable-next-line:naming-convention
export const McButtonMixinBase: HasTabIndexCtor & CanDisableCtor & CanColorCtor &
    typeof McButtonBase = mixinTabIndex(mixinColor(mixinDisabled(McButtonBase)));


@Component({
    selector: 'button[mc-button]',
    templateUrl: './button.component.html',
    styleUrls: ['./button.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    inputs: ['disabled', 'color'],
    host: {
        '[attr.disabled]': 'disabled || null'
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

    focusViaKeyboard(): void {
        this._focusMonitor.focusVia(this.getHostElement(), 'keyboard');
    }

    getHostElement() {
        return this._elementRef.nativeElement;
    }
}


@Component({
    selector: 'a[mc-button]',
    templateUrl: './button.component.html',
    styleUrls: ['button.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    inputs: ['disabled', 'color', 'tabIndex'],
    host: {
        '[attr.tabindex]': 'tabIndex',
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
