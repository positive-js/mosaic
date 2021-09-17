/* tslint:disable:match-default-export-name */
// tslint:disable:no-console no-magic-numbers
import { registerLocaleData } from '@angular/common';
import de from '@angular/common/locales/de';
import {
    AfterViewInit,
    Component,
    Inject,
    NgModule,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DateAdapter, MC_DATE_FORMATS, MC_DATE_LOCALE, McDateFormats } from '@ptsecurity/cdk/datetime';
import {
    MC_LUXON_DATE_FORMATS,
    McLuxonDateModule,
    LuxonDateAdapter
} from '@ptsecurity/mosaic-luxon-adapter/adapter';
import { McDatepicker, McDatepickerModule } from '@ptsecurity/mosaic/datepicker';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McInputModule } from '@ptsecurity/mosaic/input';
import { McRadioChange, McRadioModule } from '@ptsecurity/mosaic/radio';
import { McToolTipModule } from '@ptsecurity/mosaic/tooltip';
import { DateTime } from 'luxon';


registerLocaleData(de);


@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [
        { provide: MC_DATE_LOCALE, useValue: 'en' },
        {
            provide: MC_DATE_FORMATS,
            useFactory: () => ({ ...MC_LUXON_DATE_FORMATS, dateInput: 'dd/MM/yyyy' })
        },
        {
            provide: DateAdapter,
            useFactory: (locale: string) => new LuxonDateAdapter(locale),
            deps: [MC_DATE_LOCALE]
        }
    ]
})
export class DemoComponent implements AfterViewInit {
    date = null;
    formControlValue: FormControl;
    minDate;
    maxDate;

    languageList = [
        { name: 'en', format: 'dd/MM/yyyy', placeholder: 'дд/мм/гггг' },
        { name: 'de', format: 'dd-MM-yyyy', placeholder: 'дд-мм-гггг' },
        { name: 'ru', format: 'dd.MM.yyyy', placeholder: 'дд.мм.гггг' }
    ];
    selectedLanguage: any = this.languageList[0];

    @ViewChild(McDatepicker) datepicker: McDatepicker<any>;

    constructor(
        private adapter: DateAdapter<DateTime>,
        @Inject(MC_DATE_FORMATS) private readonly dateFormats: McDateFormats
    ) {
        this.formControlValue = new FormControl(this.adapter.createDateTime(2021, 8, 11, 12, 0, 0, 0));
        this.formControlValue.valueChanges
            .subscribe((value) => {
                console.log('this.formControlValue.valueChanges: ', value?.toString());
            });

        this.minDate = this.adapter.createDate(2015, 1, 1);
        this.maxDate = this.adapter.createDate(2020, 1, 1);
    }

    ngOnInit() {
        this.adapter.setLocale(this.languageList[0].name);
    }

    setFormat($event: McRadioChange): void {
        this.dateFormats.dateInput = $event.value.format;
        this.selectedLanguage = this.languageList.find(({ name }) => name === $event.value.name);

        this.formControlValue.setValue(this.formControlValue.value);
        this.adapter.setLocale($event.value.name);
    }

    myFilter(date: DateTime): boolean {
        const day = date.day;

        return day !== 0 && day !== 6;
    }

    ngAfterViewInit(): void {
        this.datepicker.selectedChanged
            .subscribe(() => {
                console.log('this.datepicker.selectedChanged');
            });
    }

    onDateChange() {
        console.log('onDateChange: '); // tslint:disable-line:no-console
    }
}

@NgModule({
    declarations: [DemoComponent],
    imports: [
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        McFormFieldModule,
        McToolTipModule,
        McDatepickerModule,
        McLuxonDateModule,
        McInputModule,
        McIconModule,
        McRadioModule
    ],
    bootstrap: [DemoComponent]
})
export class DemoModule {}
