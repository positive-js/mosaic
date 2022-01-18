// tslint:disable:no-console
import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { ThemePalette } from '@ptsecurity/mosaic/core';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McToolTipModule } from '@ptsecurity/mosaic/tooltip';


@Component({
    selector: 'app',
    templateUrl: 'template.html',
    styleUrls: ['../main.scss', 'styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ButtonDemoComponent {
    themePalette = ThemePalette;

    disabledState = false;

    onClick() {
        console.log('onClick: ');
    }
}


@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        McButtonModule,
        McIconModule,
        McToolTipModule
    ],
    declarations: [
        ButtonDemoComponent
    ],
    entryComponents: [ ButtonDemoComponent ],
    bootstrap: [ ButtonDemoComponent ]
})
export class DemoModule {}
