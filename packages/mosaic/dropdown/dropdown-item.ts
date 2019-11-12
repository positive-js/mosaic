import { DOCUMENT } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    OnDestroy,
    ViewEncapsulation,
    Inject,
    Optional,
    Input,
    ViewChild
} from '@angular/core';
import { IFocusableOption, FocusMonitor, FocusOrigin } from '@ptsecurity/cdk/a11y';
import { CanDisable, CanDisableCtor, mixinDisabled } from '@ptsecurity/mosaic/core';
import { Subject } from 'rxjs';

import { MC_DROPDOWN_PANEL, McDropdownPanel } from './dropdown-panel';


// Boilerplate for applying mixins to McDropdownItem.
/** @docs-private */
export class McDropdownItemBase {}
// tslint:disable-next-line:naming-convention
export const McDropdownItemMixinBase: CanDisableCtor & typeof McDropdownItemBase =
    mixinDisabled(McDropdownItemBase);

/**
 * This directive is intended to be used inside an mc-dropdown tag.
 * It exists mostly to set the role attribute.
 */
@Component({
    selector: 'mc-dropdown-item, [mc-dropdown-item]',
    exportAs: 'mcDropdownItem',
    inputs: ['disabled'],
    host: {
        '[attr.role]': 'role',
        class: 'mc-dropdown__item',
        '[class.mc-dropdown__item_highlighted]': 'highlighted',
        '[attr.tabindex]': 'getTabIndex()',
        '[attr.aria-disabled]': 'disabled.toString()',
        '[attr.disabled]': 'disabled || null',
        '(click)': 'checkDisabled($event)',
        '(mouseenter)': 'handleMouseEnter()'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    template: `
        <div #content>
            <ng-content></ng-content>
        </div>
        <i *ngIf="triggersNestedDropdown" mc-icon="mc-angle-right-M_16" class="mc-dropdown__trigger"></i>
    `
})
export class McDropdownItem extends McDropdownItemMixinBase
    implements IFocusableOption, CanDisable, OnDestroy {

    /** ARIA role for the dropdown item. */
    @Input() role: 'menuitem' | 'menuitemradio' | 'menuitemcheckbox' = 'menuitem';

    @ViewChild('content', {static: false}) content;

    /** Stream that emits when the dropdown item is hovered. */
    readonly hovered: Subject<McDropdownItem> = new Subject<McDropdownItem>();

    /** Whether the dropdown item is highlighted. */
    highlighted: boolean = false;

    /** Whether the dropdown item acts as a trigger for a nested dropdown. */
    triggersNestedDropdown: boolean = false;

    private document: Document;

    constructor(
        private _elementRef: ElementRef<HTMLElement>,
        @Inject(DOCUMENT) document: any,
        private _focusMonitor: FocusMonitor,
        @Inject(MC_DROPDOWN_PANEL) @Optional() private _parentDropdownPanel?: McDropdownPanel<McDropdownItem>) {
        super();

        if (_focusMonitor) {
            // Start monitoring the element so it gets the appropriate focused classes. We want
            // to show the focus style for dropdown items only when the focus was not caused by a
            // mouse or touch interaction.
            _focusMonitor.monitor(this._elementRef.nativeElement, false);
        }

        if (_parentDropdownPanel && _parentDropdownPanel.addItem) {
            _parentDropdownPanel.addItem(this);
        }

        this.document = document;
    }

    /** Focuses the dropdown item. */
    focus(origin: FocusOrigin = 'program'): void {
        if (this._focusMonitor) {
            this._focusMonitor.focusVia(this.getHostElement(), origin);
        } else {
            this.getHostElement().focus();
        }
    }

    ngOnDestroy() {
        if (this._focusMonitor) {
            this._focusMonitor.stopMonitoring(this._elementRef.nativeElement);
        }

        if (this._parentDropdownPanel && this._parentDropdownPanel.removeItem) {
            this._parentDropdownPanel.removeItem(this);
        }

        this.hovered.complete();
    }

    /** Used to set the `tabindex`. */
    getTabIndex(): string {
        return this.disabled ? '-1' : '0';
    }

    /** Returns the host DOM element. */
    getHostElement(): HTMLElement {
        return this._elementRef.nativeElement;
    }

    /** Prevents the default element actions if it is disabled. */
    checkDisabled(event: Event): void {
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
