import { ChangeDetectorRef, Component, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
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
    encapsulation: ViewEncapsulation.None
})
export class ComponentOverviewComponent {

    documentLost = false;

    @ViewChild('toc', {static: false}) anchorsComponent: AnchorsComponent;

    constructor(public componentViewer: ComponentViewerComponent,
                private ref: ChangeDetectorRef) {

    }

    scrollToSelectedContentSection() {
        this.documentLost = false;
        this.ref.detectChanges();
        if (this.anchorsComponent) {
            this.anchorsComponent.setScrollPosition();
        }
    }

    showDocumentLostAlert() {
        this.documentLost = true;
        this.ref.detectChanges();
    }
}
