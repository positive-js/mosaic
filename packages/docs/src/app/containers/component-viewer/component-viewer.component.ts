import {Component, OnDestroy, ViewChild, ViewEncapsulation} from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {combineLatest, Subject} from 'rxjs';
import {map, takeUntil} from 'rxjs/operators';

import { DocItem, DocumentationItems } from '../../shared/documentation-items/documentation-items';
import { TableOfContents } from '../../shared/table-of-contents/table-of-contents';


@Component({
    selector: 'docs-component-viewer',
    templateUrl: './component-viewer.template.html',
    encapsulation: ViewEncapsulation.None
})
export class ComponentViewerComponent implements OnDestroy {

    componentDocItem: DocItem;
    sections: Set<string> = new Set(['overview', 'api']);
    private _destroyed = new Subject();

    constructor(_route: ActivatedRoute,
                private router: Router,
                public docItems: DocumentationItems
    ) {
        // Listen to changes on the current route for the doc id (e.g. button/checkbox) and the
        // parent route for the section (material/cdk).
        combineLatest(_route.params, _route.parent.params).pipe(
            map((p: [Params, Params]) => ({id: p[0].id, section: p[1].section})),
            map((p) => ({doc: docItems.getItemById(p.id, p.section), section: p.section}),
                takeUntil(this._destroyed))
        ).subscribe((d) => {
            this.componentDocItem = d.doc;

            if (this.componentDocItem) {
                console.log(this.componentDocItem.name);
                this.componentDocItem.examples.length ?
                    this.sections.add('examples') :
                    this.sections.delete('examples');
            } else {
                //this.router.navigate(['/' + d.section]);
            }
        });
    }

    ngOnDestroy(): void {
        this._destroyed.next();
    }
}


@Component({
    selector: 'component-overview',
    templateUrl: './component-overview.template.html',
    encapsulation: ViewEncapsulation.None
})
export class ComponentOverviewComponent {

    @ViewChild('toc', {static: false}) tableOfContents: TableOfContents;

    constructor(public componentViewer: ComponentViewerComponent) {

    }
}

@Component({
    selector: 'component-api',
    templateUrl: './component-api.template.html',
    encapsulation: ViewEncapsulation.None
})
export class ComponentApiComponent extends ComponentOverviewComponent {}
