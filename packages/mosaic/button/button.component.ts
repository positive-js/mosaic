import { FocusMonitor } from '@angular/cdk/a11y';
import {
    ChangeDetectionStrategy,
    Component,
    Directive,
    ElementRef,
    OnDestroy,
    ViewEncapsulation,
    Renderer2,
    QueryList,
    ContentChildren,
    AfterContentInit
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
import { McIcon } from '@ptsecurity/mosaic/icon';


@Directive({
    selector: 'button[mc-button], a[mc-button]',
    host: {
        '[class.mc-button]': '!isIconButton',
        '[class.mc-icon-button]': 'isIconButton'
    }
})
export class McButtonCssStyler implements AfterContentInit {
    @ContentChildren(McIcon, { descendants: true }) icons: QueryList<McIcon>;

    nativeElement: HTMLElement;

    get isIconButton(): boolean {
        return this.icons.length > 0;
    }

    constructor(elementRef: ElementRef, private renderer: Renderer2) {
        this.nativeElement = elementRef.nativeElement;
    }

    ngAfterContentInit() {
        this.updateClassModifierForIcons();
    }

    updateClassModifierForIcons() {
        const twoIcons = 2;
        const [firstIconElement, secondIconElement] = this.icons.map((item) => item.getHostElement());

        if (this.icons.length === 1) {
            this.renderer.removeClass(firstIconElement, 'mc-icon_left');
            this.renderer.removeClass(this.nativeElement, 'mc-icon-button_left');
            this.renderer.removeClass(firstIconElement, 'mc-icon_right');
            this.renderer.removeClass(this.nativeElement, 'mc-icon-button_right');

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
    inputs: ['tabIndex', 'disabled', 'color'],
    host: {
        '[attr.disabled]': 'disabled || null',
        '[attr.tabIndex]': 'tabIndex',

        '(focus)': 'onFocus($event)',
        '(blur)': 'onBlur()'
    }
})
export class McButton extends McButtonMixinBase implements OnDestroy, CanDisable, CanColor {
    hasFocus: boolean = false;

    constructor(elementRef: ElementRef, private focusMonitor: FocusMonitor) {
        super(elementRef);

        this.focusMonitor.monitor(this._elementRef.nativeElement, true);
    }

    ngOnDestroy() {
        this.focusMonitor.stopMonitoring(this._elementRef.nativeElement);
    }

    onFocus($event) {
        $event.stopPropagation();

        this.hasFocus = true;
    }

    onBlur() {
        this.hasFocus = false;
    }

    getHostElement() {
        return this._elementRef.nativeElement;
    }

    focus(): void {
        this.hasFocus = true;

        this.getHostElement().focus();
    }

    focusViaKeyboard(): void {
        this.hasFocus = true;

        this.focusMonitor.focusVia(this.getHostElement(), 'keyboard');
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
