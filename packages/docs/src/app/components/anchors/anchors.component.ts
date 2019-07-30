import { Component } from '@angular/core';


@Component({
    selector: 'anchors',
    templateUrl: './anchors.component.html',
    styleUrls: ['./anchors.scss']
})
export class AnchorsComponent {

    activeAnchor: number = 0;
    activeClass: string = "anchors-menu__list-element anchors-menu__list-element_active";
    anchors: {href: string, name: string }[]  = [
        {href: "#variants", name: "Variants"},
        {href: "#colors", name: "Colors"},
        {href: "#progress-indication", name: "Progress indication"},
    ];
    inactiveClass: string = "anchors-menu__list-element";

    ngAfterViewInit() {
        // TODO: collect real anchors data
    }

    setActiveAnchor ( index ) {
        this.activeAnchor = index;
    }
}
