// tslint:disable:no-console
import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ThemePalette } from '@ptsecurity/mosaic/core';

import { McIconModule } from '../../mosaic/icon/';


@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent {
    themePalette = ThemePalette;
}


@NgModule({
    declarations: [
        DemoComponent
    ],
    imports: [
        BrowserModule,
        McIconModule
    ],
    bootstrap: [
        DemoComponent
    ]
})
export class DemoModule {}
