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
    @Input() headerSelectors = '.docs-header-link_3';

    click: boolean = false;
    container: string;
    headerHeight: number = 64;
    // коэффициент для вычисления расстояния якоря над заголовком при скроле (== headerHeight * anchorHeaderCoef)
    anchorHeaderCoef = 3;
    debounceTime: number = 5;
    private destroyed = new Subject();
    private urlFragment = '';
    private scrollContainer: any;
    private currentUrl: any;
    private scrollTimeout: number = 1000;

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

        // Срабатывает при изменении якоря в адресной строке руками или кликом по якорю
        this.route.fragment.pipe(takeUntil(this.destroyed)).subscribe((fragment) => {
            this.urlFragment = fragment;
            const target = document.getElementById(this.urlFragment);
            const index = this.getAnchorIndex(this.urlFragment);

            if (index) { this.setActiveAnchor(index); }

            if (target) {
                this.click = true;
                target.scrollIntoView();
            }
        });
    }

    ngOnDestroy() {
        this.destroyed.next();
    }

    getAnchorIndex(urlFragment): number {
        let index = 0;
        this.anchors.forEach((anchor, i) => {
            if (anchor.href === `#${urlFragment}`) { index = i; }
        });

        return index;
    }

    setScrollPosition() {
        this.anchors = this.createAnchors();
        const target = document.getElementById(this.urlFragment);

        if (target) {
            const index = this.getAnchorIndex(this.urlFragment);

            if (index) { this.setActiveAnchor(index); }
            target.scrollTop += this.headerHeight;
            target.scrollIntoView();
        }

        const scrollPromise = new Promise((resolve, reject) => {
            setTimeout(() => { resolve(); }, this.scrollTimeout);
        });

        scrollPromise.then(() => {
            this.scrollContainer = this.document || window;

            if (this.scrollContainer) {
                fromEvent(this.scrollContainer, 'scroll').pipe(
                    takeUntil(this.destroyed),
                    debounceTime(this.debounceTime))
                    .subscribe(() => this.onScroll());
            }
        });
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

    private createAnchors(): IAnchor[] {
        const anchors = [];
        const headers = Array.from(this.document.querySelectorAll(this.headerSelectors)) as HTMLElement[];

        if (headers.length) {
            for (let i = 0; i < headers.length; i++) {
                // remove the 'link' icon name from the inner text
                const name = headers[i].innerText.trim();
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

        if (anchors.length) { anchors[0].top = this.headerHeight; }

        return anchors;
    }

    private onScroll() {
        // Если переход на якорь был инициирован не скролом выходим из функции
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
        // Ссылка считается активной, если позиция скролла ниже позиции якоря + отступ (headerHeight*anchorHeaderCoef)
        // и выше следующего за ним якоря
        const scrollOffset = this.getScrollOffset();

        return scrollOffset >= currentLink.top && !(nextLink && nextLink.top < scrollOffset);
    }

    private setActiveAnchor(index) {
        this.click = true;
        for (const anchor of this.anchors) {
            anchor.active = false;
        }
        this.anchors[index].active = true;
        this.ref.detectChanges();
    }
}
