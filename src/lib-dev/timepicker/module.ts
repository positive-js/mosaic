import {
    Component,
    NgModule,
    ViewEncapsulation
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McTimepickerModule } from '@ptsecurity/mosaic/timepicker';

import { McButtonModule } from '../../lib/button';
import { McIconModule } from '../../lib/icon';


@Component({
    selector: 'app',
    styleUrls: ['./styles.css'],
    template: require('./template.html'),
    encapsulation: ViewEncapsulation.None
})
export class TimepickerDemoComponent {
    timeValue1: Date = new Date();
    timeValue2: Date = new Date();
    isDisabled: boolean = false;

    toggleDisable() {
        this.isDisabled = !this.isDisabled;
    }
}

@NgModule({
    declarations: [
        TimepickerDemoComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        McTimepickerModule,
        McFormFieldModule,
        McButtonModule,
        McIconModule
    ],
    bootstrap: [
        TimepickerDemoComponent
    ]
})
export class TimepickerDemoModule {}


platformBrowserDynamic()
    .bootstrapModule(TimepickerDemoModule)
    .catch((error) => console.error(error)); // tslint:disable-line no-console
