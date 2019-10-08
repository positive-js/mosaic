import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectorRef, Component, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router, Params, NavigationStart } from '@angular/router';
import { combineLatest, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { DocItem, DocumentationItems } from '../../shared/documentation-items/documentation-items';
import { AnchorsComponent } from '../anchors/anchors.component';


@Component({
    selector: 'docs-component-viewer',
    templateUrl: './component-viewer.template.html',
    styleUrls: ['./component-overview.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ComponentViewerComponent implements OnDestroy {

    componentDocItem: DocItem;
    sections: Set<string> = new Set(['overview', 'api']);

    private destroyed = new Subject();

    constructor(routeActivated: ActivatedRoute,
                public docItems: DocumentationItems
    ) {
        // Listen to changes on the current route for the doc id (e.g. button/checkbox) and the
        // parent route for the section (mosaic/cdk).

        combineLatest(routeActivated.params, routeActivated.parent.params).pipe(
            map((p: [Params, Params]) => ({id: p[0].id, section: p[1].section})),
            map((p) => ({doc: docItems.getItemById(p.id, p.section), section: p.section}),
                takeUntil(this.destroyed))
        ).subscribe((d) => {
            this.componentDocItem = d.doc;
        });
    }

    ngOnDestroy(): void {
        this.destroyed.next();
    }
}


@Component({
    selector: 'component-overview',
    templateUrl: './component-overview.template.html',
    animations: [
        trigger('fadeInOut', [
            state('fadeIn', style({
                opacity: 1
            })),
            state('fadeOut', style({
                opacity: 0
            })),
            transition('fadeIn => fadeOut', [
                animate('0s')
            ]),
            transition('fadeOut => fadeIn', [
                animate('0.3s')
            ])
        ])
    ],
    encapsulation: ViewEncapsulation.None
})
export class ComponentOverviewComponent implements OnDestroy {
    currentUrl: string;
    routeSeparator: string = '/overview';
    documentName: string = '';
    documentLost: boolean = false;
    isLoad: boolean = true;
    private destroyed = new Subject();

    @ViewChild('toc', {static: false}) anchorsComponent: AnchorsComponent;

    constructor(public componentViewer: ComponentViewerComponent,
                private router: Router,
                private ref: ChangeDetectorRef) {
        this.currentUrl = this.getRoute(router.url);

        this.router.events.pipe(takeUntil(this.destroyed)).subscribe((event) => {
            if (event instanceof NavigationStart) {
                const rootUrl = this.getRoute(event.url);

                if (rootUrl !== this.currentUrl) {
                    this.currentUrl = rootUrl;
                    this.isLoad = false;
                }
            }
        });
    }

    getRoute(route: string): string {
        return route.split(this.routeSeparator)[0];
    }

    scrollToSelectedContentSection() {
        this.documentLost = false;
        this.showView();

        if (this.anchorsComponent) {
            this.anchorsComponent.setScrollPosition();
        }
    }

    showDocumentLostAlert() {
        this.documentLost = true;
        this.showView();
    }

    showView() {
        this.documentName = this.componentViewer.componentDocItem.id;
        this.isLoad = true;
        this.ref.detectChanges();
    }

    ngOnDestroy() {
        this.destroyed.next();
    }
}
