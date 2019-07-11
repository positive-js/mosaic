import {
    Component,
    NgModule,
    ViewEncapsulation
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { McMomentDateModule } from '@ptsecurity/mosaic-moment-adapter/adapter';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McTimepickerModule } from '@ptsecurity/mosaic/timepicker';

import { McButtonModule } from '../../mosaic/button';
import { McIconModule } from '../../mosaic/icon';

// Depending on whether rollup is used, moment needs to be imported differently.
// Since Moment.js doesn't have a default export, we normally need to import using the `* as`
// syntax. However, rollup creates a synthetic default module and we thus need to import it using
// the `default as` syntax.
// tslint:disable-next-line:ordered-imports
import * as _moment from 'moment';
// @ts-ignore
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment, Moment } from 'moment';


const moment = _rollupMoment || _moment;

@Component({
    selector: 'app',
    styleUrls: ['./styles.css'],
    template: require('./template.html'),
    encapsulation: ViewEncapsulation.None
})
export class TimepickerDemoComponent {
    timeValue1: Moment = moment();
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
        McIconModule,
        McMomentDateModule
    ],
    bootstrap: [
        TimepickerDemoComponent
    ]
})
export class TimepickerDemoModule {}


platformBrowserDynamic()
    .bootstrapModule(TimepickerDemoModule)
    .catch((error) => console.error(error)); // tslint:disable-line no-console
