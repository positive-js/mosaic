import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    ElementRef,
    EventEmitter,
    Inject,
    InjectionToken,
    Input,
    Output,
    QueryList,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { ActiveDescendantKeyManager } from '@ptsecurity/cdk/a11y';
import { MC_OPTION_PARENT_COMPONENT, McOptgroup, McOption } from '@ptsecurity/mosaic/core';


/**
 * Autocomplete IDs need to be unique across components, so this counter exists outside of
 * the component definition.
 */
let uniqueAutocompleteIdCounter = 0;

export class McAutocompleteSelectedEvent {
    constructor(public source: McAutocomplete, public option: McOption) {}
}

/** Default `mc-autocomplete` options that can be overridden. */
// tslint:disable-next-line naming-convention
export interface McAutocompleteDefaultOptions {
    /** Whether the first option should be highlighted when an autocomplete panel is opened. */
    autoActiveFirstOption?: boolean;
}

/** Injection token to be used to override the default options for `mc-autocomplete`. */
export const MC_AUTOCOMPLETE_DEFAULT_OPTIONS =
    new InjectionToken<McAutocompleteDefaultOptions>('mc-autocomplete-default-options', {
        providedIn: 'root',
        factory: MC_AUTOCOMPLETE_DEFAULT_OPTIONS_FACTORY
    });

// tslint:disable-next-line naming-convention
export function MC_AUTOCOMPLETE_DEFAULT_OPTIONS_FACTORY(): McAutocompleteDefaultOptions {
    return { autoActiveFirstOption: true };
}

@Component({
    selector: 'mc-autocomplete',
    exportAs: 'mcAutocomplete',
    templateUrl: 'autocomplete.html',
    styleUrls: ['autocomplete.scss'],
    host: {
        class: 'mc-autocomplete'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{
        provide: MC_OPTION_PARENT_COMPONENT, useExisting: McAutocomplete
    }]
})
export class McAutocomplete implements AfterContentInit {
    /** Unique ID to be used by autocomplete trigger's "aria-owns" property. */
    id: string = `mc-autocomplete-${uniqueAutocompleteIdCounter++}`;

    /** Manages active item in option list based on key events. */
    keyManager: ActiveDescendantKeyManager<McOption>;

    /** Whether the autocomplete panel should be visible, depending on option length. */
    showPanel: boolean = false;

    @ViewChild(TemplateRef, {static: true}) template: TemplateRef<any>;

    @ViewChild('panel', {static: false}) panel: ElementRef;

    @ContentChildren(McOption, { descendants: true }) options: QueryList<McOption>;

    @ContentChildren(McOptgroup) optionGroups: QueryList<McOptgroup>;

    /** Function that maps an option's control value to its display value in the trigger. */
    @Input() displayWith: ((value: any) => string) | null = null;

    /**
     * Specify the width of the autocomplete panel.  Can be any CSS sizing value, otherwise it will
     * match the width of its host.
     */
    @Input() panelWidth: string | number;

    /** Event that is emitted whenever an option from the list is selected. */
    @Output() readonly optionSelected: EventEmitter<McAutocompleteSelectedEvent> =
        new EventEmitter<McAutocompleteSelectedEvent>();

    /** Event that is emitted when the autocomplete panel is opened. */
    @Output() readonly opened: EventEmitter<void> = new EventEmitter<void>();

    /** Event that is emitted when the autocomplete panel is closed. */
    @Output() readonly closed: EventEmitter<void> = new EventEmitter<void>();

    /**
     * Takes classes set on the host mc-autocomplete element and applies them to the panel
     * inside the overlay container to allow for easy styling.
     */
    @Input('class')
    get classList() {
        return this._classList;
    }

    set classList(value: string) {
        if (value && value.length) {
            value.split(' ')
                .forEach((className) => this._classList[className.trim()] = true);

            this.elementRef.nativeElement.className = '';
        }
    }

    private _classList: any = {};

    /**
     * Whether the first option should be highlighted when the autocomplete panel is opened.
     * Can be configured globally through the `MC_AUTOCOMPLETE_DEFAULT_OPTIONS` token.
     */
    @Input()
    get autoActiveFirstOption(): boolean {
        return this._autoActiveFirstOption;
    }

    set autoActiveFirstOption(value: boolean) {
        this._autoActiveFirstOption = coerceBooleanProperty(value);
    }

    private _autoActiveFirstOption: boolean;

    get isOpen(): boolean {
        return this._isOpen && this.showPanel;
    }

    set isOpen(value: boolean) {
        this._isOpen = value;
    }

    private _isOpen: boolean = false;

    constructor(
        private changeDetectorRef: ChangeDetectorRef,
        private elementRef: ElementRef<HTMLElement>,
        @Inject(MC_AUTOCOMPLETE_DEFAULT_OPTIONS) defaults: McAutocompleteDefaultOptions
    ) {
        this._autoActiveFirstOption = !!defaults.autoActiveFirstOption;
    }

    ngAfterContentInit() {
        this.keyManager = new ActiveDescendantKeyManager<McOption>(this.options);
        this.setVisibility();
    }

    setScrollTop(scrollTop: number): void {
        if (this.panel) {
            this.panel.nativeElement.scrollTop = scrollTop;
        }
    }

    getScrollTop(): number {
        return this.panel ? this.panel.nativeElement.scrollTop : 0;
    }

    setVisibility() {
        this.showPanel = !!this.options.length;
        this._classList['mc-autocomplete_visible'] = this.showPanel;
        this._classList['mc-autocomplete_hidden'] = !this.showPanel;

        this.changeDetectorRef.markForCheck();
    }

    emitSelectEvent(option: McOption): void {
        const event = new McAutocompleteSelectedEvent(this, option);

        this.optionSelected.emit(event);
    }

    onKeydown(event: KeyboardEvent): any {
        this.keyManager.onKeydown(event);
    }
}

