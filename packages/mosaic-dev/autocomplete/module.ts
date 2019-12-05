// tslint:disable:no-console
import { Component, NgModule, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { McAutocompleteModule, McAutocompleteSelectedEvent } from '@ptsecurity/mosaic/autocomplete';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McInputModule } from '@ptsecurity/mosaic/input';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';


@Component({
    selector: 'app',
    template: require('./template.html'),
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent implements OnInit {
    options = [
        'One', 'Two', 'Three', 'Four', 'Five', 'Longest text (0123456789 qwertyuiopasdfghjklzxcvbnm)', 'Волгоград',
        'Воронеж', 'Ейск', 'Екабпилс', 'Екатеринбург', 'Екатериновка', 'Екатеринославка', 'Екаша', 'Екибастуз',
        'Екпинди', 'Елань', 'Елец', 'Казань', 'Краснодар', 'Красноярск', 'Москва', 'Нижний Новгород', 'Новосибирск',
        'Омск', 'Пермь', 'Ростов-на-Дону',  'Самара', 'Санкт-Петербург', 'Уфа', 'Челябинск'
    ];

    filteredOptions: Observable<string[]>;

    formControl = new FormControl('', Validators.required);

    onSelectionChange($event: McAutocompleteSelectedEvent) {
        console.log(`onSelectionChange: ${$event}`);
    }

    ngOnInit(): void {
        this.filteredOptions = this.formControl.valueChanges
            .pipe(
                startWith(''),
                map((value) => this.filter(value))
            );
    }

    private filter(value: string): string[] {
        const filterValue = value.toLowerCase();

        return this.options.filter((option) => option.toLowerCase().includes(filterValue));
    }
}


@NgModule({
    declarations: [DemoComponent],
    imports: [
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        McAutocompleteModule,

        McInputModule,
        McButtonModule,
        McFormFieldModule,
        McIconModule,
        ReactiveFormsModule
    ],
    bootstrap: [DemoComponent]
})
export class DemoModule {}

platformBrowserDynamic()
    .bootstrapModule(DemoModule)
    .catch((error) => console.error(error));

