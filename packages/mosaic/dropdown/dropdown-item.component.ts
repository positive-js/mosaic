import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { DOCUMENT } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    OnDestroy,
    ViewEncapsulation,
    Inject,
    Optional,
    ViewChild
} from '@angular/core';
import { IFocusableOption } from '@ptsecurity/cdk/a11y';
import { CanDisable, CanDisableCtor, HasTabIndexCtor, mixinDisabled, mixinTabIndex } from '@ptsecurity/mosaic/core';
import { Subject } from 'rxjs';

import { MC_DROPDOWN_PANEL, McDropdownPanel } from './dropdown.types';


// Boilerplate for applying mixins to McDropdownItem.
/** @docs-private */
export class McDropdownItemBase {}
// tslint:disable-next-line:naming-convention
export const McDropdownItemMixinBase:
    HasTabIndexCtor & CanDisableCtor & typeof McDropdownItemBase = mixinTabIndex(mixinDisabled(McDropdownItemBase));

/**
 * This directive is intended to be used inside an mc-dropdown tag.
 * It exists mostly to set the role attribute.
 */
@Component({
    selector: 'mc-dropdown-item, [mc-dropdown-item]',
    exportAs: 'mcDropdownItem',
    templateUrl: 'dropdown-item.html',
    styleUrls: ['dropdown-item.scss'],
    inputs: ['disabled', 'tabIndex'],
    host: {
        class: 'mc-dropdown-item',
        '[class.mc-dropdown-item_highlighted]': 'highlighted',

        '[attr.disabled]': 'disabled || null',
        '[attr.tabindex]': 'tabIndex',

        '(click)': 'haltDisabledEvents($event)',
        '(mouseenter)': 'handleMouseEnter()'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class McDropdownItem extends McDropdownItemMixinBase implements IFocusableOption, CanDisable, OnDestroy {
    @ViewChild('content', { static: false }) content;

    /** Stream that emits when the dropdown item is hovered. */
    readonly hovered: Subject<McDropdownItem> = new Subject<McDropdownItem>();

    /** Whether the dropdown item is highlighted. */
    highlighted: boolean = false;

    /** Whether the dropdown item acts as a trigger for a nested dropdown. */
    triggersNestedDropdown: boolean = false;

    constructor(
        private elementRef: ElementRef<HTMLElement>,
        private focusMonitor: FocusMonitor,
        @Inject(DOCUMENT) private document: any,
        @Optional() @Inject(MC_DROPDOWN_PANEL) private parentDropdownPanel?: McDropdownPanel<McDropdownItem>
    ) {
        super();

        if (focusMonitor) {
            // Start monitoring the element so it gets the appropriate focused classes. We want
            // to show the focus style for dropdown items only when the focus was not caused by a
            // mouse or touch interaction.
            focusMonitor.monitor(this.elementRef.nativeElement, false);
        }

        if (parentDropdownPanel?.addItem) {
            parentDropdownPanel.addItem(this);
        }
    }

    /** Focuses the dropdown item. */
    focus(origin: FocusOrigin = 'program'): void {
        if (this.focusMonitor) {
            this.focusMonitor.focusVia(this.getHostElement(), origin);
        } else {
            this.getHostElement().focus();
        }
    }

    ngOnDestroy() {
        if (this.focusMonitor) {
            this.focusMonitor.stopMonitoring(this.elementRef.nativeElement);
        }

        if (this.parentDropdownPanel?.removeItem) {
            this.parentDropdownPanel.removeItem(this);
        }

        this.hovered.complete();
    }

    /** Returns the host DOM element. */
    getHostElement(): HTMLElement {
        return this.elementRef.nativeElement;
    }

    /** Prevents the default element actions if it is disabled. */
    haltDisabledEvents(event: MouseEvent): void {
        if (this.disabled) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    /** Emits to the hover stream. */
    handleMouseEnter() {
        this.hovered.next(this);
    }

    /** Gets the label to be used when determining whether the option should be focused. */
    getLabel(): string {
        const element: HTMLElement = this.content.nativeElement;
        // tslint:disable-next-line:no-magic-numbers
        const textNodeType = this.document ? this.document.TEXT_NODE : 3;
        let output = '';

        if (element.childNodes) {
            const length = element.childNodes.length;

            // Go through all the top-level text nodes and extract their text.
            // We skip anything that's not a text node to prevent the text from
            // being thrown off by something like an icon.
            for (let i = 0; i < length; i++) {
                if (element.childNodes[i].nodeType === textNodeType) {
                    output += element.childNodes[i].textContent;
                }
            }
        }

        return output.trim();
    }
}
