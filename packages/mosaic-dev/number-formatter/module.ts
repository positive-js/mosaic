/* tslint:disable:naming-convention */
// tslint:disable:no-console
import { Component, Inject, Input, NgModule, Optional, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { MC_LOCALE_ID, McFormattersModule } from '@ptsecurity/mosaic/core';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McInputModule } from '@ptsecurity/mosaic/input';


@Component({
    selector: 'app',
    templateUrl: './demo-template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent {
    value = 1000.123;
}


@Component({
    selector: 'ru-locale',
    templateUrl: './formatters-template.html',
    encapsulation: ViewEncapsulation.None
})
export class WithRULocaleComponent {
    locale = 'en';

    @Input() value: number = 0;

    constructor(@Optional() @Inject(MC_LOCALE_ID) public mcLocaleId: string) {}
}

@Component({
    selector: 'en-locale',
    templateUrl: './formatters-template.html',
    encapsulation: ViewEncapsulation.None,
    providers: [{ provide: MC_LOCALE_ID, useValue: 'en' }]
})
export class WithENLocaleComponent {
    locale = 'ru';

    @Input() value: number = 0;

    constructor(@Inject(MC_LOCALE_ID) public mcLocaleId: string) {}
}


@NgModule({
    imports: [
        BrowserModule,
        McFormattersModule,
        McInputModule,
        McFormFieldModule,
        FormsModule,
        McIconModule
    ],
    declarations: [
        DemoComponent,
        WithRULocaleComponent,
        WithENLocaleComponent
    ],
    bootstrap: [
        DemoComponent
    ]
})
export class DemoModule {}
