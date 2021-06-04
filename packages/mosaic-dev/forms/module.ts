/* tslint:disable:no-console no-reserved-keywords */
import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { McFormsModule } from '@ptsecurity/mosaic/core';
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
        McFormFieldModule,
        McFormsModule
    ],
    bootstrap: [DemoComponent]
})
export class DemoModule {}
