// tslint:disable:no-console
// tslint:disable:no-magic-numbers
import { Component, NgModule, ViewEncapsulation, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
    DateAdapter,
    IFormatterAbsoluteTemplate,
    IFormatterRelativeTemplate,
    IFormatterRangeTemplate,
    MC_DATE_LOCALE
} from '@ptsecurity/cdk/datetime';
import {
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
        {provide: MC_DATE_LOCALE, useValue: 'ru'},
        {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MC_DATE_LOCALE]}
    ]
})
export class DemoComponent {
    date = moment([2019, 0, 24]);

    startDate = moment([2019, 0, 20]);
    endDate = moment([2019, 0, 24]);

    relativeDate = moment().subtract(1, 'days');

    absoluteDateTemplate: IFormatterAbsoluteTemplate = {
        DATE: '{{YEAR} CURRENT_YEAR, select, yes{{DATE}} other{{DATE}}}',
        DATETIME: '{CURRENT_YEAR, select, yes{{TIME}, {DATE}} other{{DATE} {YEAR}, {TIME}}}'
    };

    relativeDateTemplate: IFormatterRelativeTemplate = {
        // tslint:disable-next-line:max-line-length
        SECONDS_AGO: '{SECONDS_PASSED, plural, =1{#{NBSP}супер-секунду} =2{#{NBSP}супер-секунды} other{#{NBSP}супер-секунд}} назад-вперед',
        // tslint:disable-next-line:max-line-length
        MINUTES_AGO: '{MINUTES_PASSED, plural, =1{#{NBSP}супер-минуту} =2{#{NBSP}супер-минуты} other{#{NBSP}супер-минут}} назад-вперед',
        TODAY: 'время - {TIME}',
        YESTERDAY: 'Вчера(а может и нет), {TIME}',
        BEFORE_YESTERDAY: '{CURRENT_YEAR, select, yes{{TIME}, {DATE}} other{{DATE}, {YEAR}}}'
    };

    rangeDateTemplate: IFormatterRangeTemplate = {
        START_DATE: `Начальная дата: {
                        SAME_MONTH,
                        select,
                            yes{{DAY}}
                            other{{
                                CURRENT_YEAR,
                                select,
                                    yes{{SHORT_DATE}}
                                    other{{SHORT_DATE} {YEAR}}
                            }}
                    }`,
        END_DATE: 'Конечная дата: {CURRENT_YEAR, select, yes{{SHORT_DATE}} other{{SHORT_DATE} {YEAR}}}',
        DATE: `Дата: {
                    SAME_MONTH,
                    select,
                        yes{{START_DATE}{DASH}{END_DATE}}
                        other{{START_DATE}{LONG_DASH}{END_DATE}}
                }`,

        START_DATETIME: `Начало дата-время: {
                            SAME_DAY,
                            select,
                                yes{{TIME}}
                                other{{
                                    CURRENT_YEAR,
                                    select,
                                        yes{{SHORT_DATE}, {TIME}}
                                        other{{SHORT_DATE} {YEAR}, {TIME}}
                                }}
                        }`,
        END_DATETIME: `Конец дата-время: {
                            SAME_DAY,
                            select,
                                yes{{
                                    CURRENT_YEAR,
                                    select,
                                        yes{{TIME}, {SHORT_DATE}}
                                        other{{TIME}, {SHORT_DATE} {YEAR}}
                                }}
                                other{{
                                    CURRENT_YEAR,
                                    select,
                                        yes{{SHORT_DATE}, {TIME}}
                                        other{{SHORT_DATE} {YEAR}, {TIME}}
                                }}
                        }`,
        DATETIME: `Дата время: {
                        SAME_DAY,
                        select,
                            yes{{START_DATETIME}{DASH}{END_DATETIME}}
                            other{{START_DATETIME}{LONG_DASH}{END_DATETIME}}
                    }`
    };

    constructor(
        @Inject(DateAdapter) public dateAdapter: DateAdapter<Moment>
    ) {}
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
