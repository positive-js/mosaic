import { Component, Inject, Input, Optional, ViewEncapsulation } from '@angular/core';
import { MC_LOCALE_ID } from '@ptsecurity/mosaic/core';


/**
 * @title Basic progress number-formatter
 */
@Component({
    selector: 'number-formatter-overview-example',
    templateUrl: 'number-formatter-overview-example.html',
    styleUrls: ['number-formatter-overview-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class NumberFormatterOverviewExample {
    value = 1000.123;
}

@Component({
    selector: 'default-locale',
    templateUrl: 'formatters-template.html',
    encapsulation: ViewEncapsulation.None
})
export class WithDefaultLocaleComponent {
    locale = 'en';

    @Input() value: number = 0;

    constructor(@Optional() @Inject(MC_LOCALE_ID) public mcLocaleId: string) {}
}

@Component({
    selector: 'en-locale',
    templateUrl: 'formatters-template.html',
    encapsulation: ViewEncapsulation.None,
    providers: [{ provide: MC_LOCALE_ID, useValue: 'en' }]
})
// tslint:disable-next-line:naming-convention
export class WithENLocaleComponent {
    locale = 'ru';

    @Input() value: number = 0;

    constructor(@Inject(MC_LOCALE_ID) public mcLocaleId: string) {}
}
