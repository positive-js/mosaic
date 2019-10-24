import { TemplatePortal } from '@angular/cdk/portal';
import {
    ChangeDetectionStrategy,
    Component,
    ContentChild,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    SimpleChanges,
    TemplateRef,
    ViewChild,
    ViewContainerRef,
    ViewEncapsulation
} from '@angular/core';
import {
    CanDisable,
    CanDisableCtor,
    mixinDisabled
} from '@ptsecurity/mosaic/core';
import { Subject } from 'rxjs';

import { McTabContent } from './tab-content';
import { McTabLabel } from './tab-label';


export class McTabBase {}
// tslint:disable-next-line:naming-convention
export const McTabMixinBase: CanDisableCtor & typeof McTabBase = mixinDisabled(
    McTabBase
);

@Component({
    selector: 'mc-tab',
    // Create a template for the content of the <mc-tab> so that we can grab a reference to this
    // TemplateRef and use it in a Portal to render the tab content in the appropriate place in the
    // tab-group.
    template: '<ng-template><ng-content></ng-content></ng-template>',
    inputs: ['disabled'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    exportAs: 'mcTab'
})
export class McTab extends McTabMixinBase
    implements OnInit, CanDisable, OnChanges, OnDestroy {
    /** @docs-private */
    get content(): TemplatePortal | null {
        return this.contentPortal;
    }
    /** Content for the tab label given by `<ng-template mc-tab-label>`. */
    @ContentChild(McTabLabel, {static: false})
    templateLabel: McTabLabel;

    /**
     * Template provided in the tab content that will be used if present, used to enable lazy-loading
     */
    @ContentChild(McTabContent, { read: TemplateRef, static: true })
    explicitContent: TemplateRef<any>;

    /** Template inside the McTab view that contains an `<ng-content>`. */
    @ViewChild(TemplateRef, {static: true})
    implicitContent: TemplateRef<any>;

    /** Plain text label for the tab, used when there is no template label. */
    @Input('label')
    textLabel: string = '';

    @Input('tabId')
    tabId: string;

    /** Aria label for the tab. */
    @Input('aria-label')
    ariaLabel: string;

    /**
     * Reference to the element that the tab is labelled by.
     * Will be cleared if `aria-label` is set at the same time.
     */
    @Input('aria-labelledby')
    ariaLabelledby: string;

    /** Emits whenever the internal state of the tab changes. */
    readonly stateChanges = new Subject<void>();

    /**
     * The relatively indexed position where 0 represents the center, negative is left, and positive
     * represents the right.
     */
    position: number | null = null;

    /**
     * The initial relatively index origin of the tab if it was created and selected after there
     * was already a selected tab. Provides context of what position the tab should originate from.
     */
    origin: number | null = null;

    /**
     * Whether the tab is currently active.
     */
    isActive = false;

    /** Portal that will be the hosted content of the tab */
    private contentPortal: TemplatePortal | null = null;

    constructor(private viewContainerRef: ViewContainerRef) {
        super();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (
            changes.hasOwnProperty('textLabel') ||
            changes.hasOwnProperty('disabled')
        ) {
            this.stateChanges.next();
        }
    }

    ngOnDestroy(): void {
        this.stateChanges.complete();
    }

    ngOnInit(): void {
        this.contentPortal = new TemplatePortal(
            this.explicitContent || this.implicitContent,
            this.viewContainerRef
        );
    }
}
