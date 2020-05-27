// tslint:disable:no-console
import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { McTableModule } from '@ptsecurity/mosaic/table';


@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent {}


@NgModule({
    declarations: [DemoComponent],
    imports: [
        BrowserModule,
        McTableModule
    ],
    bootstrap: [DemoComponent]
})
export class DemoModule {}
