/* tslint:disable:no-console no-reserved-keywords */
import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McInputModule } from '@ptsecurity/mosaic/input';


@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent {
    value = '';
}


@NgModule({
    declarations: [DemoComponent],
    imports: [
        BrowserModule,
        FormsModule,
        McInputModule,
        McFormFieldModule
    ],
    bootstrap: [DemoComponent]
})
export class DemoModule {}
