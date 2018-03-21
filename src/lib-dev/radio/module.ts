import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import {FormsModule} from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { McRadioModule } from '../../lib/radio';
import {ThemePickerModule} from '../theme-picker';


/* tslint:disable:no-trailing-whitespace */
@Component({
    selector: 'app',
    styleUrls: ['theme.css'],
    encapsulation: ViewEncapsulation.None,
    template: `

        <theme-picker></theme-picker>
        <br/><br/>

        <mc-radio-group class="example-radio-group" [(ngModel)]="favoriteFruit">
            <mc-radio-button class="example-radio-button" *ngFor="let season of fruits" [value]="season">
                {{season}}
            </mc-radio-button>
        </mc-radio-group>

        <br/><br/>
        <div class="example-selected-value">Your favorite fruit is: {{favoriteFruit}}</div>
    `
})
export class DemoComponent {
    favoriteFruit: string;

    fruits = [
        'Apple',
        'Banana',
        'Tomato',
        'Крякать как уточка'
    ];
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

platformBrowserDynamic()
    .bootstrapModule(DemoModule)
    .catch((error) => console.error(error));
