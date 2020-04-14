import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { McIconModule } from '@ptsecurity/mosaic/icon';

import { McButtonModule } from '../../mosaic/button';
import { McButtonToggleModule } from '../../mosaic/button-toggle';


@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ButtonToggleDemoComponent {
    modelResult: any;
    disabled: boolean;
}


@NgModule({
    declarations: [
        ButtonToggleDemoComponent
    ],
    imports: [
        BrowserModule,
        McButtonModule,
        McButtonToggleModule,
        McIconModule,
        FormsModule
    ],
    bootstrap: [
        ButtonToggleDemoComponent
    ]
})
export class DemoModule {}

