import { TemplatePortal, DomPortalOutlet } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import {
    Directive,
    TemplateRef,
    ComponentFactoryResolver,
    ApplicationRef,
    Injector,
    ViewContainerRef,
    Inject,
    OnDestroy
} from '@angular/core';
import { Subject } from 'rxjs';


/**
 * Dropdown content that will be rendered lazily once the dropdown is opened.
 */
@Directive({
    selector: 'ng-template[mcDropdownContent]'
})
export class McDropdownContent implements OnDestroy {

    /** Emits when the dropdown content has been attached. */
    attached = new Subject<void>();
    private portal: TemplatePortal;
    private outlet: DomPortalOutlet;

    constructor(
        private _template: TemplateRef<any>,
        private _componentFactoryResolver: ComponentFactoryResolver,
        private _appRef: ApplicationRef,
        private _injector: Injector,
        private _viewContainerRef: ViewContainerRef,
        @Inject(DOCUMENT) private _document: Document
    ) {}

    /**
     * Attaches the content with a particular context.
     * @docs-private
     */
    attach(context: any = {}) {
        if (!this.portal) {
            this.portal = new TemplatePortal(this._template, this._viewContainerRef);
        }

        this.detach();

        if (!this.outlet) {
            this.outlet = new DomPortalOutlet(
                this._document.createElement('div'),
                this._componentFactoryResolver,
                this._appRef,
                this._injector
            );
        }

        const element: HTMLElement = this._template.elementRef.nativeElement;

        // Because we support opening the same dropdown from different triggers (which in turn have their
        // own `OverlayRef` panel), we have to re-insert the host element every time, otherwise we
        // risk it staying attached to a pane that's no longer in the DOM.
        element.parentNode!.insertBefore(this.outlet.outletElement, element);
        this.portal.attach(this.outlet, context);
        this.attached.next();
    }

    /**
     * Detaches the content.
     * @docs-private
     */
    detach() {
        if (this.portal.isAttached) {
            this.portal.detach();
        }
    }

    ngOnDestroy() {
        if (this.outlet) {
            this.outlet.dispose();
        }
    }
}
