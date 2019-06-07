// tslint:disable:no-console
// tslint:disable:no-magic-numbers
import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DateAdapter, MC_DATE_LOCALE } from '@ptsecurity/cdk/datetime';
import {
    MC_MOMENT_DATE_ADAPTER_OPTIONS,
    McMomentDateModule,
    MomentDateAdapter
} from '@ptsecurity/mosaic-moment-adapter/adapter';
import { McDatepickerModule } from '@ptsecurity/mosaic/datepicker';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McInputModule } from '@ptsecurity/mosaic/input';

// Depending on whether rollup is used, moment needs to be imported differently.
// Since Moment.js doesn't have a default export, we normally need to import using the `* as`
// syntax. However, rollup creates a synthetic default module and we thus need to import it using
// the `default as` syntax.
// tslint:disable-next-line:ordered-imports
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment, Moment } from 'moment';


const moment = _rollupMoment || _moment;

@Component({
    selector: 'app',
    template: require('./template.html'),
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [
        { provide: MC_DATE_LOCALE, useValue: 'ru' },
        { provide: MC_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { findDateFormat: true } },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [ MC_DATE_LOCALE, MC_MOMENT_DATE_ADAPTER_OPTIONS ] }
    ]
})
export class DemoComponent {
    date = moment([2019, 0, 24]);
    minDate = moment([2015, 0, 1]);
    maxDate = moment([2020, 0, 1]);

    myFilter(date: Moment): boolean {
        const day = date.day();

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
        McMomentDateModule,
        McInputModule,
        McIconModule
    ],
    bootstrap: [
        DemoComponent
    ],
    providers: []
})
export class DemoModule {}

platformBrowserDynamic()
    .bootstrapModule(DemoModule)
    .catch((error) => console.error(error));
