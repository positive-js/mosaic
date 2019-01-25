// tslint:disable:no-console
// tslint:disable:no-magic-numbers
import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DateAdapter, MC_DATE_FORMATS, MC_DATE_LOCALE } from '@ptsecurity/cdk/datetime';
import {
    MosaicDateAdapter,
    McMosaicDateModule,
    MC_MOSAIC_DATE_FORMATS,
    MC_DATE_FORMATTER_CONFIGS_SET
} from '@ptsecurity/mosaic-moment-adapter/adapter';
import { McDatepickerModule } from '@ptsecurity/mosaic/datepicker';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McInputModule } from '@ptsecurity/mosaic/input';


@Component({
    selector: 'app',
    template: require('./template.html'),
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [
        {provide: MC_DATE_LOCALE, useValue: 'ru-RU'},
        {provide: DateAdapter, useClass: MosaicDateAdapter, deps: [MC_DATE_LOCALE, MC_DATE_FORMATTER_CONFIGS_SET]},
        {provide: MC_DATE_FORMATS, useValue: MC_MOSAIC_DATE_FORMATS}
    ]
})
export class DemoComponent {
    date = new Date(2019, 0, 24);
    minDate = new Date(2015, 0, 1);
    maxDate = new Date(2020, 0, 1);

    myFilter(d: Date): boolean {
        const day = d.getDay();

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
        McMosaicDateModule,
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
