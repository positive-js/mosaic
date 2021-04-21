import { Component, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MC_DATE_FORMATS, McDateFormats } from '@ptsecurity/cdk/datetime';
import { MC_MOMENT_DATE_FORMATS } from '@ptsecurity/mosaic-moment-adapter/adapter';
import { McRadioChange } from '@ptsecurity/mosaic/radio';
import * as _moment from 'moment';
// @ts-ignore
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment, Moment } from 'moment';


const moment = _rollupMoment || _moment;

export function mcDateFormatsFactory() {
    const dateFormats = { ...MC_MOMENT_DATE_FORMATS } as unknown as McDateFormats;

    dateFormats.dateInput = 'DD.MM.YYYY';

    return dateFormats;
}


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
    selectedDate = new FormControl(moment('2020-05-06 12:00:00'));
    languageList = [
        { name: 'EN', format: 'DD/MM/YYYY', placeholder: 'дд/мм/гггг' },
        { name: 'DE', format: 'DD-MM-YYYY', placeholder: 'дд-мм-гггг' },
        { name: 'RU', format: 'DD.MM.YYYY', placeholder: 'дд.мм.гггг' }
    ];

    selectedLanguage: any = this.languageList[0];

    constructor(@Inject(MC_DATE_FORMATS) private dateFormats: McDateFormats) {}

    setFormat($event: McRadioChange): void {
        this.dateFormats.dateInput = $event.value.format;
        this.selectedLanguage = this.languageList.find(({ name }) => name === $event.value.name);

        this.selectedDate.setValue(this.selectedDate.value);
    }
}
