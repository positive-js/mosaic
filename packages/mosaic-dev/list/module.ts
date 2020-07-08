// tslint:disable:no-console
import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { McCheckboxModule } from '@ptsecurity/mosaic/checkbox';
import { McListModule, McListSelectionChange } from '@ptsecurity/mosaic/list';


@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent {
    typesOfShoes = ['Boots', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers'];
    multipleSelected = ['Boots', 'Clogs'];
    multipleSelectedCheckbox = [];
    singleSelected = [];

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

    onSelectionChange($event: McListSelectionChange) {
        console.log(`onSelectionChange: ${$event.option.value}`);
    }
}


@NgModule({
    declarations: [
        DemoComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        McCheckboxModule,
        McListModule
    ],
    bootstrap: [
        DemoComponent
    ]
})
export class DemoModule {}
