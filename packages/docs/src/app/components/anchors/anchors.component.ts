import { DOCUMENT } from '@angular/common';
import { ChangeDetectorRef , Component, ElementRef, Inject, Input } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subject, fromEvent } from 'rxjs';
import { debounceTime, map, takeUntil } from 'rxjs/operators';


interface IAnchor {
    href: string;
    name: string;
    /* If the anchor is in view of the page */
    active: boolean;
    /* top offset px of the anchor */
    top: number;
}

@Component({
    selector: 'anchors',
    templateUrl: './anchors.component.html',
    styleUrls: ['./anchors.scss']
})
export class AnchorsComponent {

    @Input() anchors: IAnchor[] = [];
    @Input() headerSelectors = 'h3.docs-header-link, h4.docs-header-link'; // TODO edit selector to right one

    click: boolean = false;
    container: string;
    headerHeight: number = 64;
    debounceTime: number = 20;
    private destroyed = new Subject();
    private urlFragment = '';
    private scrollContainer: any;
    private  currentUrl: any;

    constructor(private router: Router,
                private route: ActivatedRoute,
                private element: ElementRef,
                private ref: ChangeDetectorRef,
                @Inject(DOCUMENT) private document: Document) {

        this.container = '.anchors-menu';

        this.router.events.pipe(takeUntil(this.destroyed)).subscribe((event) => {
            if (event instanceof NavigationEnd) {
                const rootUrl = router.url.split('#')[0];
                if (rootUrl !== this.currentUrl) {
                    this.anchors = this.createAnchors();
                    this.currentUrl = rootUrl;
                }
            }
        });

        this.route.fragment.pipe(takeUntil(this.destroyed)).subscribe((fragment) => {
            this.urlFragment = fragment;
            const target = document.getElementById(this.urlFragment);

            if (target) {
                this.click = true;
                target.scrollIntoView();
            }

        });
    }

    ngAfterViewInit() {
        this.updateScrollPosition();
    }

    ngOnDestroy() {
        this.destroyed.next();
    }

    updateScrollPosition() {
        this.anchors = this.createAnchors();
        const target = document.getElementById(this.urlFragment);
        if (target) {
            target.scrollIntoView();
        }
    }

    setScrollPosition() {
        this.anchors = this.createAnchors();
        const target = document.getElementById(this.urlFragment);
        if (target) {
            target.scrollIntoView();
        }

        Promise.resolve().then(() => {
            this.scrollContainer = this.document || window;

            if (this.scrollContainer) {
                fromEvent(this.scrollContainer, 'scroll').pipe(

                    takeUntil(this.destroyed),
                    debounceTime(this.debounceTime))
                    .subscribe(() => this.onScroll());
            }
        });
    }

    onResize() {
        const headers = Array.from(this.document.querySelectorAll(this.headerSelectors)) as HTMLElement[];

        for (let i = 0; i < this.anchors.length; i++) {
            const {top} = headers[i].getBoundingClientRect();
            this.anchors[i].top = top;
        }

        this.ref.detectChanges();
    }

    /** Gets the scroll offset of the scroll container */
    private getScrollOffset(): number {
        return window.pageYOffset + this.headerHeight;
    }

    private createAnchors(): IAnchor[] {
        const anchors = [];
        const headers = Array.from(this.document.querySelectorAll(this.headerSelectors)) as HTMLElement[];

        if (headers.length) {
            for (let i = 0; i < headers.length; i++) {
                // remove the 'link' icon name from the inner text
                const name = headers[i].innerText.trim().replace(/^link/, '');
                const href = `#${headers[i].id}`;
                const {top} = headers[i].getBoundingClientRect();

                anchors.push({
                    href,
                    name,
                    active: i === 0,
                    top
                });
            }
        }

        return anchors;
    }

    private onScroll() {
        if (this.click) {
            this.click = false;

            return;
        }

        for (let i = 0; i < this.anchors.length; i++) {
            this.anchors[i].active = this.isLinkActive(this.anchors[i], this.anchors[i + 1]);
        }

        this.ref.detectChanges();
    }

    private isLinkActive(currentLink: any, nextLink: any): boolean {
        // A link is considered active if the page is scrolled passed the anchor without also
        // being scrolled passed the next link
        const scrollOffset = this.getScrollOffset();

        return scrollOffset >= currentLink.top && !(nextLink && nextLink.top < scrollOffset);
    }

    private setActiveAnchor(index) {
        for (const anchor of this.anchors) {
            anchor.active = false;
        }
        this.anchors[index].active = true;
        this.ref.detectChanges();
    }
}
