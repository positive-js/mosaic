import { ComponentPortal, DomPortalHost } from '@angular/cdk/portal';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
    ApplicationRef,
    Component,
    ComponentFactoryResolver,
    ElementRef,
    EventEmitter,
    Injector,
    Input,
    NgZone,
    OnDestroy,
    Output,
    SecurityContext,
    ViewContainerRef
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import { ExampleViewer } from '../example-viewer/example-viewer';


@Component({
    selector: 'doc-viewer',
    template: 'Loading document...'
})
export class DocViewer implements OnDestroy {

    /** The URL of the document to display. */
    @Input()
    set documentUrl(url: string) {
        this.fetchDocument(url);
    }

    @Output() contentRendered = new EventEmitter<void>();
    @Output() contentRenderFailed = new EventEmitter<void>();

    /** The document text. It should not be HTML encoded. */
    textContent = '';
    private portalHosts: DomPortalHost[] = [];
    private documentFetchSubscription: Subscription;

    constructor(private _appRef: ApplicationRef,
                private _componentFactoryResolver: ComponentFactoryResolver,
                private _elementRef: ElementRef,
                private _http: HttpClient,
                private _injector: Injector,
                private _viewContainerRef: ViewContainerRef,
                private _ngZone: NgZone,
                private _domSanitizer: DomSanitizer) {
    }

    ngOnDestroy() {
        this.clearLiveExamples();

        if (this.documentFetchSubscription) {
            this.documentFetchSubscription.unsubscribe();
        }
    }

    /** Fetch a document by URL. */
    private fetchDocument(url: string) {
        // Cancel previous pending request
        if (this.documentFetchSubscription) {
            this.documentFetchSubscription.unsubscribe();
        }

        this.documentFetchSubscription = this._http.get(url, {responseType: 'text'}).subscribe(
            (document) => this.updateDocument(document),
            (error) => this.showError(url, error)
        );
    }

    /**
     * Updates the displayed document.
     * @param rawDocument The raw document content to show.
     */
    private updateDocument(rawDocument: string) {
        // Replace all relative fragment URLs with absolute fragment URLs. e.g. "#my-section" becomes
        // "/components/button/api#my-section". This is necessary because otherwise these fragment
        // links would redirect to "/#my-section".
        // tslint:disable-next-line:no-parameter-reassignment
        rawDocument = rawDocument.replace(/href="#([^"]*)"/g, (_m: string, fragmentUrl: string) => {
            const absoluteUrl = `${location.pathname}#${fragmentUrl}`;

            return `href="${this._domSanitizer.sanitize(SecurityContext.URL, absoluteUrl)}"`;
        });

        // tslint:disable-next-line:no-inner-html
        this._elementRef.nativeElement.innerHTML = rawDocument;
        this.textContent = this._elementRef.nativeElement.textContent;

        this.loadComponents('mosaic-docs-example', ExampleViewer);

        // Resolving and creating components dynamically in Angular happens synchronously, but since
        // we want to emit the output if the components are actually rendered completely, we wait
        // until the Angular zone becomes stable.
        this._ngZone.onStable
            .pipe(take(1))
            .subscribe(() => this.contentRendered.next());
    }

    /** Show an error that occurred when fetching a document. */
    private showError(url: string, error: HttpErrorResponse) {
        // tslint:disable-next-line:no-console
        console.error(error);
        this._elementRef.nativeElement.innerText =
            `Failed to load document: ${url}. Error: ${error.statusText}`;

        this._ngZone.onStable
            .pipe(take(1))
            .subscribe(() => this.contentRenderFailed.next());
    }

    /** Instantiate a ExampleViewer for each example. */
    private loadComponents(componentName: string, componentClass: any) {
        const exampleElements =
            this._elementRef.nativeElement.querySelectorAll(`[${componentName}]`);

        Array.prototype.slice.call(exampleElements).forEach((element: Element) => {
            const example = element.getAttribute(componentName);
            const portalHost = new DomPortalHost(
                element, this._componentFactoryResolver, this._appRef, this._injector);
            const examplePortal = new ComponentPortal(componentClass, this._viewContainerRef);
            const exampleViewer = portalHost.attach(examplePortal);
            (exampleViewer.instance as ExampleViewer).example = example;

            this.portalHosts.push(portalHost);
        });
    }

    private clearLiveExamples() {
        this.portalHosts.forEach((h) => h.dispose());
        this.portalHosts = [];
    }
}
