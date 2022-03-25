import { Component, ElementRef, ViewEncapsulation } from '@angular/core';


@Component({
    selector: 'mc-dl',
    template: '<ng-content></ng-content>',
    styleUrls: ['dl.scss'],
    host: {
        class: 'mc-dl',
        '[class.mc-dl_vertical]': 'false'
    },
    encapsulation: ViewEncapsulation.None
})
export class McDlComponent {
    constructor(public elementRef: ElementRef) {}
}

@Component({
    selector: 'mc-dt',
    template: '<ng-content></ng-content>',
    host: {
        class: 'mc-dt',
        '[class.mc-dt]': 'true'
    },
    encapsulation: ViewEncapsulation.None
})
export class McDtComponent {
    constructor(public elementRef: ElementRef) {}
}

@Component({
    selector: 'mc-dd',
    template: '<ng-content></ng-content>',
    host: {
        class: 'mc-dd',
        '[class.mc-dd]': 'true'
    },
    encapsulation: ViewEncapsulation.None
})
export class McDdComponent {
    constructor(public elementRef: ElementRef) {}
}
