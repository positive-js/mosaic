// tslint:disable:no-console
import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { McButtonModule } from '../../mosaic/button/';
import { McToggleModule } from '../../mosaic/toggle/';


@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent {
    valueSmallOff: boolean = false;
    valueSmallOn: boolean = true;

    valueBigOff: boolean = false;
    valueBigOn: boolean = true;

    disabled: boolean = false;
}


@NgModule({
    declarations: [
        DemoComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        McToggleModule,
        McButtonModule
    ],
    bootstrap: [
        DemoComponent
    ]
})
export class DemoModule {}
