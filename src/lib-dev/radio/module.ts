import { Component, NgModule } from '@angular/core';
import {FormsModule} from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { McRadioModule } from '../../lib/radio';


@Component({
    selector: 'app',
    template: `
        <mc-radio-group>
            <mc-radio-button value="1">Option 1</mc-radio-button>
            <mc-radio-button value="2">Option 2</mc-radio-button>
        </mc-radio-group>

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
        'Blackberry'
    ];
}

@NgModule({
    declarations: [
        DemoComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        McRadioModule
    ],
    bootstrap: [
        DemoComponent
    ]
})
export class DemoModule {}

platformBrowserDynamic()
    .bootstrapModule(DemoModule)
    .catch((error) => console.error(error));
