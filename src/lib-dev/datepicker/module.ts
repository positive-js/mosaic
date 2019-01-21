// tslint:disable:no-console
// tslint:disable:no-magic-numbers
import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { DateAdapter, MC_DATE_FORMATS, MC_DATE_LOCALE, McNativeDateModule } from '@ptsecurity/mosaic/core';
import { MC_MOMENT_DATE_FORMATS, McDatepickerModule, MomentDateAdapter } from '@ptsecurity/mosaic/datepicker';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McInputModule } from '@ptsecurity/mosaic/input';
import { Moment } from 'moment';


@Component({
    selector: 'app',
    template: require('./template.html'),
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent {
    minDate = new Date(2015, 0, 1);
    maxDate = new Date(2020, 0, 1);

    myFilter(d: Moment): boolean {
        const day = d.toDate().getDay();

        return day !== 0 && day !== 6;
    }
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
        McDatepickerModule,
        McNativeDateModule,
        McInputModule,
        McIconModule
    ],
    bootstrap: [
        DemoComponent
    ],
    providers: [
        {provide: MC_DATE_LOCALE, useValue: 'ru-RU'},
        {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MC_DATE_LOCALE]},
        {provide: MC_DATE_FORMATS, useValue: MC_MOMENT_DATE_FORMATS}
    ]
})
export class DemoModule {}

platformBrowserDynamic()
    .bootstrapModule(DemoModule)
    .catch((error) => console.error(error));
