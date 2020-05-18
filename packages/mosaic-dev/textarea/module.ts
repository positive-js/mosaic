import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { McTextareaModule } from '@ptsecurity/mosaic/textarea';

import { McFormFieldModule } from '../../mosaic/form-field';


@Component({
    selector: 'app',
    templateUrl: './template.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['../main.scss', './styles.scss']
})
export class DemoComponent {
    value: string;
}


@NgModule({
    declarations: [
        DemoComponent
    ],
    imports: [
        BrowserModule,
        McTextareaModule,
        McFormFieldModule,
        FormsModule
    ],
    bootstrap: [
        DemoComponent
    ]
})
export class DemoModule {}
