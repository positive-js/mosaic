/* tslint:disable:no-magic-numbers */
import { registerLocaleData } from '@angular/common';
import de from '@angular/common/locales/de';
import { Component, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DateAdapter, MC_DATE_FORMATS, McDateFormats } from '@ptsecurity/cdk/datetime';
import { MC_LUXON_DATE_FORMATS } from '@ptsecurity/mosaic-luxon-adapter/adapter';
import { McRadioChange } from '@ptsecurity/mosaic/radio';


export function mcDateFormatsFactory() {
    const dateFormats = { ...MC_LUXON_DATE_FORMATS } as unknown as McDateFormats;

    dateFormats.dateInput = 'dd.MM.yyyy';

    return dateFormats;
}

registerLocaleData(de);


/**
 * @title Multy language datepicker
 */
@Component({
    selector: 'datepicker-language-example',
    templateUrl: 'datepicker-language-example.html',
    styleUrls: ['datepicker-language-example.css'],
    providers: [{
        provide: MC_DATE_FORMATS,
        useFactory: mcDateFormatsFactory
    }]
})
export class DatepickerLanguageExample {
    selectedDate: FormControl;
    languageList = [
        { name: 'en', format: 'dd/MM/yyyy', placeholder: 'дд/мм/гггг' },
        { name: 'de', format: 'dd-MM-yyyy', placeholder: 'дд-мм-гггг' },
        { name: 'ru', format: 'dd.MM.yyyy', placeholder: 'дд.мм.гггг' }
    ];

    selectedLanguage: any = this.languageList[0];

    constructor(
        private adapter: DateAdapter<any>,
        @Inject(MC_DATE_FORMATS) private dateFormats: McDateFormats
    ) {
        this.selectedDate = new FormControl(this.adapter.createDateTime(2020, 5, 6, 12, 0, 0, 0));
    }

    ngOnInit() {
        this.adapter.setLocale(this.languageList[0].name);
    }

    setFormat($event: McRadioChange): void {
        this.dateFormats.dateInput = $event.value.format;
        this.selectedLanguage = this.languageList.find(({ name }) => name === $event.value.name);

        this.selectedDate.setValue(this.selectedDate.value);
        this.adapter.setLocale($event.value.name);
    }
}
