/* tslint:disable:naming-convention */
// tslint:disable:no-console
import { Component, Inject, Input, NgModule, Optional, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { MC_LOCALE_ID, McFormattersModule } from '@ptsecurity/mosaic/core/formatters';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McInputModule } from '@ptsecurity/mosaic/input';


@Component({
    selector: 'app',
    template: require('./demo-template.html'),
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent {
    value = 1000.123;
}


@Component({
    selector: 'ru-locale',
    template: require('./formatters-template.html'),
    encapsulation: ViewEncapsulation.None
})
export class WithRULocaleComponent {
    locale = 'en';

    @Input() value: number = 0;

    constructor(@Optional() @Inject(MC_LOCALE_ID) public mcLocaleId: string) {}
}

@Component({
    selector: 'en-locale',
    template: require('./formatters-template.html'),
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
export class FormattersDemoModule {}

platformBrowserDynamic()
    .bootstrapModule(FormattersDemoModule)
    .catch((error) => console.error(error));

