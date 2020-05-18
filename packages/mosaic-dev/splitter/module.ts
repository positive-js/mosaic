// tslint:disable:no-console
import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { McButtonModule } from '@ptsecurity/mosaic/button';

import { McSplitterModule } from '../../mosaic/splitter';


@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent {
    guttersVisibility = true;

    toggleVisibility() {
        this.guttersVisibility = !this.guttersVisibility;
    }
}


@NgModule({
    declarations: [
        DemoComponent
    ],
    imports: [
        BrowserModule,
        McButtonModule,
        McSplitterModule
    ],
    bootstrap: [
        DemoComponent
    ]
})
export class DemoModule {}
