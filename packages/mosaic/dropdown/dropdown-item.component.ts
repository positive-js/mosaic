import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    OnDestroy,
    ViewEncapsulation,
    Inject,
    Optional,
    AfterViewInit,
    HostListener,
    ContentChild
} from '@angular/core';
import { IFocusableOption } from '@ptsecurity/cdk/a11y';
import { CanDisable, CanDisableCtor, mixinDisabled } from '@ptsecurity/mosaic/core';
import { McIcon } from '@ptsecurity/mosaic/icon';
import { Subject } from 'rxjs';

import { MC_DROPDOWN_PANEL, McDropdownPanel } from './dropdown.types';


// Boilerplate for applying mixins to McDropdownItem.
/** @docs-private */
class McDropdownItemBase {}
// tslint:disable-next-line:naming-convention
const McDropdownItemMixinBase: CanDisableCtor & typeof McDropdownItemBase = mixinDisabled(McDropdownItemBase);

/**
 * This directive is intended to be used inside an mc-dropdown tag.
 * It exists mostly to set the role attribute.
 */
@Component({
    selector: 'mc-dropdown-item, [mc-dropdown-item]',
    exportAs: 'mcDropdownItem',
    templateUrl: 'dropdown-item.html',
    styleUrls: ['dropdown-item.scss'],
    inputs: ['disabled'],
    host: {
        class: 'mc-dropdown-item',
        '[class.mc-dropdown-item_with-icon]': 'icon',
        '[class.mc-dropdown-item_highlighted]': 'highlighted',

        '[attr.disabled]': 'disabled || null',
        '[attr.tabindex]': 'getTabIndex()'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class McDropdownItem extends McDropdownItemMixinBase implements
    IFocusableOption, CanDisable, AfterViewInit, OnDestroy {

    @ContentChild(McIcon) icon: McIcon;

    /** Stream that emits when the dropdown item is hovered. */
    readonly hovered = new Subject<McDropdownItem>();

    /** Stream that emits when the menu item is focused. */
    readonly focused = new Subject<McDropdownItem>();

    /** Whether the dropdown item is highlighted. */
    highlighted: boolean = false;

    /** Whether the dropdown item acts as a trigger for a nested dropdown. */
    isNested: boolean = false;

    constructor(
        private elementRef: ElementRef<HTMLElement>,
        private focusMonitor: FocusMonitor,
        @Inject(MC_DROPDOWN_PANEL) @Optional() public parentDropdownPanel?: McDropdownPanel
    ) {
        super();
    }

    ngAfterViewInit() {
        if (this.focusMonitor) {
            // Start monitoring the element so it gets the appropriate focused classes. We want
            // to show the focus style for menu items only when the focus was not caused by a
            // mouse or touch interaction.
            this.focusMonitor.monitor(this.elementRef, false);
        }
    }

    ngOnDestroy() {
        if (this.focusMonitor) {
            this.focusMonitor.stopMonitoring(this.elementRef);
        }

        this.hovered.complete();
        this.focused.complete();
    }

    resetStyles() {
        this.getHostElement().classList.remove('cdk-keyboard-focused');
    }

    /** Focuses the dropdown item. */
    focus(origin?: FocusOrigin, options?: FocusOptions): void {
        if (this.focusMonitor && origin) {
            this.focusMonitor.focusVia(this.getHostElement(), origin, options);
        } else {
            this.getHostElement().focus(options);
        }

        this.focused.next(this);
    }

    /** Returns the host DOM element. */
    getHostElement(): HTMLElement {
        return this.elementRef.nativeElement;
    }

    /** Used to set the `tabindex`. */
    getTabIndex(): string {
        return this.disabled ? '-1' : '0';
    }

    /** Prevents the default element actions if it is disabled. */
    // We have to use a `HostListener` here in order to support both Ivy and ViewEngine.
    // In Ivy the `host` bindings will be merged when this class is extended, whereas in
    // ViewEngine they're overwritten.
    // TODO(crisbeto): we move this back into `host` once Ivy is turned on by default.
    // tslint:disable-next-line:no-host-decorator-in-concrete
    @HostListener('click', ['$event']) checkDisabled(event: Event): void {
        if (this.disabled) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    /** Emits to the hover stream. */
    // We have to use a `HostListener` here in order to support both Ivy and ViewEngine.
    // In Ivy the `host` bindings will be merged when this class is extended, whereas in
    // ViewEngine they're overwritten.
    // TODO(crisbeto): we move this back into `host` once Ivy is turned on by default.
    // tslint:disable-next-line:no-host-decorator-in-concrete
    @HostListener('mouseenter') handleMouseEnter() {
        this.hovered.next(this);
    }

    /** Gets the label to be used when determining whether the option should be focused. */
    getLabel(): string {
        const clone = this.getHostElement().cloneNode(true) as HTMLElement;
        const icons = clone.querySelectorAll('[mc-icon], .mc-icon');

        // Strip away icons so they don't show up in the text.
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < icons.length; i++) {
            const icon = icons[i];
            icon.parentNode?.removeChild(icon);
        }

        return clone.textContent?.trim() || '';
    }

    haltDisabledEvents(event: Event) {
        if (this.disabled) {
            event.preventDefault();
            event.stopImmediatePropagation();
            event.stopPropagation();
        }
    }
}
