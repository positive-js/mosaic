/* tslint:disable:naming-convention */
// tslint:disable:no-console
import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { MC_LOCALE_ID, McFormattersModule } from '@ptsecurity/mosaic/core/formatters';


@Component({
    selector: 'app',
    template: require('./demo-template.html'),
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent {
    rawNumber = 1000.111;
}

@Component({
    selector: 'ru-locale',
    template: require('./formatters-template.html'),
    encapsulation: ViewEncapsulation.None
})
export class WithRULocaleComponent {
    rawNumber = 1000.111;
    locale = 'en';
}

@Component({
    selector: 'en-locale',
    template: require('./formatters-template.html'),
    encapsulation: ViewEncapsulation.None,
    providers: [{ provide: MC_LOCALE_ID, useValue: 'en' }]
})
export class WithENLocaleComponent {
    rawNumber = 1000.111;
    locale = 'ru';
}


@NgModule({
    declarations: [
        DemoComponent,
        WithRULocaleComponent,
        WithENLocaleComponent
    ],
    imports: [
        BrowserModule,
        McFormattersModule
    ],
    bootstrap: [
        DemoComponent
    ]
})
export class FormattersDemoModule {}

platformBrowserDynamic()
    .bootstrapModule(FormattersDemoModule)
    .catch((error) => console.error(error));

