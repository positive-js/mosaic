import {
    Component,
    Directive,
    ElementRef,
    Input,
    OnChanges,
    OnInit,
    Optional,
    SimpleChanges
} from '@angular/core';
import { ThemePalette } from '@ptsecurity/mosaic/core';

import { McSidepanelRef } from './sidepanel-ref';
import { McSidepanelService } from './sidepanel.service';


/**
 * Button that will close the current sidepanel.
 */
@Directive({
    selector: 'button[mc-sidepanel-close], button[mcSidepanelClose]',
    host: {
        '(click)': 'sidepanelRef.close(sidepanelResult)',
        class: 'mc-sidepanel-close'
    }
})
export class McSidepanelClose implements OnInit, OnChanges {
    @Input('mc-sidepanel-close') sidepanelResult: any;

    @Input('mcSidepanelClose') mcSidepanelClose: any;

    constructor(
        @Optional() public sidepanelRef: McSidepanelRef,
        private elementRef: ElementRef<HTMLElement>,
        private sidepanelService: McSidepanelService
    ) {}

    ngOnInit() {
        if (!this.sidepanelRef) {
            // When this directive is included in a sidepanel via TemplateRef (rather than being
            // in a Component), the SidepanelRef isn't available via injection because embedded
            // views cannot be given a custom injector. Instead, we look up the SidepanelRef by
            // ID.
            // This must occur in `onInit`, as the ID binding for the sidepanel container won't
            // be resolved at constructor time. We use setTimeout by same reason.
            setTimeout(() => {
                this.sidepanelRef = getClosestSidepanel(this.elementRef, this.sidepanelService.openedSidepanels)!;
            });
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        const proxiedChange = changes.mcSidepanelClose || changes.sidepanelResult;

        if (proxiedChange) {
            this.sidepanelResult = proxiedChange.currentValue;
        }
    }
}

/**
 * Header of a sidepanel.
 */
@Component({
    selector: 'mc-sidepanel-header',
    template: `
        <div class="mc-sidepanel-title">
            <ng-content></ng-content>
        </div>
        <button *ngIf="closeable" mc-sidepanel-close>
            <span class="mc-sidepanel-close-x">
                <i mc-icon="mc-close-L_16" class="mc-icon mc-icon_light" [color]="themePalette.Second"></i>
            </span>
        </button>
    `,
    host: {
        class: 'mc-sidepanel-header'
    }
})
export class McSidepanelHeader {
    themePalette = ThemePalette;

    @Input() closeable: boolean;
}

/**
 * Scrollable content container of a sidepanel.
 */
@Directive({
    selector: 'mc-sidepanel-body, [mc-sidepanel-body], mcSidepanelBody',
    host: {
        class: 'mc-sidepanel-body'
    }
})
export class McSidepanelBody {}

/**
 * Footer of a sidepanel.
 */
@Directive({
    selector: 'mc-sidepanel-footer, [mc-sidepanel-footer], mcSidepanelFooter',
    host: {
        class: 'mc-sidepanel-footer'
    }
})
export class McSidepanelFooter {}

/**
 * Actions block of a sidepanel footer.
 */
@Directive({
    selector: 'mc-sidepanel-actions, [mc-sidepanel-actions], mcSidepanelActions',
    host: {
        class: 'mc-sidepanel-actions'
    }
})
export class McSidepanelActions {}

/**
 * Finds the closest McSidepanelRef to an element by looking at the DOM.
 * @param element Element relative to which to look for a sidepanel.
 * @param openSidepanels References to the currently-open sidepanels.
 */
function getClosestSidepanel(element: ElementRef<HTMLElement>, openSidepanels: McSidepanelRef[]) {
    let parent: HTMLElement | null = element.nativeElement.parentElement;

    while (parent && !parent.classList.contains('mc-sidepanel-container')) {
        parent = parent.parentElement;
    }

    return parent ? openSidepanels.find((sidepanel) => sidepanel.id === parent!.id) : null;
}
