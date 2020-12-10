// tslint:disable:no-console no-magic-numbers
import {
    AfterViewInit,
    Component,
    NgModule,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DateAdapter, MC_DATE_FORMATS, MC_DATE_LOCALE } from '@ptsecurity/cdk/datetime';
import {
    MC_MOMENT_DATE_ADAPTER_OPTIONS,
    MC_MOMENT_DATE_FORMATS,
    McMomentDateModule,
    MomentDateAdapter
} from '@ptsecurity/mosaic-moment-adapter/adapter';
import { McDatepicker, McDatepickerModule } from '@ptsecurity/mosaic/datepicker';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McInputModule } from '@ptsecurity/mosaic/input';

// Depending on whether rollup is used, moment needs to be imported differently.
// Since Moment.js doesn't have a default export, we normally need to import using the `* as`
// syntax. However, rollup creates a synthetic default module and we thus need to import it using
// the `default as` syntax.
// tslint:disable-next-line:ordered-imports
import * as _moment from 'moment';
// @ts-ignore
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment, Moment } from 'moment';


const moment = _rollupMoment || _moment;

@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [
        { provide: MC_DATE_LOCALE, useValue: 'en' },
        { provide: MC_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { findDateFormat: true } },
        {
            provide: MC_DATE_FORMATS,
            useFactory: () => {
                const dateFormats: any = { ...MC_MOMENT_DATE_FORMATS };

                dateFormats.display.dateInput = 'DD.MM.YYYY';

                return dateFormats;
            }
        },
        {
            provide: DateAdapter,
            useFactory: (locale: string) => {
                const dateAdapter = new MomentDateAdapter(locale);
                dateAdapter.updateLocaleData({ firstDayOfWeek: 1 });

                return dateAdapter;
            },
            deps: [MC_DATE_LOCALE, MC_MOMENT_DATE_ADAPTER_OPTIONS]
        }
    ]
})
export class DemoComponent implements AfterViewInit {
    date = moment([2019, 0, 24]);
    minDate = moment([2015, 0, 1]);
    maxDate = moment([2020, 0, 1]);

    @ViewChild(McDatepicker) datepicker: McDatepicker<any>;

    myFilter(date: Moment): boolean {
        const day = date.day();

        return day !== 0 && day !== 6;
    }

    ngAfterViewInit(): void {
        this.datepicker.selectedChanged
            .subscribe(() => {
                console.log('this.datepicker.selectedChanged');
            });

        this.datepicker.datepickerInput.dateInput
            .subscribe(() => {
                console.log('this.datepickerInput.dateInput');
            });
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
