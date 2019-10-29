import { DOCUMENT } from '@angular/common';
import { ChangeDetectorRef , Component, ElementRef, Inject, Input } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subject, fromEvent } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';


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
    @Input() headerSelectors = '.mc-display-3.title, .docs-header-link_3';

    click: boolean = false;
    container: string;
    headerHeight: number = 64;
    // coef for calculating the distance between anchor and header when scrolling (== headerHeight * anchorHeaderCoef)
    anchorHeaderCoef = 2;
    // If smooth scroll is supported bigger debounce time is needed to avoid active anchor's hitch
    readonly isSmoothScrollSupported;
    noSmoothScrollDebounce = 10;
    debounceTime: number = 15;
    private destroyed = new Subject();
    private fragment = '';
    private activeClass = 'anchors-menu__list-element_active';
    private scrollContainer: any;
    private currentUrl: any;
    private pathName: string;

    constructor(private router: Router,
                private route: ActivatedRoute,
                private element: ElementRef,
                private ref: ChangeDetectorRef,
                @Inject(DOCUMENT) private document: Document) {
        this.isSmoothScrollSupported  = 'scrollBehavior' in this.document.documentElement.style;

        if (!this.isSmoothScrollSupported) {
            this.debounceTime = this.noSmoothScrollDebounce;
        }
        this.currentUrl = router.url.split('#')[0];
        localStorage.setItem('PT_nextRoute', this.currentUrl);
        this.container = '.anchors-menu';
        this.pathName = this.router.url;
        this.router.events.pipe(takeUntil(this.destroyed)).subscribe((event) => {
            if (event instanceof NavigationEnd) {
                const rootUrl = router.url.split('#')[0];

                if (rootUrl !== this.currentUrl) {
                    localStorage.setItem('PT_nextRoute', rootUrl);
                    this.currentUrl = rootUrl;
                    this.pathName = this.router.url;
                }
            }
        });
    }

    ngOnInit() {
        // attached to anchor's change in the address bar manually or by clicking on the anchor
        this.route.fragment.pipe(takeUntil(this.destroyed)).subscribe((fragment) => {
            this.fragment = fragment;
            const index = this.getAnchorIndex(fragment);

            if (index) { this.setFragment(index); }
        });
    }

    ngOnDestroy() {
        this.destroyed.next();
    }

    getAnchorIndex(urlFragment): number {
        let index = 0;
        this.anchors.forEach((anchor, i) => {
            if (anchor.href === `${urlFragment}`) { index = i; }
        });

        return index;
    }

    setScrollPosition() {
        this.anchors = this.createAnchors();
        this.scrollContainer = this.document || window;
        const target = this.document.getElementById(this.fragment);

        if (target) {
            const index = this.getAnchorIndex(this.fragment);

            if (index) { this.setFragment(index); }
            target.scrollTop += this.headerHeight;
            target.scrollIntoView();
        }

        if (this.scrollContainer) {
            fromEvent(this.scrollContainer, 'scroll').pipe(
                takeUntil(this.destroyed),
                debounceTime(this.debounceTime))
                .subscribe(() => this.onScroll());
        }
        this.ref.detectChanges();
    }

    /* TODO Техдолг: при изменении ширины экрана должен переопределяться параметр top
    *   делать это по window:resize нельзя, т.к. изменение ширины контента страницы проиходит после window:resize */
    onResize() {
        const headers = Array.from(this.document.querySelectorAll(this.headerSelectors)) as HTMLElement[];

        for (let i = 0; i < this.anchors.length; i++) {
            const {top} = headers[i].getBoundingClientRect();
            this.anchors[i].top = top;
        }

        this.ref.detectChanges();
    }

    private getScrollOffset(): number {
        return window.pageYOffset + this.headerHeight * this.anchorHeaderCoef;
    }

    private isScrolledToEnd(): boolean {
        const documentHeight = this.document.documentElement.scrollHeight;
        const scrollTop = window.pageYOffset || this.document.documentElement.scrollTop || this.document.body.scrollTop;
        const clientHeight = this.document.documentElement.clientHeight;
        const scrollHeight = scrollTop + clientHeight;

        // scrollHeight should be strictly equal to documentHeight, but in Edge it is slightly larger
        return scrollHeight >= documentHeight;
    }

    private createAnchors(): IAnchor[] {
        const anchors = [];
        const headers = Array.from(this.document.querySelectorAll(this.headerSelectors)) as HTMLElement[];

        if (headers.length) {
            const bodyTop = this.document.body.getBoundingClientRect().top;
            for (let i = 0; i < headers.length; i++) {
                const name = headers[i].innerText.trim();
                const anchorHeader = headers[i].querySelector('span');
                const href = anchorHeader ? `${anchorHeader.id}` : '';
                const top = headers[i].getBoundingClientRect().top - bodyTop + this.headerHeight;

                anchors.push({
                    href,
                    name,
                    active: i === 0,
                    top
                });
            }
        }

        if (anchors.length) { anchors[0].top = this.headerHeight; }

        return anchors;
    }

    private onScroll() {
        if (this.isScrolledToEnd()) {
            this.setActiveAnchor(this.anchors.length - 1);
            this.ref.detectChanges();

            return;
        }

        for (let i = 0; i < this.anchors.length; i++) {
            if (this.isLinkActive(this.anchors[i], this.anchors[i + 1])) {
                this.setActiveAnchor(i);
            }
        }
        this.ref.detectChanges();
    }

    private isLinkActive(currentLink: any, nextLink: any): boolean {
        // A link is active if the scroll position is lower than the anchor position + headerHeight*anchorHeaderCoef
        // and above the next anchor
        const scrollOffset = this.getScrollOffset();

        return scrollOffset >= currentLink.top && !(nextLink && nextLink.top < scrollOffset);
    }

    private setFragment(index) {
        if (this.isScrolledToEnd()) {
            this.setActiveAnchor(this.anchors.length - 1);

            return;
        }
        this.click = true;
        this.setActiveAnchor(index);
    }

    private setActiveAnchor(index) {
        for (const anchor of this.anchors) {
            anchor.active = false;
        }
        this.anchors[index].active = true;
    }
}
