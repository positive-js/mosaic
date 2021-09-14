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

import { McTabContent } from './tab-content.directive';
import { MC_TAB_LABEL, McTabLabel } from './tab-label.directive';


export class McTabBase {}

// tslint:disable-next-line:naming-convention
export const McTabMixinBase: CanDisableCtor & typeof McTabBase = mixinDisabled(McTabBase);

@Component({
    selector: 'mc-tab',
    exportAs: 'mcTab',
    // Create a template for the content of the <mc-tab> so that we can grab a reference to this
    // TemplateRef and use it in a Portal to render the tab content in the appropriate place in the
    // tab-group.
    template: '<ng-template><ng-content></ng-content></ng-template>',
    inputs: ['disabled'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class McTab extends McTabMixinBase implements OnInit, CanDisable, OnChanges, OnDestroy {
    /** @docs-private */
    get content(): TemplatePortal | null {
        return this.contentPortal;
    }

    @ContentChild(MC_TAB_LABEL)
    get templateLabel(): McTabLabel { return this._templateLabel; }

    set templateLabel(value: McTabLabel) { this.setTemplateLabelInput(value); }

    private _templateLabel: McTabLabel;

    /**
     * Template provided in the tab content that will be used if present, used to enable lazy-loading
     */
    @ContentChild(McTabContent, { read: TemplateRef, static: true }) explicitContent: TemplateRef<any>;

    /** Template inside the McTab view that contains an `<ng-content>`. */
    @ViewChild(TemplateRef, { static: true }) implicitContent: TemplateRef<any>;

    /** Plain text label for the tab, used when there is no template label. */
    @Input('label') textLabel = '';

    @Input() empty = false;
    @Input() tooltipTitle = '';
    @Input() tooltipPlacement = '';

    @Input('tabId') tabId: string;

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

    constructor(private readonly viewContainerRef: ViewContainerRef) {
        super();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.hasOwnProperty('textLabel') || changes.hasOwnProperty('disabled')) {
            this.stateChanges.next();
        }
    }

    ngOnDestroy(): void {
        this.stateChanges.complete();
    }

    ngOnInit(): void {
        this.contentPortal = new TemplatePortal(this.explicitContent || this.implicitContent, this.viewContainerRef);
    }

    /**
     * This has been extracted to a util because of TS 4 and VE.
     * View Engine doesn't support property rename inheritance.
     * TS 4.0 doesn't allow properties to override accessors or vice-versa.
     * @docs-private
     */
    protected setTemplateLabelInput(value: McTabLabel) {
        // Only update the templateLabel via query if there is actually
        // a McTabLabel found. This works around an issue where a user may have
        // manually set `templateLabel` during creation mode, which would then get clobbered
        // by `undefined` when this query resolves.
        if (value) {
            this._templateLabel = value;
        }
    }
}
