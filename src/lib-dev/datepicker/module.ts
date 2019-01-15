// tslint:disable:no-console
import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { McButtonModule } from '@ptsecurity/mosaic/button';
import { MC_DATE_LOCALE, McNativeDateModule } from '@ptsecurity/mosaic/core';
import { McDatepickerModule } from '@ptsecurity/mosaic/datepicker';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McInputModule } from '@ptsecurity/mosaic/input';


@Component({
    selector: 'app',
    template: require('./template.html'),
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent {

}

@NgModule({
    declarations: [
        DemoComponent
    ],
    imports: [
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        McFormFieldModule,
        McIconModule,
        McDatepickerModule,
        McNativeDateModule,
        McInputModule,
        McButtonModule
    ],
    bootstrap: [
        DemoComponent
    ],
    providers: [
        {provide: MC_DATE_LOCALE, useValue: 'ru-RU'}
    ]
})
export class DemoModule {}

platformBrowserDynamic()
    .bootstrapModule(DemoModule)
    .catch((error) => console.error(error));
