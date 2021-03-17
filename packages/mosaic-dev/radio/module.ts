// tslint:disable:no-console
import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { McRadioChange, McRadioModule } from '@ptsecurity/mosaic/radio';

import { ThemePickerModule } from '../theme-picker';


@Component({
    selector: 'app',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None,
    templateUrl: './template.html'
})
export class DemoComponent {
    favoriteFruit: string;

    isDisabled: boolean = true;

    fruits = [
        'Apple',
        'Banana',
        'Tomato',
        'Крякать как уточка'
    ];

    selectionList = [
        {name: 'Yes', value: 'true', selected: false},
        {name: 'No', value: 'false', selected: true}
    ];

    onChange($event: McRadioChange) {
        console.log('McRadioChange: ', $event);
    }
}

@NgModule({
    declarations: [
        DemoComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        McRadioModule,
        ThemePickerModule
    ],
    bootstrap: [
        DemoComponent
    ]
})
export class DemoModule {}
