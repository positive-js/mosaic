import { Component, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MC_DATE_FORMATS, McDateFormats } from '@ptsecurity/cdk/datetime';
import { McRadioChange } from '@ptsecurity/mosaic/radio';
import * as _moment from 'moment';
// @ts-ignore
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment, Moment } from 'moment';


const moment = _rollupMoment || _moment;


/**
 * @title Multy language datepicker
 */
@Component({
    selector: 'datepicker-language-example',
    templateUrl: 'datepicker-language-example.html',
    styleUrls: ['datepicker-language-example.css']
})
export class DatepickerLanguageExample {
    selectedDate = new FormControl(moment('2020-05-06 12:00:00'));
    languageList = [
        { name: 'EN', format: 'DD/MM/YYYY' },
        { name: 'DE', format: 'DD-MM-YYYY' },
        { name: 'FR', format: 'DD/MM/YYYY' },
        { name: 'RU', format: 'DD.MM.YYYY' }
    ];
    selectedLanguage = 'EN';

    constructor(@Inject(MC_DATE_FORMATS) private dateFormats: McDateFormats) {}

    setFormat($event: McRadioChange): void {
        this.dateFormats.dateInput = $event.value.format;
        this.selectedLanguage = $event.value.name;

        this.selectedDate.setValue(this.selectedDate.value);
    }
}
