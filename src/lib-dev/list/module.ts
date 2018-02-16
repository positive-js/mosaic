import { Component, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { McListModule } from '../../lib/list';


@Component({
    selector: 'app',
    templateUrl: './component.html',
    styleUrls: ['./theme.scss']
})
export class DemoComponent {
    folders = [
        {
            name: 'Photos',
            updated: new Date('1/1/16')
        },
        {
            name: 'Recipes',
            updated: new Date('1/17/16')
        },
        {
            name: 'Work',
            updated: new Date('1/28/16')
        }
    ];
    notes = [
        {
            name: 'Vacation Itinerary',
            updated: new Date('2/20/16')
        },
        {
            name: 'Kitchen Remodel',
            updated: new Date('1/18/16')
        }
    ];
}


@NgModule({
    declarations: [
        DemoComponent
    ],
    imports: [
        BrowserModule,
        McListModule
    ],
    bootstrap: [
        DemoComponent
    ]
})
export class DemoModule {}

platformBrowserDynamic()
    .bootstrapModule(DemoModule)
    .catch((error) => console.error(error));

