import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectorRef, Component, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';
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

    private destroyed: Subject<boolean> = new Subject();

    constructor(
        routeActivated: ActivatedRoute,
        public docItems: DocumentationItems
    ) {
        // Listen to changes on the current route for the doc id (e.g. button/checkbox) and the
        // parent route for the section (mosaic/cdk).

        combineLatest([routeActivated.params, routeActivated!.parent!.params]).pipe(
            map((p: [Params, Params]) => ({ id: p[0].id, section: p[1].section })),
            map((p) => ({ doc: docItems.getItemById(p.id, p.section), section: p.section }),
                takeUntil(this.destroyed))
        ).subscribe((d) => {
            if (d.doc) {
                this.componentDocItem = d.doc;
            }
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

    @ViewChild('toc', {static: false}) anchorsComponent: AnchorsComponent;

    private destroyed: Subject<boolean> = new Subject();

    constructor(public componentViewer: ComponentViewerComponent,
                private router: Router,
                private ref: ChangeDetectorRef,
                private titleService: Title) {
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
        const copyBlock = (<HTMLElement> event.target)!.parentElement!.parentElement;

        if (!copyBlock) { return; }

        const range = document.createRange();
        range.selectNodeContents(copyBlock);

        const sel = window.getSelection();

        if (!sel) { return; }

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
        this.documentLost = true;
        this.showView();

        if (this.anchorsComponent) {
            this.anchorsComponent.setScrollPosition();
        }
    }

    showView() {
        this.documentName = this.componentViewer.componentDocItem.id;
        const defaultTitle = 'Mosaic';

        if (this.documentName) {
            this.titleService.setTitle(
                `${this.documentName.charAt(0).toUpperCase()}${this.documentName.slice(1)} \u00B7 ${defaultTitle}`
            );
        } else {
            this.titleService.setTitle(defaultTitle);
        }
        this.isLoad = true;
        this.ref.detectChanges();
    }

    ngOnDestroy() {
        this.destroyed.next();
    }
}
