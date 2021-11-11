// tslint:disable:no-console
import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { ThemePalette } from '@ptsecurity/mosaic/core';
import { McIconModule } from '@ptsecurity/mosaic/icon';


@Component({
    selector: 'app',
    templateUrl: 'template.html',
    styleUrls: ['../main.scss', 'styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ButtonDemoComponent {
    themePalette = ThemePalette;
}


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
export class DemoModule {}
