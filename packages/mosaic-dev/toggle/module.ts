// tslint:disable:no-console
import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ThemePalette } from '@ptsecurity/mosaic/core';

import { McButtonModule } from '../../mosaic/button/';
import { McToggleModule } from '../../mosaic/toggle/';


@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent {
    themePalette = ThemePalette;

    valueSmallOff: boolean = false;
    valueSmallOn: boolean = true;

    valueBigOff: boolean = false;
    valueBigOn: boolean = true;

    disabled: boolean = false;

    toggleControl = new FormControl(true);

    constructor() {
        // tslint:disable-next-line
        this.toggleControl.valueChanges.subscribe(console.log);
    }
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
        McButtonModule,
        ReactiveFormsModule
    ],
    bootstrap: [
        DemoComponent
    ]
})
export class DemoModule {}
