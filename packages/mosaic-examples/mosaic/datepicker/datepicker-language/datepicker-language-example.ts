import { Component, OnInit } from '@angular/core';
import { DateAdapter } from '@ptsecurity/cdk/datetime';
import { McRadioChange } from '@ptsecurity/mosaic/radio';


enum Languages {
    EN = 'en',
    DE = 'de',
    FR = 'fr',
    RU = 'ru'
}
/**
 * @title Multy language datepicker
 */
@Component({
    selector: 'datepicker-language-example',
    templateUrl: 'datepicker-language-example.html',
    styleUrls: ['datepicker-language-example.css']
})
export class DatepickerLanguageExample  implements OnInit {
    selectedDate: Date = new Date();
    languageList: string[] = [];

    constructor(private dateAdapter: DateAdapter<any>) {}

    ngOnInit() {
        this.languageList = Object.keys(Languages).filter(String);
        this.dateAdapter.setLocale(this.languageList[0]);
    }

    useLanguage($event: McRadioChange): void {
        this.dateAdapter.setLocale($event.value);
    }
}
