import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectorRef, Component, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router, Params, NavigationStart } from '@angular/router';
import { combineLatest, ReplaySubject, Subject } from 'rxjs';
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

    componentDocItem = new ReplaySubject<DocItem>(1);
    sections: Set<string> = new Set(['overview', 'api']);

    private destroyed: Subject<boolean> = new Subject();

    constructor(routeActivated: ActivatedRoute,
                private router: Router,
                public docItems: DocumentationItems
    ) {
        const routeAndParentParams = [routeActivated.params];

        if (routeActivated.parent) {
            routeAndParentParams.push(routeActivated.parent.params);
        }

        // Listen to changes on the current route for the doc id (e.g. button/checkbox) and the
        // parent route for the section (mosaic/cdk).
        combineLatest(routeAndParentParams).pipe(
            map((params: Params[]) => ({id: params[0].id, section: params[1].section})),
            map((docIdAndSection: {id: string; section: string}) =>
                    ({
                            doc: docItems.getItemById(docIdAndSection.id, docIdAndSection.section),
                            section: docIdAndSection.section
                    }
                    ),
                takeUntil(this.destroyed))
        ).subscribe((docItemAndSection: {doc: DocItem | undefined; section: string}) => {
            if (docItemAndSection.doc !== undefined) {
                this.componentDocItem.next(docItemAndSection.doc);
            }
        });
    }

    ngOnDestroy(): void {
        this.destroyed.next();
        this.destroyed.complete();
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
    isLoad: boolean = true;

    @ViewChild('toc', {static: false}) anchorsComponent: AnchorsComponent;

    private destroyed: Subject<boolean> = new Subject();

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

    getOverviewDocumentUrl(doc: DocItem) {
        // Use the explicit overview path if specified. Otherwise, compute an overview path based
        // on the package name and doc item id. Overviews for components are commonly stored in a
        // folder named after the component while the overview file is named similarly. e.g.
        //    `cdk#overlay`     -> `cdk/overlay/overlay.md`
        //    `material#button` -> `material/button/button.md`
        const overviewPath = doc.overviewPath || `${doc.packageName}/${doc.id}.html`;

        return `docs-content/overviews/${overviewPath}`;
    }

    getRoute(route: string): string {
        return route.split(this.routeSeparator)[0];
    }

    scrollToSelectedContentSection() {
        this.showView();
        this.createCopyIcons();

        if (this.anchorsComponent) {
            this.anchorsComponent.setScrollPosition();
        }
    }

    createCopyIcons() {
        const codeBlocks: NodeListOf<Element> = document.querySelectorAll('.docs-markdown__pre .docs-markdown__code');

        codeBlocks.forEach((codeBlock) => {
            // Creating copy code Block
            const copyBlock = document.createElement('span');
            copyBlock.className = 'docs-markdown-code-block';

            // Creating copy success message
            const copySuccessBlock = document.createElement('span');
            copySuccessBlock.className = 'docs-markdown-code-block__copied';
            copySuccessBlock.innerText = 'Скопировано';

            const succeedIcon = document.createElement('i');
            succeedIcon.className = 'mc mc-check_16';
            copySuccessBlock.prepend(succeedIcon);

            // Adding copy success message to copy code Block
            copyBlock.appendChild(copySuccessBlock);

            // Creating copy Icon
            const copyIcon = document.createElement('i');
            copyIcon.className = 'mc mc-copy_16 docs-markdown__code-icon';
            copyIcon.addEventListener('click', this.copyCode);
            // Adding copy Icon to copy code Block
            copyBlock.appendChild(copyIcon);

            codeBlock.prepend(copyBlock);
        });
    }

    copyCode = (event: Event) =>  {
        const codeCopyAnimationTime = 1000;
        const copyBlock = (<HTMLElement> event.target).parentElement.parentElement;

        const range = document.createRange();
        range.selectNodeContents(copyBlock);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        document.execCommand('copy');
        sel.removeAllRanges();

        copyBlock.classList.add('docs-markdown-code-block_success');

        setTimeout(
            () => copyBlock.classList.remove('docs-markdown-code-block_success'),
            codeCopyAnimationTime
        );
    }

    showDocumentLostAlert() {
        this.showView();

        if (this.anchorsComponent) {
            this.anchorsComponent.setScrollPosition();
        }
    }

    showView() {
        this.isLoad = true;
        this.ref.detectChanges();
    }

    ngOnDestroy() {
        this.destroyed.next();
        this.destroyed.complete();
    }
}
