import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McDropdownModule } from '@ptsecurity/mosaic/dropdown';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McLinkModule } from '@ptsecurity/mosaic/link';


@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent {
    someValue = 'Lazy Value';
}

@NgModule({
    declarations: [
        DemoComponent
    ],
    imports: [
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        McLinkModule,
        McIconModule,
        McButtonModule,
        McDropdownModule
    ],
    bootstrap: [
        DemoComponent
    ]
})
export class DemoModule {}
