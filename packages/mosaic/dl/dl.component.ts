import { Component, ElementRef, Input, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';


@Component({
    selector: 'mc-dl',
    template: '<ng-content></ng-content>',
    styleUrls: ['dl.scss'],
    host: {
        class: 'mc-dl',
        '[class.mc-dl_vertical]': 'vertical',
        '[class.mc-dl_wide]': 'wide',
        '(window:resize)': 'resizeStream.next()'
    },
    encapsulation: ViewEncapsulation.None
})
export class McDlComponent implements OnDestroy {
    @Input() minWidth: number = 400;
    @Input() wide = false;

    vertical = false;

    readonly resizeStream = new Subject<Event>();
    private readonly resizeDebounceInterval: number = 100;

    private resizeSubscription: Subscription;


    constructor(public elementRef: ElementRef) {
        this.resizeSubscription = this.resizeStream
            .pipe(debounceTime(this.resizeDebounceInterval))
            .subscribe(this.updateState);
    }

    ngOnDestroy() {
        this.resizeSubscription.unsubscribe();
    }

    updateState = () => {
        const { width } = this.elementRef.nativeElement.getClientRects()[0];

        this.vertical = width <= this.minWidth;
    }
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
export class McDtComponent {}

@Component({
    selector: 'mc-dd',
    template: '<ng-content></ng-content>',
    host: {
        class: 'mc-dd'
    },
    encapsulation: ViewEncapsulation.None
})
export class McDdComponent {}
