import { Component } from '@angular/core';
import { Router } from '@angular/router';


@Component({
    selector: 'anchors',
    templateUrl: './anchors.component.html',
    styleUrls: ['./anchors.scss']
})
export class AnchorsComponent {

    activeAnchor: number = 0;
    activeClass: string = "anchors-menu__list-element anchors-menu__list-element_active";
    anchors: {href: string, name: string }[];
    inactiveClass: string = "anchors-menu__list-element";
    href: any;

    constructor(private router : Router) {}

    ngAfterViewInit() {
        // TODO: collect real anchors data
    }

    ngOnInit() {
        this.href = this.removeAnchor(this.router.url);
        this.anchors = [
            {href: `${this.href}#variants`, name: "Variants"},
            {href: `${this.href}#colors`, name: "Colors"},
            {href: `${this.href}#progress-indication`, name: "Progress indication"}
        ];
    }

    setActiveAnchor(index) {
        this.activeAnchor = index;
    }

    removeAnchor(url) {
        return url.split('#')[0];
    }
}
