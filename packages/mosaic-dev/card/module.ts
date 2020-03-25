import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { McCardModule } from '../../mosaic/card';


@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class CardsDemoComponent {

    s1 = false;
    s2 = false;
    s3 = false;
    s4 = false;
}


@NgModule({
    declarations: [CardsDemoComponent],
    imports: [
        BrowserModule,
        McCardModule
    ],
    bootstrap: [CardsDemoComponent]
})
export class DemoModule {}
