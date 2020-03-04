// tslint:disable:no-console
import { Component, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McIconModule } from '@ptsecurity/mosaic/icon';


@Component({
    selector: 'app',
    templateUrl: 'template.html',
    styleUrls: ['styles.scss']
})
export class ButtonDemoComponent {}


@NgModule({
    imports: [
        BrowserModule,
        McButtonModule,
        McIconModule
    ],
    declarations: [
        ButtonDemoComponent
    ],
    entryComponents: [ ButtonDemoComponent ],
    bootstrap: [ ButtonDemoComponent ]
})
export class ButtonDemoModule {}
